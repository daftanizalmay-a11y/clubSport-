import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'
import { fetchMemberReminders } from '@/lib/members/profile-data'

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

    const reminders = await fetchMemberReminders(auth.admin, clubId, memberId)
    return NextResponse.json({ reminders, total: reminders.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
