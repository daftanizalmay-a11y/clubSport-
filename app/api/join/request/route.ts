import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { club_id, full_name, email, message, requested_role_id } = await req.json()
    if (!club_id || !full_name || !email) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })

    const admin = createAdminClient()

    // Check if already a member
    const { data: existing } = await admin.from('profiles').select('id').eq('email', email).single()
    if (existing) {
      const { data: membership } = await admin.from('club_memberships').select('id').eq('club_id', club_id).eq('profile_id', existing.id).single()
      if (membership) return NextResponse.json({ error: 'Du är redan medlem i denna klubb.' }, { status: 409 })
    }

    const { error } = await admin.from('join_requests').upsert({
      club_id,
      full_name,
      email,
      message: message || null,
      requested_role_id: requested_role_id || null,
      status: 'pending',
    }, { onConflict: 'club_id,email', ignoreDuplicates: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
