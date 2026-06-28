import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { decryptSecret } from '@/lib/fixtures/crypto'
import { verifyWebhookSignature } from '@/lib/fixtures/webhook'
import { processWebhookFixture } from '@/lib/fixtures/sync'
import type { FixturePayload } from '@/lib/fixtures/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    const admin = createAdminClient()

    const rawBody = await req.text()
    const signature = req.headers.get('x-clubsports-signature')

    const { data: source } = await admin
      .from('fixture_sources')
      .select('*')
      .eq('club_id', clubId)
      .eq('source_type', 'webhook')
      .maybeSingle()

    if (!source?.webhook_secret_encrypted) {
      return NextResponse.json({ error: 'Webhook ej konfigurerad' }, { status: 404 })
    }

    const secret = decryptSecret(source.webhook_secret_encrypted)
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Ogiltig signatur' }, { status: 401 })
    }

    const body = JSON.parse(rawBody) as FixturePayload & { source_club_id?: string }
    if (!body.home_team || !body.away_team || !body.match_date) {
      return NextResponse.json({ error: 'Saknade fält: home_team, away_team, match_date' }, { status: 400 })
    }

    const { data: club } = await admin.from('clubs').select('*').eq('id', clubId).single()
    if (!club) return NextResponse.json({ error: 'Klubb hittades inte' }, { status: 404 })

    const payload: FixturePayload = {
      home_team: body.home_team,
      away_team: body.away_team,
      match_date: body.match_date,
      match_time: body.match_time ?? null,
      venue: body.venue ?? null,
      home_score: body.home_score ?? null,
      away_score: body.away_score ?? null,
      competition: body.competition ?? null,
      external_id: body.external_id ?? `${body.home_team}-${body.away_team}-${body.match_date}`,
      is_played: body.is_played ?? (body.home_score != null && body.away_score != null),
      is_home_game: body.is_home_game ?? body.home_team === club.name,
    }

    const { data: config } = await admin
      .from('club_website_config')
      .select('table_source_id')
      .eq('club_id', clubId)
      .maybeSingle()

    const fixture = await processWebhookFixture(
      admin, clubId, club.name, club.sport, source, payload, config?.table_source_id
    )

    return NextResponse.json({ success: true, fixture_id: fixture.id })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
