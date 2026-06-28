import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'
import { fetchMemberTeams } from '@/lib/members/profile-data'

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

    const teams = await fetchMemberTeams(auth.admin, clubId, memberId)
    return NextResponse.json({ teams, total: teams.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
