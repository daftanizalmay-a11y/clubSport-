import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInvitationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const { email, role_id, club_id } = await req.json()
    if (!email || !role_id || !club_id) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })

    const admin = createAdminClient()

    // Check if already a member
    const { data: existing } = await admin.from('profiles').select('id').eq('email', email).single()
    if (existing) {
      const { data: membership } = await admin.from('club_memberships').select('id').eq('club_id', club_id).eq('profile_id', existing.id).single()
      if (membership) return NextResponse.json({ error: 'Denna person är redan medlem i klubben.' }, { status: 409 })
    }

    // Check for existing pending invite
    const { data: existingInvite } = await admin.from('invitations').select('id').eq('club_id', club_id).eq('email', email).eq('status', 'pending').single()
    if (existingInvite) return NextResponse.json({ error: 'En inbjudan har redan skickats till denna e-post.' }, { status: 409 })

    // Get club info
    const { data: club } = await admin.from('clubs').select('*').eq('id', club_id).single()
    if (!club) return NextResponse.json({ error: 'Klubb hittades inte' }, { status: 404 })

    // Get role info
    const { data: role } = await admin.from('club_roles').select('*').eq('id', role_id).single()
    if (!role) return NextResponse.json({ error: 'Roll hittades inte' }, { status: 404 })

    // Get inviter profile
    const { data: inviter } = await admin.from('profiles').select('full_name').eq('id', user.id).single()

    // Create invitation
    const { data: invitation, error: inviteError } = await admin
      .from('invitations')
      .insert({ club_id, email, role_id, invited_by: user.id })
      .select()
      .single()

    if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 500 })

    // Send email
    const emailResult = await sendInvitationEmail({
      to: email,
      clubName: club.name,
      clubLogo: club.logo_url || undefined,
      clubColor: club.primary_color || undefined,
      roleName: role.name_sv,
      inviterName: inviter?.full_name || 'Klubbadmin',
      token: invitation.token,
      subdomain: club.subdomain,
    })

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Invite error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
