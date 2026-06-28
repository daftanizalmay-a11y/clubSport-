import { NextRequest, NextResponse } from 'next/server'
import { requireClubAdmin, getClubOrError } from '@/lib/fixtures/auth'
import { syncSource } from '@/lib/fixtures/sync'
import type { FixtureSource } from '@/lib/fixtures/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    const auth = await requireClubAdmin(clubId, req)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const clubResult = await getClubOrError(auth.admin, clubId)
    if ('error' in clubResult) return NextResponse.json({ error: clubResult.error }, { status: clubResult.status })
    const { club } = clubResult

    const body = await req.json().catch(() => ({}))
    const sourceId = body.source_id as string | undefined

    let source: FixtureSource | null = null

    if (sourceId) {
      const { data } = await auth.admin.from('fixture_sources').select('*').eq('id', sourceId).eq('club_id', clubId).single()
      source = data as FixtureSource
    } else {
      const { data: config } = await auth.admin.from('club_website_config').select('fixture_source_id, table_source_id').eq('club_id', clubId).maybeSingle()
      if (config?.fixture_source_id) {
        const { data } = await auth.admin.from('fixture_sources').select('*').eq('id', config.fixture_source_id).single()
        source = data as FixtureSource
      }
    }

    if (!source) return NextResponse.json({ error: 'Ingen datakälla vald' }, { status: 400 })
    if (!source.is_enabled) return NextResponse.json({ error: 'Datakällan är inaktiverad' }, { status: 400 })

    const { data: config } = await auth.admin.from('club_website_config').select('table_source_id').eq('club_id', clubId).maybeSingle()
    const result = await syncSource(auth.admin, source, club, config?.table_source_id)

    return NextResponse.json({ synced: result.synced, errors: result.errors })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
