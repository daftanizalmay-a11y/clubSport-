import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember, getClubOrError } from '@/lib/fixtures/auth'
import { fetchMemberStats, STAT_LABELS } from '@/lib/members/profile-data'

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

    const clubResult = await getClubOrError(auth.admin, clubId)
    if ('error' in clubResult) {
      return NextResponse.json({ error: clubResult.error }, { status: clubResult.status })
    }

    const stats = await fetchMemberStats(auth.admin, clubId, memberId, clubResult.club.sport || 'other')
    return NextResponse.json({
      sport: stats?.sport,
      stats: stats?.stats ?? {},
      labels: STAT_LABELS[clubResult.club.sport || ''] ?? {},
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
