import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
  const i = l.indexOf('=')
  return [l.slice(0, i), l.slice(i + 1)]
}))

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const clubId = 'd7fda39e-9f44-447c-8aa8-71fe4cba6227'

const cols = ['name', 'description', 'is_enabled', 'sync_frequency', 'api_key_encrypted', 'webhook_secret_encrypted', 'config', 'country_code', 'last_sync_at', 'last_sync_status', 'created_at', 'updated_at']

for (const col of cols) {
  const row = { club_id: clubId, sport_type: 'cricket', source_type: `test_${col}`, [col]: col === 'is_enabled' ? true : col === 'sync_frequency' ? 'manual' : col === 'config' ? {} : col === 'country_code' ? 'SE' : `${col}_val` }
  const { error } = await supabase.from('fixture_sources').insert(row)
  console.log(col, error ? `MISSING: ${error.message.split("'")[1] || error.message}` : 'EXISTS')
}

await supabase.from('fixture_sources').delete().eq('club_id', clubId).like('source_type', 'test_%')
