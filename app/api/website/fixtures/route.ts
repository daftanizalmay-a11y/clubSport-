import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateLeagueTableFromFixture } from '@/lib/fixtures/league-table'
import type { FixturePayload } from '@/lib/fixtures/types'

export async function POST(req: NextRequest) {
  try {
    const { club_id, home_team, away_team, match_date, match_time, venue, competition, is_home_game, home_score, away_score, is_played, notes } = await req.json()
    if (!club_id || !home_team || !away_team || !match_date) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('fixtures').insert({ club_id, home_team, away_team, match_date, match_time: match_time || null, venue: venue || null, competition: competition || null, is_home_game, home_score, away_score, is_played, notes: notes || null, source_type: 'manual' }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (is_played && home_score != null && away_score != null) {
      const { data: club } = await admin.from('clubs').select('name, sport').eq('id', club_id).single()
      const { data: config } = await admin.from('club_website_config').select('table_source_id').eq('club_id', club_id).maybeSingle()
      if (club) {
        await updateLeagueTableFromFixture(admin, club_id, club.name, club.sport, {
          home_team, away_team, match_date, home_score, away_score, is_played: true,
        } as FixturePayload, config?.table_source_id)
      }
    }

    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const { fixture_id, club_id, ...fields } = await req.json()
    if (!fixture_id) return NextResponse.json({ error: 'Saknat fixture_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('fixtures').update(fields).eq('id', fixture_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (fields.is_played && fields.home_score != null && fields.away_score != null && club_id) {
      const { data: club } = await admin.from('clubs').select('name, sport').eq('id', club_id).single()
      const { data: config } = await admin.from('club_website_config').select('table_source_id').eq('club_id', club_id).maybeSingle()
      if (club) {
        await updateLeagueTableFromFixture(admin, club_id, club.name, club.sport, {
          home_team: fields.home_team,
          away_team: fields.away_team,
          match_date: fields.match_date,
          home_score: fields.home_score,
          away_score: fields.away_score,
          is_played: true,
        } as FixturePayload, config?.table_source_id)
      }
    }

    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { fixture_id } = await req.json()
    const admin = createAdminClient()
    const { error } = await admin.from('fixtures').delete().eq('id', fixture_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
