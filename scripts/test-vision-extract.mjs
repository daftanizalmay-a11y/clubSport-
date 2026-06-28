/**
 * Test Claude vision extraction with a public sports scoreboard image.
 * Run: node scripts/test-vision-extract.mjs
 */
import { readFileSync } from 'fs'

const envText = readFileSync('.env.local', 'utf8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

async function main() {
  console.log('=== VISION EXTRACTION TEST ===\n')
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('SKIP — ANTHROPIC_API_KEY not set')
    return
  }

  try {
    const { extractFixtureFromImage } = await import('../lib/fixtures/vision.ts')
    const imgUrl = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'
    const res = await fetch(imgUrl)
    if (!res.ok) throw new Error(`Image fetch ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const base64 = buf.toString('base64')

    console.log('Calling Claude vision...')
    const extracted = await extractFixtureFromImage(base64, 'image/jpeg')
    console.log('PASS  Extraction result:')
    console.log(JSON.stringify(extracted, null, 2))

    const required = ['home_team', 'away_team', 'match_date']
    const missing = required.filter(k => !extracted[k])
    if (missing.length) console.log('WARN  Missing fields:', missing.join(', '))
    else console.log('PASS  Required fields present')
  } catch (e) {
    console.log('FAIL ', e.message)
  }
}

main()
