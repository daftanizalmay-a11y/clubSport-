import { NextRequest, NextResponse } from 'next/server'
import { requireMemberUser } from '@/lib/member/auth'
import { fetchMemberProfile } from '@/lib/member/data'

export async function GET(req: NextRequest) {
  const auth = await requireMemberUser(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const profile = await fetchMemberProfile(auth.admin, auth.user.id)
  if (!profile) {
    return NextResponse.json({ error: 'Profil hittades inte' }, { status: 404 })
  }

  return NextResponse.json({
    ...profile,
    email: auth.user.email ?? profile.email,
  })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireMemberUser(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.full_name != null) update.full_name = String(body.full_name).trim()
    if (body.phone !== undefined) update.phone = body.phone ? String(body.phone) : null
    if (body.bio !== undefined) update.bio = body.bio ? String(body.bio) : null
    if (body.nationality !== undefined) update.nationality = body.nationality ? String(body.nationality) : null
    if (body.date_of_birth !== undefined) update.date_of_birth = body.date_of_birth || null
    if (body.address !== undefined) update.address = body.address ? String(body.address) : null
    if (body.emergency_contact !== undefined) update.emergency_contact = body.emergency_contact ? String(body.emergency_contact) : null

    const { data, error } = await auth.admin
      .from('profiles')
      .update(update)
      .eq('id', auth.user.id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: { ...data, email: auth.user.email } })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
