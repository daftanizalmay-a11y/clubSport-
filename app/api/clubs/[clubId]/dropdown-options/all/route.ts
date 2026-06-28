import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'
import { fetchAllOptionsGrouped } from '@/lib/dropdown-options/queries'
import { ensureDropdownOptions } from '@/lib/dropdown-options/seed'

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

    const includeInactive = req.nextUrl.searchParams.get('include_inactive') === 'true'
    await ensureDropdownOptions(auth.admin, clubId)
    const grouped = await fetchAllOptionsGrouped(auth.admin, clubId, includeInactive)
    return NextResponse.json(grouped)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
