import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await req.json()
    const updates = body.updates as { optionId: string; sort_order: number }[] | undefined

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ success: false, error: 'updates krävs' }, { status: 400 })
    }

    const now = new Date().toISOString()
    let updated = 0

    for (const item of updates) {
      const { error } = await auth.admin
        .from('dropdown_options')
        .update({ sort_order: Math.floor(item.sort_order), updated_at: now })
        .eq('id', item.optionId)
        .eq('club_id', clubId)

      if (!error) updated++
    }

    return NextResponse.json({ success: true, updated })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
