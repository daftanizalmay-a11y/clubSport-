import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedTableTeam, TableExtractionResult } from './types'
import { detectMediaType } from './vision'

export { detectMediaType }

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const VISION_MODEL = process.env.ANTHROPIC_VISION_MODEL || 'claude-sonnet-4-6'

export function buildLeagueTablePrompt(clubName: string, sport: string): string {
  return `You are a sports league table extraction assistant for ClubSports, a Swedish sports club platform.

Analyze the uploaded image and extract ALL teams visible in the league standings table — not just the first row.
The image may show a full league table, cricket points table, football standings, hockey tabell, or tournament ranking with 10+ teams.

Club context:
- Club name: ${clubName}
- Sport: ${sport.replace('_', ' ')}
- Mark is_our_team=true for rows matching "${clubName}" (or close abbreviation).
- Extract every team row top-to-bottom in table order.

Column mapping (adapt to what's visible):
- position: table rank (# column)
- team_name: full team/club name
- played (M): matches played
- won (V/W): wins
- drawn (O/D): draws
- lost (F/L): losses
- goals_for (GM/GF): goals scored
- goals_against (IM/GA): goals conceded
- points (P/Pts): total points

Rules:
1. Use team names exactly as shown (preserve å, ä, ö).
2. All stat fields must be non-negative integers. Use 0 if column missing.
3. If points not shown, calculate: won*3 + drawn*1 (standard football/cricket league).
4. If only W/D/L and GF/GA visible, derive played = won+drawn+lost.
5. Return confidence 0.0–1.0 for overall extraction quality.
6. Do not skip any team row. If 12 teams visible, return all 12.

Return ONLY valid JSON, no markdown:
{
  "teams": [
    {
      "position": number,
      "team_name": "string",
      "played": number,
      "won": number,
      "drawn": number,
      "lost": number,
      "goals_for": number,
      "goals_against": number,
      "points": number,
      "is_our_team": boolean
    }
  ],
  "total_teams": number,
  "confidence": number,
  "competition": "string or null",
  "season": "string or null",
  "notes": "brief note if anything was unclear"
}`
}

interface RawTeamRow extends Partial<ExtractedTableTeam> {
  team?: string
  name?: string
}

interface RawTableExtraction {
  teams?: RawTeamRow[]
  total_teams?: number
  confidence?: number
  competition?: string | null
  season?: string | null
  notes?: string | null
}

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function parseIntStat(v: unknown, fallback = 0): number {
  if (v == null) return fallback
  const n = typeof v === 'number' ? v : parseInt(String(v), 10)
  return isNaN(n) ? fallback : Math.max(0, Math.floor(n))
}

function normalizeTeam(raw: RawTeamRow, clubName: string, index: number): ExtractedTableTeam | null {
  const teamName = String(raw.team_name || raw.team || raw.name || '').trim()
  if (!teamName) return null

  let won = parseIntStat(raw.won)
  let drawn = parseIntStat(raw.drawn)
  let lost = parseIntStat(raw.lost)
  let played = parseIntStat(raw.played)
  const goalsFor = parseIntStat(raw.goals_for)
  const goalsAgainst = parseIntStat(raw.goals_against)
  let points = parseIntStat(raw.points)

  if (played === 0 && (won || drawn || lost)) played = won + drawn + lost
  if (points === 0 && played > 0) points = won * 3 + drawn

  const isOurTeam = raw.is_our_team ?? (
    teamName.toLowerCase() === clubName.toLowerCase() ||
    teamName.includes(clubName) ||
    clubName.includes(teamName)
  )

  return {
    team_name: teamName,
    position: raw.position != null ? parseIntStat(raw.position, index + 1) : index + 1,
    played,
    won,
    drawn,
    lost,
    goals_for: goalsFor,
    goals_against: goalsAgainst,
    points,
    is_our_team: isOurTeam,
  }
}

function validateAndNormalize(parsed: RawTableExtraction, clubName: string): TableExtractionResult {
  const rawList = parsed.teams ?? []
  const teams: ExtractedTableTeam[] = []

  for (let i = 0; i < rawList.length; i++) {
    const t = normalizeTeam(rawList[i], clubName, i)
    if (t) teams.push(t)
  }

  if (teams.length === 0) {
    throw new Error('Kunde inte identifiera några lag — använd en tydligare tabellbild')
  }

  return {
    teams,
    total_teams: teams.length,
    confidence: clamp(parsed.confidence ?? 0.5),
    competition: parsed.competition ?? null,
    season: parsed.season ?? null,
    notes: parsed.notes ?? null,
  }
}

export async function extractLeagueTableFromImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
  context: { clubName: string; sport: string }
): Promise<TableExtractionResult> {
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
        { type: 'text', text: buildLeagueTablePrompt(context.clubName, context.sport) },
      ],
    }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Ingen data extraherades från bilden — försök med en tydligare bild')
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Kunde inte tolka AI-svar — bilden kanske inte innehåller tabell-data')
  }

  let parsed: RawTableExtraction
  try {
    parsed = JSON.parse(jsonMatch[0]) as RawTableExtraction
  } catch {
    throw new Error('Ogiltigt AI-svar — försök igen med en annan bild')
  }

  return validateAndNormalize(parsed, context.clubName)
}
