import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'
import { slugifyValue } from '@/lib/dropdown-options/constants'
import { fetchOptionsByType } from '@/lib/dropdown-options/queries'
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

    const dropdownType = req.nextUrl.searchParams.get('type')
    if (!dropdownType) {
      return NextResponse.json({ error: 'type saknas' }, { status: 400 })
    }

    await ensureDropdownOptions(auth.admin, clubId)
    const options = await fetchOptionsByType(auth.admin, clubId, dropdownType)
    return NextResponse.json(options)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await req.json()
    const dropdownType = String(body.dropdown_type || '').trim()
    const label = String(body.label || '').trim()
    const value = String(body.value || slugifyValue(label)).trim()
    const description = body.description != null ? String(body.description) : null

    if (!dropdownType || !label || !value) {
      return NextResponse.json({ success: false, error: 'dropdown_type, label och value krävs' }, { status: 400 })
    }

    const { data: maxRow } = await auth.admin
      .from('dropdown_options')
      .select('sort_order')
      .eq('club_id', clubId)
      .eq('dropdown_type', dropdownType)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sortOrder = (maxRow?.sort_order ?? -1) + 1

    const { data, error } = await auth.admin
      .from('dropdown_options')
      .insert({
        club_id: clubId,
        dropdown_type: dropdownType,
        label,
        value,
        description,
        sort_order: sortOrder,
        is_active: true,
      })
      .select('id, label, value, sort_order, description')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
