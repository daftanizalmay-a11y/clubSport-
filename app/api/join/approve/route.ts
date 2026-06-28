import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const { request_id, role_id } = await req.json()
    if (!request_id || !role_id) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })

    const admin = createAdminClient()

    const { data: joinRequest } = await admin.from('join_requests').select('*').eq('id', request_id).single()
    if (!joinRequest) return NextResponse.json({ error: 'Förfrågan hittades inte' }, { status: 404 })

    // Check if profile exists
    const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', joinRequest.email).single()

    let profileId: string

    if (existingProfile) {
      profileId = existingProfile.id
    } else {
      // Create a placeholder profile — they will set password on first login
      const { data: authData, error: createError } = await admin.auth.admin.createUser({
        email: joinRequest.email,
        email_confirm: true,
        user_metadata: { full_name: joinRequest.full_name },
      })
      if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })
      profileId = authData.user.id
    }

    // Add membership
    await admin.from('club_memberships').upsert({
      club_id: joinRequest.club_id,
      profile_id: profileId,
      role_id,
      status: 'active',
    }, { onConflict: 'club_id,profile_id,role_id', ignoreDuplicates: false })

    // Update request status
    await admin.from('join_requests').update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', request_id)

    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
