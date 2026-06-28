import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncAllEnabledSources } from '@/lib/fixtures/sync'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const results = await syncAllEnabledSources(admin, 'hourly')

    const summary = {
      clubs_synced: results.length,
      total_fixtures: results.reduce((n, r) => n + r.result.synced, 0),
      errors: results.filter(r => r.result.errors.length).map(r => ({
        clubId: r.clubId,
        sourceId: r.sourceId,
        errors: r.result.errors,
      })),
    }

    return NextResponse.json(summary)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Cron failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
