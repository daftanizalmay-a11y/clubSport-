import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'
import { buildMemberPaymentRows, groupMembershipRows } from '@/lib/finances/member-payments'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const seasonId = req.nextUrl.searchParams.get('season_id')
    const statusFilter = req.nextUrl.searchParams.get('status')

    if (!seasonId) {
      return NextResponse.json({ error: 'season_id saknas' }, { status: 400 })
    }

    const admin = auth.admin

    const { data: season, error: seasonErr } = await admin
      .from('fee_seasons')
      .select('*')
      .eq('id', seasonId)
      .eq('club_id', clubId)
      .single()

    if (seasonErr || !season) {
      return NextResponse.json({ error: 'Säsong hittades inte' }, { status: 404 })
    }

    const { data: memberRows } = await admin
      .from('club_memberships')
      .select('*, profiles(*)')
      .eq('club_id', clubId)
      .eq('status', 'active')

    const { data: payments } = await admin
      .from('fee_payments')
      .select('*')
      .eq('club_id', clubId)
      .eq('season_id', seasonId)

    const uniqueMembers = groupMembershipRows(memberRows || [])
    const allMembers = buildMemberPaymentRows(
      uniqueMembers,
      payments || [],
      seasonId,
      season.amount_sek as number,
      season.due_date as string | null,
      season.name as string
    )

    const members = statusFilter
      ? allMembers.filter(m => m.payment_status === statusFilter)
      : allMembers

    const summary = {
      total: allMembers.length,
      paid: allMembers.filter(m => m.payment_status === 'paid').length,
      partially_paid: allMembers.filter(m => m.payment_status === 'partially_paid').length,
      unpaid: allMembers.filter(m => m.payment_status === 'unpaid').length,
      overdue: allMembers.filter(m => m.payment_status === 'overdue').length,
      missing: allMembers.filter(m => m.payment_status === 'missing').length,
    }

    return NextResponse.json({ members, season, summary })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
