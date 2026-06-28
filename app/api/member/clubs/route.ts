import { NextRequest, NextResponse } from 'next/server'
import { requireMemberUser } from '@/lib/member/auth'
import { fetchMemberClubs } from '@/lib/member/data'

export async function GET(req: NextRequest) {
  const auth = await requireMemberUser(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const clubs = await fetchMemberClubs(auth.admin, auth.user.id)
  return NextResponse.json({ clubs, total: clubs.length })
}
