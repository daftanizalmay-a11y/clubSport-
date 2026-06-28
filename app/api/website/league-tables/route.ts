import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const admin = createAdminClient()

    if (body.action === 'add_entry') {
      const { table_id, club_id, team_name, played, won, drawn, lost, goals_for, goals_against, points, is_our_team } = body
      const { error } = await admin.from('league_table_entries').insert({ table_id, club_id, team_name, played, won, drawn, lost, goals_for, goals_against, points, is_our_team })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    const { club_id, name, season } = body
    if (!club_id || !name) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const { data, error } = await admin.from('league_tables').insert({ club_id, name, season }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const { entry_id, ...fields } = await req.json()
    if (!entry_id) return NextResponse.json({ error: 'Saknat entry_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('league_table_entries').update(fields).eq('id', entry_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const admin = createAdminClient()
    if (body.entry_id) {
      await admin.from('league_table_entries').delete().eq('id', body.entry_id)
    } else if (body.table_id) {
      await admin.from('league_tables').delete().eq('id', body.table_id)
    }
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
