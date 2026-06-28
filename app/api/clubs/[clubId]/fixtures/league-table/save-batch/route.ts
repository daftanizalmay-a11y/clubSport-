import { NextRequest, NextResponse } from 'next/server'
import { requireClubAdmin, getClubOrError } from '@/lib/fixtures/auth'
import { batchUpsertLeagueTableEntries, getActiveTableId } from '@/lib/fixtures/league-table'
import type { ExtractedTableTeam } from '@/lib/fixtures/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    const auth = await requireClubAdmin(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const clubResult = await getClubOrError(auth.admin, clubId)
    if ('error' in clubResult) {
      return NextResponse.json({ success: false, error: clubResult.error }, { status: clubResult.status })
    }
    const { club } = clubResult

    const body = await req.json()
    const teams = (body.teams ?? []) as ExtractedTableTeam[]
    const tableId = body.table_id as string | undefined

    if (!teams.length) {
      return NextResponse.json({ success: false, error: 'Inga lag att spara' }, { status: 400 })
    }

    for (let i = 0; i < teams.length; i++) {
      const t = teams[i]
      if (!t.team_name?.trim()) {
        return NextResponse.json({ success: false, error: `Rad ${i + 1}: Lagnamn saknas` }, { status: 400 })
      }
    }

    let activeTableId = await getActiveTableId(auth.admin, clubId, tableId)
    if (!activeTableId) {
      const { data: created, error } = await auth.admin
        .from('league_tables')
        .insert({
          club_id: clubId,
          name: body.competition || 'Serietabell',
          season: body.season || new Date().getFullYear().toString(),
          is_active: true,
        })
        .select('id')
        .single()
      if (error || !created) {
        return NextResponse.json({ success: false, error: error?.message || 'Kunde inte skapa tabell' }, { status: 500 })
      }
      activeTableId = created.id as string
    }

    const result = await batchUpsertLeagueTableEntries(
      auth.admin, activeTableId, clubId, club.name, teams
    )

    return NextResponse.json({
      success: true,
      updated: result.updated,
      created: result.created,
      table_id: activeTableId,
      entries: result.entries,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
