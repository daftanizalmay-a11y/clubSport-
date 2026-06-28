import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { profile_id, club_id, role_id } = await req.json()
    if (!profile_id || !club_id || !role_id) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('club_memberships').upsert({
      profile_id, club_id, role_id, status: 'active'
    }, { onConflict: 'club_id,profile_id,role_id', ignoreDuplicates: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
