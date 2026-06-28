import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedFixture, ExtractionResult } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const VISION_MODEL = process.env.ANTHROPIC_VISION_MODEL || 'claude-sonnet-4-6'

export function buildExtractionPrompt(clubName: string, sport: string): string {
  return `You are a sports data extraction assistant for ClubSports, a Swedish sports club platform.

Analyze the uploaded image and extract ALL matches/fixtures visible — not just the first one.
The image may contain a full season schedule, results table, cricket fixture list, league sheet, or tournament bracket with many rows.

Club context:
- Club name: ${clubName}
- Sport: ${sport.replace('_', ' ')}
- Include every row/match where ${clubName} appears OR that belongs to the club's league/competition shown.
- If the image lists 10 matches, return all 10. Do not stop after the first match.

Rules:
1. Use team names exactly as shown (preserve Swedish characters å, ä, ö).
2. Dates must be ISO format YYYY-MM-DD. If only day/month visible, infer year from context or use ${new Date().getFullYear()}.
3. Times use 24h format HH:MM or null.
4. Scores are integers or null if match not yet played / not visible.
5. Set is_played=true only when final scores are visible; otherwise false.
6. For cricket, extract runs from "245/6" style — use runs as score (number before slash).
7. Return confidence 0.0–1.0 for the overall extraction quality.
8. Read top-to-bottom, left-to-right. Each distinct fixture row = one match entry.

Return ONLY valid JSON, no markdown:
{
  "matches": [
    {
      "home_team": "string",
      "away_team": "string",
      "match_date": "YYYY-MM-DD",
      "match_time": "HH:MM or null",
      "venue": "string or null",
      "home_score": number or null,
      "away_score": number or null,
      "competition": "string or null",
      "is_played": boolean
    }
  ],
  "total_matches": number,
  "confidence": number,
  "notes": "brief note if anything was unclear or inferred"
}`
}

interface RawMatch extends Partial<ExtractedFixture> {
  notes?: string
}

interface RawMultiExtraction {
  matches?: RawMatch[]
  total_matches?: number
  confidence?: number
  notes?: string
  // legacy single-match format
  home_team?: string
  away_team?: string
  match_date?: string
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function normalizeDate(raw: string): string | null {
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const d = new Date(raw)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  return null
}

function normalizeTime(raw: string | null | undefined): string | null {
  if (!raw) return null
  const m = raw.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return null
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

function parseScore(v: unknown): number | null {
  if (v == null) return null
  if (typeof v === 'number' && !isNaN(v)) return Math.max(0, Math.floor(v))
  if (typeof v === 'string') {
    const cricket = v.match(/^(\d+)/)
    if (cricket) return parseInt(cricket[1], 10)
    const n = parseInt(v, 10)
    return isNaN(n) ? null : Math.max(0, n)
  }
  return null
}

function normalizeMatch(raw: RawMatch, clubName: string): ExtractedFixture | null {
  const home = String(raw.home_team || '').trim()
  const away = String(raw.away_team || '').trim()
  const date = normalizeDate(String(raw.match_date || ''))

  if (!home || !away || !date) return null

  const homeScore = parseScore(raw.home_score)
  const awayScore = parseScore(raw.away_score)
  const isPlayed = raw.is_played ?? (homeScore != null && awayScore != null)

  return {
    home_team: home,
    away_team: away,
    match_date: date,
    match_time: normalizeTime(raw.match_time),
    venue: raw.venue ? String(raw.venue).trim() : null,
    home_score: isPlayed ? homeScore : null,
    away_score: isPlayed ? awayScore : null,
    competition: raw.competition ? String(raw.competition).trim() : null,
    is_played: isPlayed,
    is_home_game: home.toLowerCase() === clubName.toLowerCase() || home.includes(clubName),
    extraction_notes: null,
  }
}

function collectRawMatches(parsed: RawMultiExtraction): RawMatch[] {
  if (Array.isArray(parsed.matches) && parsed.matches.length > 0) {
    return parsed.matches
  }
  if (parsed.home_team && parsed.away_team) {
    return [parsed as RawMatch]
  }
  return []
}

function validateAndNormalizeMulti(parsed: RawMultiExtraction, clubName: string): ExtractionResult {
  const rawList = collectRawMatches(parsed)
  const matches: ExtractedFixture[] = []

  for (const raw of rawList) {
    const m = normalizeMatch(raw, clubName)
    if (m) matches.push(m)
  }

  if (matches.length === 0) {
    throw new Error('Kunde inte identifiera några matcher — använd en tydligare bild med lag och datum')
  }

  return {
    matches,
    total_matches: matches.length,
    confidence: clamp(parsed.confidence ?? 0.5),
    notes: parsed.notes ?? null,
  }
}

export async function extractFixturesFromImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
  context: { clubName: string; sport: string }
): Promise<ExtractionResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY saknas — AI-extrahering ej tillgänglig')
  }

  const response = await anthropic.messages.create({
    model: VISION_MODEL,
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: imageBase64 },
        },
        { type: 'text', text: buildExtractionPrompt(context.clubName, context.sport) },
      ],
    }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Ingen data extraherades från bilden — försök med en tydligare bild')
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Kunde inte tolka AI-svar — bilden kanske inte innehåller matchdata')
  }

  let parsed: RawMultiExtraction
  try {
    parsed = JSON.parse(jsonMatch[0]) as RawMultiExtraction
  } catch {
    throw new Error('Ogiltigt AI-svar — försök igen med en annan bild')
  }

  return validateAndNormalizeMulti(parsed, context.clubName)
}

/** @deprecated use extractFixturesFromImage */
export async function extractFixtureFromImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
  context: { clubName: string; sport: string }
): Promise<ExtractionResult> {
  return extractFixturesFromImage(imageBase64, mediaType, context)
}

export function detectMediaType(mime: string): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | null {
  const map: Record<string, 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'> = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/webp': 'image/webp',
    'image/gif': 'image/gif',
  }
  return map[mime] ?? null
}

export function confidenceLabel(score: number): { label: string; color: string } {
  if (score >= 0.85) return { label: 'Hög säkerhet', color: '#22c55e' }
  if (score >= 0.6) return { label: 'Medel säkerhet', color: '#eab308' }
  return { label: 'Låg säkerhet — granska noggrant', color: '#ef4444' }
}
