import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; teamId: string }> }
) {
  try {
    const { clubId, teamId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await req.json()
    const name = body.name != null ? String(body.name).trim() : undefined
    if (name !== undefined && !name) {
      return NextResponse.json({ success: false, error: 'Lagnamn krävs' }, { status: 400 })
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (name !== undefined) update.name = name
    if (body.sport != null) update.sport = String(body.sport)
    if (body.age_group !== undefined) update.age_group = body.age_group ? String(body.age_group) : null
    if (body.gender !== undefined) update.gender = body.gender ? String(body.gender) : null
    if (body.season !== undefined) update.season = body.season ? String(body.season) : null

    const { data: team, error } = await auth.admin
      .from('teams')
      .update(update)
      .eq('id', teamId)
      .eq('club_id', clubId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!team) {
      return NextResponse.json({ success: false, error: 'Lag hittades inte' }, { status: 404 })
    }

    return NextResponse.json({ success: true, team })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
