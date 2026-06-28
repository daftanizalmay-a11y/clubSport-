import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { uniqueProfileIds } from '@/lib/finances/member-payments'

export async function POST(req: NextRequest) {
  try {
    const { season_id, club_id } = await req.json()
    if (!season_id || !club_id) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { data: season } = await admin.from('fee_seasons').select('*').eq('id', season_id).single()
    if (!season) return NextResponse.json({ error: 'Säsong hittades inte' }, { status: 404 })
    const { data: members } = await admin.from('club_memberships').select('profile_id').eq('club_id', club_id).eq('status', 'active')
    if (!members?.length) return NextResponse.json({ error: 'Inga medlemmar' }, { status: 400 })
    const profileIds = uniqueProfileIds(members)
    const rows = profileIds.map(profile_id => ({
      club_id,
      season_id,
      profile_id,
      amount_sek: season.amount_sek,
      amount_due: season.amount_sek,
      amount_paid: 0,
      status: 'pending',
    }))
    const { error } = await admin.from('fee_payments').upsert(rows, { onConflict: 'season_id,profile_id', ignoreDuplicates: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, count: rows.length })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
