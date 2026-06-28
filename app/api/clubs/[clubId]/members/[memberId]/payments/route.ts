import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'
import { fetchMemberPayments } from '@/lib/members/profile-data'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
  try {
    const { clubId, memberId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const limit = Math.min(20, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '10', 10)))
    const payments = await fetchMemberPayments(auth.admin, clubId, memberId, limit)
    return NextResponse.json({ payments, total: payments.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
