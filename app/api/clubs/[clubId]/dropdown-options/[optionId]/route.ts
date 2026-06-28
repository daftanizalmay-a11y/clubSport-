import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; optionId: string }> }
) {
  try {
    const { clubId, optionId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await req.json()
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.label != null) update.label = String(body.label).trim()
    if (body.description != null) update.description = String(body.description)
    if (body.sort_order != null) update.sort_order = Math.floor(Number(body.sort_order))
    if (body.is_active != null) update.is_active = Boolean(body.is_active)
    if (body.value != null) update.value = String(body.value).trim()

    const { data, error } = await auth.admin
      .from('dropdown_options')
      .update(update)
      .eq('id', optionId)
      .eq('club_id', clubId)
      .select('id, label, value, sort_order, description, is_active, updated_at')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; optionId: string }> }
) {
  try {
    const { clubId, optionId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const { error } = await auth.admin
      .from('dropdown_options')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', optionId)
      .eq('club_id', clubId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
