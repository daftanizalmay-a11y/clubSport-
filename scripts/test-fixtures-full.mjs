import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

const envText = readFileSync('.env.local', 'utf8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function probe(name, fn) {
  try {
    const detail = await fn()
    console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`)
    return true
  } catch (e) {
    console.log(`FAIL  ${name} — ${e.message}`)
    return false
  }
}

async function main() {
  console.log('=== FULL FIXTURE SYSTEM TEST ===\n')

  // DB
  for (const t of ['clubs', 'fixtures', 'fixture_sources', 'fixture_sync_logs', 'league_tables', 'league_table_entries', 'club_website_config']) {
    const { error } = await supabase.from(t).select('*').limit(1)
    console.log(`${error ? 'FAIL' : 'PASS'}  table:${t}${error ? ` — ${error.message}` : ''}`)
  }

  const { data: clubs } = await supabase.from('clubs').select('id,name,sport,subdomain').limit(1)
  if (!clubs?.[0]) { console.log('FAIL  no club'); return }
  const club = clubs[0]
  console.log(`\nClub: ${club.name} (${club.id})\n`)

  // HTTP routes
  await probe('cron with auth', async () => {
    const r = await fetch(`${BASE}/api/cron/fixtures-sync`, { headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } })
    const b = await r.json()
    if (!r.ok) throw new Error(JSON.stringify(b))
    return JSON.stringify(b)
  })

  await probe('cron without auth → 401', async () => {
    const r = await fetch(`${BASE}/api/cron/fixtures-sync`)
    if (r.status !== 401) throw new Error(`status ${r.status}`)
  })

  await probe('sources without auth → 401', async () => {
    const r = await fetch(`${BASE}/api/clubs/${club.id}/fixtures/sources`)
    if (r.status !== 401) throw new Error(`status ${r.status}`)
  })

  // Webhook
  const { data: whSource } = await supabase.from('fixture_sources').select('*').eq('club_id', club.id).eq('source_type', 'webhook').maybeSingle()
  if (whSource?.webhook_secret_encrypted) {
    const { decryptSecret } = await import('../lib/fixtures/crypto.ts')
    const secret = decryptSecret(whSource.webhook_secret_encrypted)
    const body = JSON.stringify({ home_team: 'WH Home', away_team: 'WH Away', match_date: '2026-06-22', home_score: 1, away_score: 0, external_id: `wh-${Date.now()}` })
    const sig = createHmac('sha256', secret).update(body).digest('hex')

    await probe('webhook bad sig → 401', async () => {
      const r = await fetch(`${BASE}/api/clubs/${club.id}/fixtures/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ClubSports-Signature': 'bad' }, body })
      if (r.status !== 401) throw new Error(`status ${r.status}`)
    })

    await probe('webhook valid sig', async () => {
      const r = await fetch(`${BASE}/api/clubs/${club.id}/fixtures/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-ClubSports-Signature': sig, 'X-ClubSports-Signature': `sha256=${sig}` }, body })
      const b = await r.json()
      if (!r.ok) throw new Error(JSON.stringify(b))
      return `fixture_id=${b.fixture_id}`
    })
  } else {
    console.log('SKIP  webhook tests — no webhook source/secret')
  }

  // Check fixtures with source_type webhook
  const { data: whFixtures } = await supabase.from('fixtures').select('id,source_type,home_team').eq('club_id', club.id).eq('source_type', 'webhook').limit(3)
  console.log(`${whFixtures?.length ? 'PASS' : 'INFO'}  webhook fixtures in DB: ${whFixtures?.length || 0}`)

  // ai_extracted columns
  const { error: aiErr } = await supabase.from('fixtures').select('ai_extracted,extraction_confidence').limit(1)
  console.log(`${aiErr ? 'FAIL' : 'PASS'}  ai_extracted columns${aiErr ? ` — ${aiErr.message}` : ''}`)
}

main().catch(console.error)
