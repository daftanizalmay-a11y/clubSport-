import type { SupabaseClient } from '@supabase/supabase-js'
import type { FixturePayload, ExtractedTableTeam } from './types'

export interface LeagueTableUpdateResult {
  updated: boolean
  updated_entries: Record<string, unknown>[]
}

export interface BatchTableSaveResult {
  updated: number
  created: number
  entries: Record<string, unknown>[]
}

function pointsForResult(goalsFor: number, goalsAgainst: number): { won: number; drawn: number; lost: number; points: number } {
  if (goalsFor > goalsAgainst) return { won: 1, drawn: 0, lost: 0, points: 3 }
  if (goalsFor === goalsAgainst) return { won: 0, drawn: 1, lost: 0, points: 1 }
  return { won: 0, drawn: 0, lost: 1, points: 0 }
}

async function ensureEntry(
  admin: SupabaseClient,
  tableId: string,
  clubId: string,
  teamName: string,
  isOurTeam: boolean
) {
  const { data: existing } = await admin
    .from('league_table_entries')
    .select('*')
    .eq('table_id', tableId)
    .eq('team_name', teamName)
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await admin
    .from('league_table_entries')
    .insert({
      table_id: tableId,
      club_id: clubId,
      team_name: teamName,
      played: 0, won: 0, drawn: 0, lost: 0,
      goals_for: 0, goals_against: 0, points: 0,
      is_our_team: isOurTeam,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return created
}

async function recalculateSortOrder(admin: SupabaseClient, tableId: string) {
  const { data: entries } = await admin
    .from('league_table_entries')
    .select('*')
    .eq('table_id', tableId)

  if (!entries?.length) return []

  const sorted = [...entries].sort((a, b) => {
    const gdA = a.goals_for - a.goals_against
    const gdB = b.goals_for - b.goals_against
    return b.points - a.points || gdB - gdA || b.goals_for - a.goals_for
  })

  for (let i = 0; i < sorted.length; i++) {
    await admin.from('league_table_entries').update({ sort_order: i + 1 }).eq('id', sorted[i].id)
    sorted[i] = { ...sorted[i], sort_order: i + 1 }
  }

  return sorted
}

export async function getActiveTableId(admin: SupabaseClient, clubId: string, tableId?: string | null): Promise<string | null> {
  if (tableId) return tableId
  const { data: tables } = await admin
    .from('league_tables')
    .select('id, is_active')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
  const active = tables?.find(t => t.is_active) || tables?.[0]
  return (active?.id as string) ?? null
}

export async function batchUpsertLeagueTableEntries(
  admin: SupabaseClient,
  tableId: string,
  clubId: string,
  clubName: string,
  teams: ExtractedTableTeam[]
): Promise<BatchTableSaveResult> {
  let updated = 0
  let created = 0

  for (const team of teams) {
    const { data: existing } = await admin
      .from('league_table_entries')
      .select('id')
      .eq('table_id', tableId)
      .eq('team_name', team.team_name)
      .maybeSingle()

    const row = {
      table_id: tableId,
      club_id: clubId,
      team_name: team.team_name,
      played: team.played,
      won: team.won,
      drawn: team.drawn,
      lost: team.lost,
      goals_for: team.goals_for,
      goals_against: team.goals_against,
      points: team.points,
      is_our_team: team.is_our_team ?? team.team_name === clubName,
    }

    if (existing) {
      const { error } = await admin.from('league_table_entries').update(row).eq('id', existing.id)
      if (error) throw new Error(error.message)
      updated++
    } else {
      const { error } = await admin.from('league_table_entries').insert(row)
      if (error) throw new Error(error.message)
      created++
    }
  }

  const entries = await recalculateSortOrder(admin, tableId)
  return { updated, created, entries }
}

export async function updateLeagueTableFromFixture(
  admin: SupabaseClient,
  clubId: string,
  clubName: string,
  sport: string,
  fixture: FixturePayload,
  tableId?: string | null
): Promise<LeagueTableUpdateResult> {
  void sport
  if (!fixture.is_played || fixture.home_score == null || fixture.away_score == null) {
    return { updated: false, updated_entries: [] }
  }

  let activeTableId = tableId
  if (!activeTableId) {
    const { data: tables } = await admin
      .from('league_tables')
      .select('id, is_active')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })

    const active = tables?.find(t => t.is_active) || tables?.[0]
    if (!active) return { updated: false, updated_entries: [] }
    activeTableId = active.id as string
  }

  const homeEntry = await ensureEntry(admin, activeTableId, clubId, fixture.home_team, fixture.home_team === clubName)
  const awayEntry = await ensureEntry(admin, activeTableId, clubId, fixture.away_team, fixture.away_team === clubName)

  const homeResult = pointsForResult(fixture.home_score, fixture.away_score)
  const awayResult = pointsForResult(fixture.away_score, fixture.home_score)

  await admin.from('league_table_entries').update({
    played: homeEntry.played + 1,
    won: homeEntry.won + homeResult.won,
    drawn: homeEntry.drawn + homeResult.drawn,
    lost: homeEntry.lost + homeResult.lost,
    goals_for: homeEntry.goals_for + fixture.home_score,
    goals_against: homeEntry.goals_against + fixture.away_score,
    points: homeEntry.points + homeResult.points,
  }).eq('id', homeEntry.id)

  await admin.from('league_table_entries').update({
    played: awayEntry.played + 1,
    won: awayEntry.won + awayResult.won,
    drawn: awayEntry.drawn + awayResult.drawn,
    lost: awayEntry.lost + awayResult.lost,
    goals_for: awayEntry.goals_for + fixture.away_score,
    goals_against: awayEntry.goals_against + fixture.home_score,
    points: awayEntry.points + awayResult.points,
  }).eq('id', awayEntry.id)

  const updated_entries = await recalculateSortOrder(admin, activeTableId)
  return { updated: true, updated_entries }
}

export async function upsertFixture(
  admin: SupabaseClient,
  clubId: string,
  payload: FixturePayload,
  sourceId?: string | null,
  sourceType?: string | null
) {
  const row: Record<string, unknown> = {
    club_id: clubId,
    home_team: payload.home_team,
    away_team: payload.away_team,
    match_date: payload.match_date,
    match_time: payload.match_time ?? null,
    venue: payload.venue ?? null,
    competition: payload.competition ?? null,
    home_score: payload.home_score ?? null,
    away_score: payload.away_score ?? null,
    is_played: payload.is_played ?? (payload.home_score != null && payload.away_score != null),
    is_home_game: payload.is_home_game ?? true,
    notes: payload.notes ?? null,
    source_id: sourceId ?? null,
    source_type: sourceType ?? null,
    external_id: payload.external_id ?? null,
  }
  if (sourceType === 'image') {
    row.ai_extracted = true
    if (payload.extraction_confidence != null) {
      row.extraction_confidence = payload.extraction_confidence
    }
  }

  if (payload.external_id) {
    const { data: existing } = await admin
      .from('fixtures')
      .select('id')
      .eq('club_id', clubId)
      .eq('external_id', payload.external_id)
      .maybeSingle()

    if (existing) {
      const { data, error } = await admin.from('fixtures').update(row).eq('id', existing.id).select().single()
      if (error) throw new Error(error.message)
      return data
    }
  }

  const { data, error } = await admin.from('fixtures').insert(row).select().single()
  if (error) throw new Error(error.message)
  return data
}
