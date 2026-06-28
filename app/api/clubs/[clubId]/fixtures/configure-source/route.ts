import { NextRequest, NextResponse } from 'next/server'
import { requireClubAdmin, getClubOrError } from '@/lib/fixtures/auth'
import { encryptSecret, generateWebhookSecret } from '@/lib/fixtures/crypto'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    const auth = await requireClubAdmin(clubId, req)
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await req.json()
    const {
      fixture_source_id,
      table_source_id,
      source_id,
      is_enabled,
      sync_frequency,
      api_key,
      regenerate_webhook_secret,
      config,
    } = body

    if (fixture_source_id !== undefined || table_source_id !== undefined) {
      await auth.admin.from('club_website_config').upsert({
        club_id: clubId,
        fixture_source_id: fixture_source_id ?? null,
        table_source_id: table_source_id ?? null,
      }, { onConflict: 'club_id' })
    }

    if (source_id) {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (is_enabled !== undefined) updates.is_enabled = is_enabled
      if (sync_frequency) updates.sync_frequency = sync_frequency
      if (config) updates.config = config
      if (api_key) updates.api_key_encrypted = encryptSecret(api_key)
      if (regenerate_webhook_secret) {
        updates.webhook_secret_encrypted = encryptSecret(generateWebhookSecret())
      }

      const { error } = await auth.admin.from('fixture_sources').update(updates).eq('id', source_id).eq('club_id', clubId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: configRow } = await auth.admin.from('club_website_config').select('*').eq('club_id', clubId).maybeSingle()
    const { data: sources } = await auth.admin.from('fixture_sources').select('*').eq('club_id', clubId)

    let webhookUrl: string | null = null
    let webhookSecret: string | null = null
    const webhookSource = sources?.find(s => s.source_type === 'webhook')
    if (regenerate_webhook_secret && webhookSource?.webhook_secret_encrypted) {
      const { decryptSecret } = await import('@/lib/fixtures/crypto')
      webhookSecret = decryptSecret(webhookSource.webhook_secret_encrypted)
      webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/clubs/${clubId}/fixtures/webhook`
    }

    return NextResponse.json({
      success: true,
      config: configRow,
      sources,
      webhook_url: webhookUrl,
      webhook_secret: webhookSecret,
    })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
