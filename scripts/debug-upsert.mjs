import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createHash, createCipheriv, randomBytes } from 'crypto'

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
  const i = l.indexOf('=')
  return [l.slice(0, i), l.slice(i + 1)]
}))

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const clubId = 'd7fda39e-9f44-447c-8aa8-71fe4cba6227'
const key = createHash('sha256').update(env.FIXTURE_ENCRYPTION_KEY).digest()
const iv = randomBytes(12)
const cipher = createCipheriv('aes-256-gcm', key, iv)
const enc = Buffer.concat([cipher.update('testsecret', 'utf8'), cipher.final()])
const wh = `${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${enc.toString('base64')}`

const { data, error } = await supabase.from('fixture_sources').upsert({
  club_id: clubId,
  sport_type: 'cricket',
  source_type: 'webhook',
  name: 'Webhook',
  description: 'Webhook',
  is_enabled: true,
  sync_frequency: 'manual',
  webhook_secret_encrypted: wh,
}, { onConflict: 'club_id,source_type' }).select()

console.log('upsert error:', error?.message || 'none')
console.log('upsert data:', data)

const { data: all, error: e2 } = await supabase.from('fixture_sources').select('*').eq('club_id', clubId)
console.log('query error:', e2?.message || 'none')
console.log('sources count:', all?.length, all)
