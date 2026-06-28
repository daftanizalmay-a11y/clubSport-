import { NextRequest, NextResponse } from 'next/server'
import { requireClubAdmin, getClubOrError } from '@/lib/fixtures/auth'
import { upsertFixture, updateLeagueTableFromFixture } from '@/lib/fixtures/league-table'
import { validateFixturePayload } from '@/lib/fixtures/validate'
import type { FixturePayload } from '@/lib/fixtures/types'

function collectMatches(body: Record<string, unknown>): FixturePayload[] {
  if (Array.isArray(body.matches)) return body.matches as FixturePayload[]
  if (body.extracted_data) return [body.extracted_data as FixturePayload]
  if (body.home_team) return [body as unknown as FixturePayload]
  return []
}

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
    const rawMatches = collectMatches(body)
    const extractionConfidence = (body.extraction_confidence as number | null) ?? null

    if (rawMatches.length === 0) {
      return NextResponse.json({ success: false, error: 'Inga matcher att spara' }, { status: 400 })
    }

    const { data: imageSource } = await auth.admin
      .from('fixture_sources')
      .select('id')
      .eq('club_id', clubId)
      .eq('source_type', 'image')
      .maybeSingle()

    const { data: config } = await auth.admin
      .from('club_website_config')
      .select('table_source_id')
      .eq('club_id', clubId)
      .maybeSingle()

    const fixtureIds: string[] = []
    const errors: string[] = []
    let leagueTableUpdated = false

    for (let i = 0; i < rawMatches.length; i++) {
      const payload = { ...rawMatches[i] } as FixturePayload
      const validationError = validateFixturePayload(payload, club.name)
      if (validationError) {
        errors.push(`Match ${i + 1}: ${validationError}`)
        continue
      }

      payload.is_home_game = payload.is_home_game ?? payload.home_team === club.name
      payload.extraction_confidence = extractionConfidence

      try {
        const fixture = await upsertFixture(auth.admin, clubId, payload, imageSource?.id, 'image')
        fixtureIds.push(fixture.id as string)

        if (payload.is_played && payload.home_score != null && payload.away_score != null) {
          const tableResult = await updateLeagueTableFromFixture(
            auth.admin, clubId, club.name, club.sport, payload, config?.table_source_id
          )
          if (tableResult.updated) leagueTableUpdated = true
        }
      } catch (e) {
        errors.push(`Match ${i + 1}: ${e instanceof Error ? e.message : 'Okänt fel'}`)
      }
    }

    if (fixtureIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: errors.join('; ') || 'Kunde inte spara några matcher',
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      created: fixtureIds.length,
      fixture_ids: fixtureIds,
      fixture_id: fixtureIds[0],
      league_table_updated: leagueTableUpdated,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
