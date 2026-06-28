/**
 * DB-only fixture verification (no HTTP server required)
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const envText = readFileSync('.env.local', 'utf8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const results = []
const pass = (n, d = '') => results.push({ n, ok: true, d })
const fail = (n, d = '') => results.push({ n, ok: false, d })

async function main() {
  console.log('=== DB VERIFICATION ===\n')

  for (const t of ['fixture_sources', 'fixture_sync_logs', 'fixtures', 'league_tables', 'club_website_config']) {
    const { error } = await supabase.from(t).select('*').limit(1)
    error ? fail(`table:${t}`, error.message) : pass(`table:${t}`)
  }

  for (const col of [
    ['fixtures', 'source_id, source_type, external_id'],
    ['fixtures', 'ai_extracted, extraction_confidence'],
    ['club_website_config', 'fixture_source_id, table_source_id'],
  ]) {
    const { error } = await supabase.from(col[0]).select(col[1]).limit(1)
    error ? fail(`col:${col[0]}.${col[1]}`, error.message) : pass(`col:${col[0]}.${col[1]}`)
  }

  const { data: clubs } = await supabase.from('clubs').select('id, name, sport').limit(1)
  if (!clubs?.[0]) { fail('club'); print(); return }
  pass('club', clubs[0].name)
  const clubId = clubs[0].id

  const { count: srcCount, error: srcErr } = await supabase.from('fixture_sources').select('*', { count: 'exact', head: true }).eq('club_id', clubId)
  if (srcErr) fail('fixture_sources count', srcErr.message)
  else pass('fixture_sources for club', `${srcCount || 0} sources`)

  const { data: fixtures } = await supabase.from('fixtures').select('id, source_type').eq('club_id', clubId).limit(5)
  pass('fixtures query', `${fixtures?.length || 0} fixtures`)

  const ok = results.filter(r => r.ok).length
  const bad = results.filter(r => !r.ok)
  console.log(`\n${ok}/${results.length} passed`)
  bad.forEach(r => console.log(`FAIL ${r.n}: ${r.d}`))
  process.exit(bad.length ? 1 : 0)
}

function print() {
  results.filter(r => !r.ok).forEach(r => console.log(`FAIL ${r.n}: ${r.d}`))
  process.exit(1)
}

main()
