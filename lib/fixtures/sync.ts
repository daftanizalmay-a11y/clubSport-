import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdapter } from './adapters/registry'
import { decryptSecret, encryptSecret, generateWebhookSecret } from './crypto'
import { upsertFixture, updateLeagueTableFromFixture } from './league-table'
import type { FixtureSource, SourceType, SyncResult } from './types'

export async function ensureDefaultSources(admin: SupabaseClient, clubId: string, sport: string) {
  const types: SourceType[] = ['image', 'webhook']
  if (sport === 'football' || sport === 'multi_sport') types.push('football_api')
  if (sport === 'hockey' || sport === 'multi_sport') types.push('hockey_api')
  if (sport === 'cricket' || sport === 'multi_sport') types.push('cricket')
  if (sport === 'badminton' || sport === 'multi_sport') types.push('badminton')

  const { getAllAdapters } = await import('./adapters/registry')
  const adapters = getAllAdapters().filter(a => types.includes(a.type))

  for (const adapter of adapters) {
    const row: Record<string, unknown> = {
      club_id: clubId,
      sport_type: sport,
      source_type: adapter.type,
      is_enabled: adapter.type === 'image',
      sync_frequency: 'manual',
    }
    if (adapter.type === 'webhook') {
      row.webhook_secret_encrypted = encryptSecret(generateWebhookSecret())
    }
    // Try full row first (post-migration schema)
    const fullRow = { ...row, name: adapter.name, description: adapter.description }
    const { data: existing } = await admin.from('fixture_sources').select('id').eq('club_id', clubId).eq('source_type', adapter.type).maybeSingle()
    if (existing) {
      await admin.from('fixture_sources').update(row).eq('id', existing.id)
    } else {
      const { error } = await admin.from('fixture_sources').insert(fullRow)
      if (error?.message?.includes('name')) {
        await admin.from('fixture_sources').insert(row)
      } else if (error && !error.message.includes('duplicate')) {
        await admin.from('fixture_sources').insert(row).then(() => {})
      }
    }
  }
}

export async function syncSource(
  admin: SupabaseClient,
  source: FixtureSource,
  club: { id: string; name: string; sport: string },
  tableSourceId?: string | null
): Promise<SyncResult> {
  const adapter = getAdapter(source.source_type)
  if (!adapter) return { synced: 0, errors: ['Okänd adapter'], fixtures: [] }
  if (!adapter.supportsAutoSync) return { synced: 0, errors: ['Källan stöder inte automatisk synk'], fixtures: [] }

  let apiKey: string | null = null
  if (source.api_key_encrypted) {
    try {
      apiKey = decryptSecret(source.api_key_encrypted)
    } catch {
      return { synced: 0, errors: ['Kunde inte dekryptera API-nyckel'], fixtures: [] }
    }
  }

  const errors: string[] = []
  let synced = 0
  const fixtures: SyncResult['fixtures'] = []

  try {
    const fetched = await adapter.fetchFixtures({
      clubId: club.id,
      clubName: club.name,
      sportType: club.sport,
      source,
      apiKey,
    })

    for (const payload of fetched) {
      try {
        await upsertFixture(admin, club.id, payload, source.id, source.source_type)
        if (payload.is_played) {
          await updateLeagueTableFromFixture(admin, club.id, club.name, club.sport, payload, tableSourceId)
        }
        fixtures.push(payload)
        synced++
      } catch (e) {
        errors.push(e instanceof Error ? e.message : 'Okänt fel vid sparande')
      }
    }

    await admin.from('fixture_sources').update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: errors.length ? 'error' : 'success',
      updated_at: new Date().toISOString(),
    }).eq('id', source.id)

    await admin.from('fixture_sync_logs').insert({
      source_id: source.id,
      match_count: synced,
      status: errors.length ? 'error' : 'success',
      error_message: errors.length ? errors.join('; ') : null,
      details: { fetched: fetched.length },
    })

    return { synced, errors, fixtures }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Synkfel'
    await admin.from('fixture_sources').update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: 'error',
    }).eq('id', source.id)
    await admin.from('fixture_sync_logs').insert({
      source_id: source.id,
      match_count: 0,
      status: 'error',
      error_message: msg,
    })
    return { synced: 0, errors: [msg], fixtures: [] }
  }
}

export async function syncAllEnabledSources(admin: SupabaseClient, frequency?: 'hourly' | 'daily') {
  let query = admin
    .from('fixture_sources')
    .select('*, clubs(id, name, sport, contact_email)')
    .eq('is_enabled', true)
    .in('source_type', ['football_api', 'hockey_api'])

  if (frequency) {
    query = query.eq('sync_frequency', frequency)
  }

  const { data: sources } = await query
  const results: { sourceId: string; clubId: string; result: SyncResult }[] = []

  for (const source of sources || []) {
    const club = source.clubs as { id: string; name: string; sport: string; contact_email?: string }
    if (!club) continue

    const { data: config } = await admin
      .from('club_website_config')
      .select('table_source_id')
      .eq('club_id', club.id)
      .maybeSingle()

    const result = await syncSource(admin, source as FixtureSource, club, config?.table_source_id)
    results.push({ sourceId: source.id, clubId: club.id, result })

    if (result.errors.length && club.contact_email && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'ClubSports <onboarding@resend.dev>',
          to: club.contact_email,
          subject: `Fixture-synk misslyckades — ${club.name}`,
          html: `<p>Synkning av matcher misslyckades för ${source.name}.</p><p>${result.errors.join('<br>')}</p>`,
        })
      } catch { /* non-blocking */ }
    }
  }

  return results
}

export async function processWebhookFixture(
  admin: SupabaseClient,
  clubId: string,
  clubName: string,
  sport: string,
  source: FixtureSource,
  payload: import('./types').FixturePayload,
  tableSourceId?: string | null
) {
  const fixture = await upsertFixture(admin, clubId, payload, source.id, source.source_type)
  if (payload.is_played) {
    await updateLeagueTableFromFixture(admin, clubId, clubName, sport, payload, tableSourceId)
  }
  return fixture
}
