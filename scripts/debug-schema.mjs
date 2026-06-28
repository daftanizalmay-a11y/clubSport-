import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
  const i = l.indexOf('=')
  return [l.slice(0, i), l.slice(i + 1)]
}))

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const clubId = 'd7fda39e-9f44-447c-8aa8-71fe4cba6227'

const attempts = [
  { club_id: clubId, sport_type: 'cricket', source_type: 'webhook', name: 'Webhook' },
  { club_id: clubId, sport_type: 'cricket', source_type: 'webhook', name: 'Webhook', is_enabled: true },
  { club_id: clubId, sport_type: 'cricket', source_type: 'webhook', name: 'Webhook', is_enabled: true, sync_frequency: 'manual' },
]

for (const row of attempts) {
  const { error } = await supabase.from('fixture_sources').insert(row).select()
  console.log(Object.keys(row).join(','), '→', error?.message || 'OK')
  if (!error) break
}

// Try to get column info via rpc or information_schema - use raw select
const { data, error } = await supabase.from('fixture_sources').select('*').limit(1)
console.log('select *:', error?.message || JSON.stringify(data))
