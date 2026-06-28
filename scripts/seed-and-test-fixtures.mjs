/**
 * Seed fixture sources + run API verification tests.
 * Run: node scripts/seed-and-test-fixtures.mjs
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createHmac, createHash, createDecipheriv, createCipheriv, randomBytes } from 'crypto'

const envText = readFileSync('.env.local', 'utf8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function getKey() {
  return createHash('sha256').update(process.env.FIXTURE_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY).digest()
}

function encryptSecret(plaintext) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return `${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${enc.toString('base64')}`
}

function decryptSecret(ciphertext) {
  const [ivB64, tagB64, dataB64] = ciphertext.split(':')
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8')
}

async function main() {
  console.log('=== SEED & TEST ===\n')
  const { data: club } = await supabase.from('clubs').select('id,name,sport').limit(1).single()
  if (!club) { console.log('No club found'); process.exit(1) }
  console.log('Club:', club.name, club.id)

  const webhookSecret = randomBytes(32).toString('hex')
  for (const s of [
    { source_type: 'image', is_enabled: true },
    { source_type: 'webhook', is_enabled: true, webhook_secret_encrypted: encryptSecret(webhookSecret) },
    { source_type: 'cricket', is_enabled: false },
  ]) {
    await supabase.from('fixture_sources').delete().eq('club_id', club.id).eq('source_type', s.source_type)
    const { error } = await supabase.from('fixture_sources').insert({ club_id: club.id, sport_type: club.sport, sync_frequency: 'manual', ...s })
    if (error) console.log('WARN seed', s.source_type, error.message)
  }
  console.log('PASS  Seeded fixture_sources\n')

  // Auth test
  const srcRes = await fetch(`${BASE}/api/clubs/${club.id}/fixtures/sources`)
  const ct = srcRes.headers.get('content-type') || ''
  console.log(srcRes.status === 401 && ct.includes('json') ? 'PASS' : 'FAIL', ` GET /sources unauthenticated → ${srcRes.status} (${ct.split(';')[0]})`)

  // Webhook tests
  const body = JSON.stringify({
    home_team: 'Webhook FC', away_team: club.name, match_date: '2026-06-25',
    home_score: 3, away_score: 2, venue: 'Test Arena', competition: 'Div 1',
    external_id: `test-wh-${Date.now()}`,
  })
  const sig = createHmac('sha256', webhookSecret).update(body).digest('hex')

  const bad = await fetch(`${BASE}/api/clubs/${club.id}/fixtures/webhook`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ClubSports-Signature': 'invalid' }, body,
  })
  console.log(bad.status === 401 ? 'PASS' : 'FAIL', ' Webhook invalid signature → 401')

  const good = await fetch(`${BASE}/api/clubs/${club.id}/fixtures/webhook`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ClubSports-Signature': sig }, body,
  })
  const goodJson = await good.json()
  console.log(good.ok ? 'PASS' : 'FAIL', ` Webhook valid signature → ${good.ok ? goodJson.fixture_id : JSON.stringify(goodJson)}`)

  const { data: whFixtures } = await supabase.from('fixtures').select('id,source_type').eq('club_id', club.id).eq('source_type', 'webhook')
  console.log((whFixtures?.length || 0) > 0 ? 'PASS' : 'FAIL', ` Webhook fixture in DB (${whFixtures?.length || 0})`)

  // Cron
  const cron = await fetch(`${BASE}/api/cron/fixtures-sync`, { headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } })
  console.log(cron.ok ? 'PASS' : 'FAIL', ' Cron sync endpoint')

  // League tables
  const { error: ltErr } = await supabase.from('league_tables').select('id').limit(1)
  console.log(ltErr ? 'FAIL' : 'PASS', ltErr ? ` league_tables — ${ltErr.message}` : ' league_tables table')

  // Components exist
  const { existsSync } = await import('fs')
  for (const f of ['FixtureImageUploader.tsx', 'FixtureSourceSelector.tsx', 'FixturesManager.tsx']) {
    console.log(existsSync(`components/dashboard/website/${f}`) ? 'PASS' : 'FAIL', ` Component ${f}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
