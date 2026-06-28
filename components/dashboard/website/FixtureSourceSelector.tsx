'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DynamicSelect from '@/components/shared/DynamicSelect'

interface Source {
  id: string
  source_type: string
  name: string
  description: string | null
  is_enabled: boolean
  sync_frequency: string
  last_sync_at: string | null
  last_sync_status: string | null
  config: Record<string, unknown>
}

interface Available {
  type: string
  name: string
  description: string
  requiresApiKey: boolean
  supportsAutoSync: boolean
}

interface Props {
  clubId: string
  club: { id: string; name: string; sport: string; primary_color?: string }
  config: { fixture_source_id?: string; table_source_id?: string } | null
}

export default function FixtureSourceSelector({ clubId, club, config }: Props) {
  const router = useRouter()
  const resolvedClubId = clubId || club.id
  const primaryColor = club.primary_color || '#22c55e'
  const [sources, setSources] = useState<Source[]>([])
  const [available, setAvailable] = useState<Available[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedSourceId, setSelectedSourceId] = useState(config?.fixture_source_id || '')
  const [tableSourceId, setTableSourceId] = useState(config?.table_source_id || '')
  const [apiKey, setApiKey] = useState('')
  const [webhookInfo, setWebhookInfo] = useState<{ url: string; secret: string } | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const selectedSource = sources.find(s => s.id === selectedSourceId)

  useEffect(() => {
    if (!resolvedClubId || resolvedClubId === 'undefined') {
      setLoading(false)
      return
    }
    fetch(`/api/clubs/${resolvedClubId}/fixtures/sources`, { credentials: 'include' })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
        return data
      })
      .then(data => {
        setSources(data.sources || [])
        setAvailable(data.available || [])
      })
      .catch(err => setMessage(err instanceof Error ? err.message : 'Kunde inte hämta källor'))
      .finally(() => setLoading(false))
  }, [resolvedClubId])

  useEffect(() => {
    if (config?.fixture_source_id) setSelectedSourceId(config.fixture_source_id)
    if (config?.table_source_id) setTableSourceId(config.table_source_id)
  }, [config])

  async function saveConfig(updates: Record<string, unknown>) {
    setSaving(true)
    setMessage(null)
    const res = await fetch(`/api/clubs/${resolvedClubId}/fixtures/configure-source`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    setSaving(false)
    if (data.webhook_url && data.webhook_secret) {
      setWebhookInfo({ url: data.webhook_url, secret: data.webhook_secret })
    }
    router.refresh()
    return data
  }

  async function selectFixtureSource(sourceId: string) {
    setSelectedSourceId(sourceId)
    await saveConfig({ fixture_source_id: sourceId || null })
  }

  async function selectTableSource(sourceId: string) {
    setTableSourceId(sourceId)
    await saveConfig({ table_source_id: sourceId || null })
  }

  async function toggleEnabled(source: Source) {
    await saveConfig({ source_id: source.id, is_enabled: !source.is_enabled })
    setSources(prev => prev.map(s => s.id === source.id ? { ...s, is_enabled: !s.is_enabled } : s))
  }

  async function updateFrequency(source: Source, freq: string) {
    await saveConfig({ source_id: source.id, sync_frequency: freq })
    setSources(prev => prev.map(s => s.id === source.id ? { ...s, sync_frequency: freq } : s))
  }

  async function saveApiKey(source: Source) {
    if (!apiKey.trim()) return
    await saveConfig({ source_id: source.id, api_key: apiKey })
    setApiKey('')
    setMessage('API-nyckel sparad')
  }

  async function regenerateWebhook() {
    const webhook = sources.find(s => s.source_type === 'webhook')
    if (!webhook) return
    await saveConfig({ source_id: webhook.id, regenerate_webhook_secret: true })
    setMessage('Ny webhook-nyckel genererad')
  }

  async function syncNow() {
    if (!selectedSourceId) return
    setSyncing(true)
    setMessage(null)
    const res = await fetch(`/api/clubs/${resolvedClubId}/fixtures/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: selectedSourceId }),
    })
    const data = await res.json()
    setSyncing(false)
    setMessage(res.ok ? `Synkade ${data.synced} matcher${data.errors?.length ? ` (${data.errors.length} fel)` : ''}` : data.error)
    router.refresh()
  }

  if (loading) return <p className="text-white/40 text-sm">Laddar källor...</p>

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-1">Datakällor</h3>
        <p className="text-white/40 text-sm">Välj hur matcher och tabeller ska fyllas på — bild-AI, webhook eller svenska ligor.</p>
      </div>

      {message && (
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <label className="block text-sm text-white/60 mb-2">Fixture-källa</label>
          <select
            value={selectedSourceId}
            onChange={e => selectFixtureSource(e.target.value)}
            className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none mb-4"
          >
            <option value="">— Välj källa —</option>
            {sources.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.source_type})</option>
            ))}
          </select>

          <label className="block text-sm text-white/60 mb-2">Tabell-källa</label>
          <select
            value={tableSourceId}
            onChange={e => selectTableSource(e.target.value)}
            className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
          >
            <option value="">— Samma som fixtures —</option>
            {sources.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-white/60 mb-3">Tillgängliga källor för {club.sport}</p>
          <div className="space-y-2">
            {available.map(a => (
              <div key={a.type} className="text-xs text-white/40 border-b border-white/5 pb-2">
                <span className="text-white/70 font-medium">{a.name}</span>
                <p>{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sources.map(source => {
          const meta = available.find(a => a.type === source.source_type)
          return (
            <div key={source.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-white text-sm font-medium">{source.name}</p>
                  <p className="text-white/30 text-xs">{source.source_type} · {source.sync_frequency}</p>
                  {source.last_sync_at && (
                    <p className="text-white/30 text-xs mt-0.5">
                      Senast synkad: {new Date(source.last_sync_at).toLocaleString('sv-SE')}
                      {source.last_sync_status && ` (${source.last_sync_status})`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={source.sync_frequency}
                    onChange={e => updateFrequency(source, e.target.value)}
                    className="bg-[#0a0f1e] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="manual">Manuell</option>
                    <option value="hourly">Varje timme</option>
                    <option value="daily">Dagligen</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleEnabled(source)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${source.is_enabled ? '' : 'bg-white/20'}`}
                    style={source.is_enabled ? { backgroundColor: primaryColor } : undefined}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${source.is_enabled ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {meta?.requiresApiKey && source.is_enabled && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="SportRadar API-nyckel"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder:text-white/20"
                  />
                  <button type="button" onClick={() => saveApiKey(source)} disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black" style={{ backgroundColor: primaryColor }}>
                    Spara nyckel
                  </button>
                </div>
              )}

              {source.source_type === 'webhook' && source.is_enabled && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-white/40">
                    Webhook URL: <code className="text-white/60">{`${typeof window !== 'undefined' ? window.location.origin : ''}/api/clubs/${resolvedClubId}/fixtures/webhook`}</code>
                  </p>
                  <button type="button" onClick={regenerateWebhook}
                    className="text-xs text-white/40 hover:text-white underline">
                    Generera ny webhook-nyckel
                  </button>
                  {webhookInfo && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-200">
                      <p className="font-medium mb-1">Spara denna nyckel — visas bara en gång:</p>
                      <code className="break-all">{webhookInfo.secret}</code>
                      <p className="mt-2 text-white/50">Header: X-ClubSports-Signature: sha256=&lt;hmac&gt;</p>
                    </div>
                  )}
                </div>
              )}

              {source.source_type === 'football_api' && source.is_enabled && (
                <div className="mt-3">
                  <DynamicSelect
                    clubId={clubId}
                    type="competition"
                    value={(source.config?.league as string) || 'allsvenskan'}
                    onChange={league => saveConfig({ source_id: source.id, config: { ...source.config, league } })}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white [color-scheme:dark]"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedSource && available.find(a => a.type === selectedSource.source_type)?.supportsAutoSync && (
        <button
          type="button"
          onClick={syncNow}
          disabled={syncing || !selectedSourceId}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {syncing ? 'Synkar...' : 'Synka nu'}
        </button>
      )}
    </div>
  )
}
