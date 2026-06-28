import { NextRequest, NextResponse } from 'next/server'
import { requireMemberUser } from '@/lib/member/auth'
import { fetchMemberDashboardStats } from '@/lib/member/data'

export async function GET(req: NextRequest) {
  const auth = await requireMemberUser(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const stats = await fetchMemberDashboardStats(auth.admin, auth.user.id)
    return NextResponse.json(stats)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
