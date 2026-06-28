import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { token, email, full_name, password } = await req.json()
    if (!token || !email) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })

    const admin = createAdminClient()

    // Get invitation
    const { data: invitation } = await admin
      .from('invitations')
      .select('*, clubs(*), club_roles(*)')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (!invitation) return NextResponse.json({ error: 'Ogiltig inbjudan' }, { status: 404 })
    if (new Date(invitation.expires_at) < new Date()) return NextResponse.json({ error: 'Inbjudan har gått ut' }, { status: 410 })

    const supabase = await createClient()

    // Check if user exists
    const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', email).single()

    let userId: string

    if (existingProfile) {
      // Login existing user
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) return NextResponse.json({ error: 'Fel lösenord. Försök igen.' }, { status: 401 })
      userId = authData.user.id
    } else {
      // Create new user
      if (!password || password.length < 8) return NextResponse.json({ error: 'Lösenord måste vara minst 8 tecken' }, { status: 400 })
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      })
      if (signUpError) return NextResponse.json({ error: signUpError.message }, { status: 500 })
      if (!authData.user) return NextResponse.json({ error: 'Kunde inte skapa konto' }, { status: 500 })
      userId = authData.user.id
    }

    // Add membership
    await admin.from('club_memberships').upsert({
      club_id: invitation.club_id,
      profile_id: userId,
      role_id: invitation.role_id,
      status: 'active',
    }, { onConflict: 'club_id,profile_id,role_id', ignoreDuplicates: false })

    // Mark invitation as accepted
    await admin.from('invitations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invitation.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Join error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
