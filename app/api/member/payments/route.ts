import { NextRequest, NextResponse } from 'next/server'
import { requireMemberUser } from '@/lib/member/auth'
import { fetchAllMemberPayments } from '@/lib/member/data'

export async function GET(req: NextRequest) {
  const auth = await requireMemberUser(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const payments = await fetchAllMemberPayments(auth.admin, auth.user.id)
  const outstanding = payments.reduce((sum, p) => sum + p.amount_remaining, 0)
  return NextResponse.json({ payments, total: payments.length, outstanding_balance: outstanding })
}
