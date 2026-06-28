import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { club_id, name, amount_sek, due_date, season_year } = body
    if (!club_id || !name || !amount_sek) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('fee_seasons').insert({ club_id, name, amount_sek, due_date: due_date || null, season_year }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
