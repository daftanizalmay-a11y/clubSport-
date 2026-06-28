import { NextRequest, NextResponse } from 'next/server'
import { requireMemberUser } from '@/lib/member/auth'
import { fetchAllMemberReminders } from '@/lib/member/data'

export async function GET(req: NextRequest) {
  const auth = await requireMemberUser(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const reminders = await fetchAllMemberReminders(auth.admin, auth.user.id)
  return NextResponse.json({ reminders, total: reminders.length })
}
