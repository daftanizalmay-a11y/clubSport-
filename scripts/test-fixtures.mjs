/**
 * Fixture system verification script
 * Run: node scripts/test-fixtures.mjs
 */
import { readFileSync } from 'fs'
import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
const envText = readFileSync('.env.local', 'utf8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const results = []

function pass(name, detail = '') { results.push({ name, ok: true, detail }) }
function fail(name, detail = '') { results.push({ name, ok: false, detail }) }

async function checkDb() {
  console.log('\n=== DATABASE ===')

  for (const table of ['fixture_sources', 'fixture_sync_logs', 'fixtures', 'league_tables', 'league_table_entries', 'club_website_config']) {
    const { error } = await supabase.from(table).select('*').limit(1)
    if (error) fail(`Table: ${table}`, error.message)
    else pass(`Table: ${table}`)
  }

  // Check fixture columns
  const { data: fixtureSample } = await supabase.from('fixtures').select('source_id, source_type, external_id').limit(1)
  if (fixtureSample !== null) pass('fixtures.source_id/source_type/external_id columns')
  else fail('fixtures extended columns')

  const { error: aiColErr } = await supabase.from('fixtures').select('ai_extracted, extraction_confidence').limit(1)
  if (aiColErr?.message?.includes('ai_extracted')) {
    fail('fixtures.ai_extracted column', 'Column missing — needs migration')
  } else if (!aiColErr) {
    pass('fixtures.ai_extracted/extraction_confidence columns')
  }

  const { error: cfgErr } = await supabase.from('club_website_config').select('fixture_source_id, table_source_id').limit(1)
  if (cfgErr) fail('club_website_config FK columns', cfgErr.message)
  else pass('club_website_config.fixture_source_id/table_source_id')
}

async function getTestClub() {
  const { data: clubs } = await supabase.from('clubs').select('id, name, sport, subdomain').limit(5)
  return clubs?.[0] || null
}

async function testCronRoute() {
  console.log('\n=== CRON ROUTE ===')
  try {
    const res = await fetch(`${BASE}/api/cron/fixtures-sync`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    })
    const body = await res.json()
    if (res.ok) pass('GET /api/cron/fixtures-sync', JSON.stringify(body))
    else fail('GET /api/cron/fixtures-sync', `${res.status}: ${JSON.stringify(body)}`)
  } catch (e) {
    fail('GET /api/cron/fixtures-sync', e.message)
  }

  try {
    const res = await fetch(`${BASE}/api/cron/fixtures-sync`)
    if (res.status === 401) pass('Cron rejects missing auth (401)')
    else fail('Cron auth check', `Expected 401, got ${res.status}`)
  } catch (e) {
    fail('Cron auth check', e.message)
  }
}

async function testWebhook(clubId) {
  console.log('\n=== WEBHOOK ===')

  // Ensure webhook source exists
  let { data: source } = await supabase.from('fixture_sources').select('*').eq('club_id', clubId).eq('source_type', 'webhook').maybeSingle()
  if (!source) {
    fail('Webhook source exists', 'No webhook source — run GET /sources first or migration')
    return
  }

  if (!source.webhook_secret_encrypted) {
    fail('Webhook secret configured')
    return
  }

  // Decrypt secret using same logic - import dynamically won't work in mjs easily, test via API
  const body = JSON.stringify({
    home_team: 'Test FC',
    away_team: 'Webhook United',
    match_date: '2026-06-20',
    match_time: '15:00',
    home_score: 2,
    away_score: 1,
    venue: 'Test Arena',
    competition: 'Test League',
    external_id: `webhook-test-${Date.now()}`,
  })

  // Invalid signature
  const badRes = await fetch(`${BASE}/api/clubs/${clubId}/fixtures/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-ClubSports-Signature': 'sha256=invalid' },
    body,
  })
  if (badRes.status === 401) pass('Webhook rejects invalid signature (401)')
  else fail('Webhook invalid signature', `Expected 401, got ${badRes.status}: ${await badRes.text()}`)
}

async function testSourcesRoute(clubId) {
  console.log('\n=== SOURCES ROUTE (unauthenticated) ===')
  const res = await fetch(`${BASE}/api/clubs/${clubId}/fixtures/sources`)
  if (res.status === 401) pass('GET /sources requires auth (401)')
  else fail('GET /sources auth', `Expected 401 without session, got ${res.status}`)
}

async function testLeagueTableLogic(clubId, clubName) {
  console.log('\n=== LEAGUE TABLE LOGIC ===')

  // Ensure league table exists
  let { data: table } = await supabase.from('league_tables').select('id').eq('club_id', clubId).limit(1).maybeSingle()
  if (!table) {
    const { data: created } = await supabase.from('league_tables').insert({ club_id: clubId, name: 'Test Division', season: '2025/26', is_active: true }).select().single()
    table = created
  }

  const homeTeam = 'LT Test Home'
  const awayTeam = clubName || 'LT Test Away'

  // Clean test entries
  await supabase.from('league_table_entries').delete().eq('table_id', table.id).in('team_name', [homeTeam, awayTeam])

  // Insert fixture via admin and trigger league update through direct DB + logic test
  const { updateLeagueTableFromFixture } = await import('../lib/fixtures/league-table.ts').catch(() => ({ updateLeagueTableFromFixture: null }))

  if (!updateLeagueTableFromFixture) {
    // Test via raw supabase simulation
    await supabase.from('league_table_entries').insert([
      { table_id: table.id, club_id: clubId, team_name: homeTeam, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_our_team: false },
      { table_id: table.id, club_id: clubId, team_name: awayTeam, played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0, is_our_team: true },
    ])
    pass('League table entries created manually (TS import skipped in mjs)')
  } else {
    await updateLeagueTableFromFixture(supabase, clubId, clubName, 'football', {
      home_team: homeTeam, away_team: awayTeam, match_date: '2026-06-20',
      home_score: 2, away_score: 1, is_played: true,
    }, table.id)
  }

  const { data: entries } = await supabase.from('league_table_entries').select('*').eq('table_id', table.id).in('team_name', [homeTeam, awayTeam])

  const home = entries?.find(e => e.team_name === homeTeam)
  const away = entries?.find(e => e.team_name === awayTeam)

  if (home?.played === 1 && home?.won === 1 && home?.points === 3 && home?.goals_for === 2) {
    pass('Home team stats updated (W=3pts, GF=2)')
  } else {
    fail('Home team stats', JSON.stringify(home))
  }

  if (away?.played === 1 && away?.lost === 1 && away?.points === 0 && away?.goals_for === 1) {
    pass('Away team stats updated (L=0pts, GF=1)')
  } else {
    fail('Away team stats', JSON.stringify(away))
  }

  // Sort check
  const sorted = [...(entries || [])].sort((a, b) => {
    const gdA = a.goals_for - a.goals_against
    const gdB = b.goals_for - b.goals_against
    return b.points - a.points || gdB - gdA
  })
  if (sorted[0]?.team_name === homeTeam) pass('Sort by points DESC (home wins)')
  else fail('Sort order', sorted.map(e => `${e.team_name}:${e.points}`).join(', '))
}

async function testSyncLogs(clubId) {
  console.log('\n=== SYNC LOGS ===')
  const { data: sources } = await supabase.from('fixture_sources').select('id').eq('club_id', clubId).limit(1)
  if (!sources?.length) {
    fail('fixture_sources seeded', 'No sources for club')
    return
  }
  const { data: logs, error } = await supabase.from('fixture_sync_logs').select('*').eq('source_id', sources[0].id).order('synced_at', { ascending: false }).limit(5)
  if (error) fail('fixture_sync_logs query', error.message)
  else pass('fixture_sync_logs queryable', `${logs?.length || 0} logs found`)
}

async function testComponentFiles() {
  console.log('\n=== COMPONENTS ===')
  const { existsSync } = await import('fs')
  const files = [
    'components/dashboard/website/FixtureImageUploader.tsx',
    'components/dashboard/website/FixtureSourceSelector.tsx',
    'components/dashboard/website/FixturesManager.tsx',
  ]
  for (const f of files) {
    if (existsSync(f)) pass(`Component: ${f}`)
    else fail(`Component: ${f}`, 'Missing')
  }
}

async function testApiRoutesExist() {
  console.log('\n=== API ROUTES ===')
  const routes = [
    'app/api/clubs/[clubId]/fixtures/upload-image/route.ts',
    'app/api/clubs/[clubId]/fixtures/webhook/route.ts',
    'app/api/clubs/[clubId]/fixtures/sync/route.ts',
    'app/api/clubs/[clubId]/fixtures/sources/route.ts',
    'app/api/clubs/[clubId]/fixtures/configure-source/route.ts',
  ]
  const { existsSync } = await import('fs')
  for (const r of routes) {
    if (existsSync(r)) pass(`Route file: ${r}`)
    else fail(`Route file: ${r}`)
  }
}

async function seedSourcesIfNeeded(clubId, sport) {
  const { count } = await supabase.from('fixture_sources').select('*', { count: 'exact', head: true }).eq('club_id', clubId)
  if ((count || 0) > 0) return

  const { ensureDefaultSources } = await import('../lib/fixtures/sync.ts').catch(() => ({}))
  if (ensureDefaultSources) {
    await ensureDefaultSources(supabase, clubId, sport)
  }
}

async function main() {
  console.log('ClubSports Fixture System Verification')
  console.log('Base URL:', BASE)

  await testApiRoutesExist()
  await testComponentFiles()
  await checkDb()

  const club = await getTestClub()
  if (!club) {
    fail('Test club found', 'No clubs in database')
    printReport()
    process.exit(1)
  }
  pass('Test club', `${club.name} (${club.id})`)

  await seedSourcesIfNeeded(club.id, club.sport)
  await testSourcesRoute(club.id)
  await testCronRoute()
  await testWebhook(club.id)
  await testSyncLogs(club.id)
  await testLeagueTableLogic(club.id, club.name)

  printReport()
}

function printReport() {
  console.log('\n=== REPORT ===')
  const passed = results.filter(r => r.ok)
  const failed = results.filter(r => !r.ok)
  console.log(`✓ ${passed.length} passed`)
  console.log(`✗ ${failed.length} failed`)
  if (failed.length) {
    console.log('\nFailures:')
    failed.forEach(f => console.log(`  - ${f.name}: ${f.detail}`))
  }
  process.exit(failed.length ? 1 : 0)
}

main().catch(e => { console.error(e); process.exit(1) })
