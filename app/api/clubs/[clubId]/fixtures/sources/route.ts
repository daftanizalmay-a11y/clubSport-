import { NextRequest, NextResponse } from 'next/server'
import { requireClubAdmin, getClubOrError } from '@/lib/fixtures/auth'
import { ensureDefaultSources } from '@/lib/fixtures/sync'
import { adaptersForSport } from '@/lib/fixtures/adapters/registry'
import { SOURCE_LABELS, SOURCE_DESCRIPTIONS } from '@/lib/fixtures/types'

export async function GET(
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

    await ensureDefaultSources(auth.admin, clubId, club.sport)

    const { data: sources, error: srcError } = await auth.admin
      .from('fixture_sources')
      .select('*')
      .eq('club_id', clubId)
      .order('source_type')

    if (srcError) return NextResponse.json({ error: srcError.message }, { status: 500 })

    const normalized = (sources || []).map(s => ({
      ...s,
      name: s.name || SOURCE_LABELS[s.source_type as keyof typeof SOURCE_LABELS] || s.source_type,
      description: s.description || SOURCE_DESCRIPTIONS[s.source_type as keyof typeof SOURCE_DESCRIPTIONS] || '',
    }))

    const available = adaptersForSport(club.sport).map(a => ({
      type: a.type,
      name: SOURCE_LABELS[a.type],
      description: SOURCE_DESCRIPTIONS[a.type],
      requiresApiKey: a.requiresApiKey,
      supportsAutoSync: a.supportsAutoSync,
    }))

    return NextResponse.json({ sources: normalized, available })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
