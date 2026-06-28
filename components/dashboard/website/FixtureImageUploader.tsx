'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ExtractedFixture {
  home_team: string
  away_team: string
  match_date: string
  match_time?: string | null
  venue?: string | null
  home_score?: number | null
  away_score?: number | null
  competition?: string | null
  is_played?: boolean
  is_home_game?: boolean
}

interface MatchDraft extends ExtractedFixture {
  _key: string
}

interface Props {
  clubId: string
  club: { name: string; primary_color?: string; sport?: string }
  onSaved?: () => void
}

const MAX_BYTES = 5 * 1024 * 1024

function newKey() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function confidenceColor(score: number): string {
  if (score >= 0.85) return '#22c55e'
  if (score >= 0.6) return '#eab308'
  return '#ef4444'
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = confidenceColor(score)
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">AI-säkerhet</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function toDraft(m: ExtractedFixture, clubName: string): MatchDraft {
  return {
    _key: newKey(),
    home_team: m.home_team,
    away_team: m.away_team,
    match_date: m.match_date,
    match_time: m.match_time ?? '',
    venue: m.venue ?? '',
    home_score: m.home_score ?? null,
    away_score: m.away_score ?? null,
    competition: m.competition ?? '',
    is_played: m.is_played ?? false,
    is_home_game: m.is_home_game ?? m.home_team === clubName,
  }
}

export default function FixtureImageUploader({ clubId, club, onSaved }: Props) {
  const router = useRouter()
  const primaryColor = club.primary_color || '#3b82f6'
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const [sourcesReady, setSourcesReady] = useState(false)
  const [sourceCount, setSourceCount] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchDraft[]>([])
  const [confidence, setConfidence] = useState<number | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const hasExtracted = matches.length > 0

  useEffect(() => {
    if (!clubId || clubId === 'undefined') {
      setError('Kunde inte hämta klubb-ID')
      setSourcesLoading(false)
      return
    }

    setSourcesLoading(true)
    fetch(`/api/clubs/${clubId}/fixtures/sources`, { credentials: 'include' })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
        return data
      })
      .then(data => {
        setSourceCount(Array.isArray(data) ? data.length : (data.sources?.length ?? 0))
        setSourcesReady(true)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Kunde inte hämta källor'))
      .finally(() => setSourcesLoading(false))
  }, [clubId])

  const reset = useCallback(() => {
    setMatches([])
    setPreview(null)
    setConfidence(null)
    setNotes(null)
    setError(null)
    setExpandedKey(null)
  }, [])

  const processFile = useCallback(async (file: File) => {
    if (!clubId || clubId === 'undefined') {
      setError('Kunde inte hämta klubb-ID')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Endast JPG och PNG stöds')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Bilden får max vara 5 MB')
      return
    }

    setError(null)
    setSavedMessage(null)
    setLoading(true)
    setPreview(URL.createObjectURL(file))

    const fd = new FormData()
    fd.append('image', file)

    try {
      const res = await fetch(`/api/clubs/${clubId}/fixtures/upload-image`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Extrahering misslyckades')
        return
      }

      const list: ExtractedFixture[] = data.matches?.length
        ? data.matches
        : data.extracted_data
          ? [data.extracted_data]
          : []

      if (list.length === 0) {
        setError('Inga matcher hittades i bilden')
        return
      }

      setMatches(list.map(m => toDraft(m, club.name)))
      setConfidence(data.confidence ?? null)
      setNotes(data.notes ?? null)
      setExpandedKey(null)
    } catch {
      setError('Nätverksfel — kontrollera anslutningen och försök igen')
    } finally {
      setLoading(false)
    }
  }, [clubId, club.name])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function updateMatch(key: string, patch: Partial<MatchDraft>) {
    setMatches(prev => prev.map(m => m._key === key ? { ...m, ...patch } : m))
  }

  function removeMatch(key: string) {
    setMatches(prev => prev.filter(m => m._key !== key))
    if (expandedKey === key) setExpandedKey(null)
  }

  async function saveAll() {
    if (!clubId || matches.length === 0) return

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]
      if (!m.home_team || !m.away_team || !m.match_date) {
        setError(`Match ${i + 1}: Fyll i hemmalag, bortalag och datum`)
        return
      }
      if (m.is_played && (m.home_score == null || m.away_score == null)) {
        setError(`Match ${i + 1}: Ange resultat för spelade matcher`)
        return
      }
    }

    setLoading(true)
    setError(null)

    const payload = matches.map(({ _key, ...m }) => ({
      ...m,
      is_home_game: m.home_team === club.name,
      home_score: m.home_score != null ? Number(m.home_score) : null,
      away_score: m.away_score != null ? Number(m.away_score) : null,
      match_time: m.match_time || null,
      venue: m.venue || null,
      competition: m.competition || null,
    }))

    try {
      const res = await fetch(`/api/clubs/${clubId}/fixtures/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ matches: payload, extraction_confidence: confidence }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Kunde inte spara')
        return
      }

      const created = data.created ?? data.fixture_ids?.length ?? 1
      setSavedMessage(
        data.league_table_updated
          ? `${created} matcher sparade och tabell uppdaterad!`
          : `${created} matcher sparade!`
      )
      if (data.errors?.length) {
        setError(`Varning: ${data.errors.join('; ')}`)
      }
      reset()
      onSaved?.()
      router.refresh()
    } catch {
      setError('Kunde inte spara — försök igen')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/30 text-sm'

  if (!clubId || clubId === 'undefined') {
    return <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">Kunde inte hämta klubb-ID</div>
  }

  if (sourcesLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Ladda upp matchbild</h3>
        <div className="flex items-center gap-3 text-white/50 text-sm">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Laddar källor...
        </div>
      </div>
    )
  }

  if (!sourcesReady) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
        {error || 'Kunde inte verifiera åtkomst till klubben'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-1">Ladda upp matchbild</h3>
        <p className="text-white/40 text-sm">
          Ladda upp ett schema eller en resultatlista — Claude AI extraherar alla matcher (t.ex. hela säsongsprogrammet).
        </p>
      </div>

      {savedMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">{savedMessage}</div>
      )}

      {!hasExtracted && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${dragging ? 'bg-blue-500/5' : 'hover:bg-white/[0.02]'}`}
          style={{ borderColor: dragging ? primaryColor : `${primaryColor}66` }}
        >
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Förhandsgranskning" className="max-h-48 mx-auto mb-4 rounded-xl object-contain" />
          )}
          {loading ? (
            <div className="space-y-2">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-white/50 text-sm">Analyserar alla matcher i bilden...</p>
            </div>
          ) : (
            <>
              <p className="text-white/30 text-sm mb-4">Dra och släpp JPG/PNG här (max 5 MB), eller</p>
              <label className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-black cursor-pointer" style={{ backgroundColor: primaryColor }}>
                Välj fil
                <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
              </label>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      {hasExtracted && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-4 flex-wrap">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="w-24 h-24 rounded-lg object-cover border border-white/10" />
            )}
            <div className="flex-1 min-w-[200px] space-y-2">
              <p className="text-white font-semibold text-lg">Extraherade {matches.length} matcher</p>
              {confidence != null && <ConfidenceBar score={confidence} />}
              {notes && <p className="text-white/30 text-xs italic">AI: {notes}</p>}
            </div>
          </div>

          {confidence != null && confidence < 0.6 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-yellow-300 text-sm">
              Låg säkerhet — granska alla matcher innan du sparar.
            </div>
          )}

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {matches.map((m, idx) => {
              const open = expandedKey === m._key
              return (
                <div key={m._key} className="border border-white/10 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02]">
                    <span className="text-white/30 text-xs w-6">{idx + 1}</span>
                    <button type="button" onClick={() => setExpandedKey(open ? null : m._key)} className="flex-1 text-left min-w-0 cursor-pointer">
                      <p className="text-white text-sm font-medium truncate">
                        {m.home_team} vs {m.away_team}
                      </p>
                      <p className="text-white/40 text-xs truncate">
                        {m.match_date}{m.match_time ? ` kl ${m.match_time}` : ''}{m.competition ? ` · ${m.competition}` : ''}{m.venue ? ` · ${m.venue}` : ''}
                        {m.is_played && m.home_score != null ? ` · ${m.home_score}–${m.away_score}` : ''}
                      </p>
                    </button>
                    <button type="button" onClick={() => removeMatch(m._key)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 cursor-pointer">
                      Ta bort
                    </button>
                  </div>

                  {open && (
                    <div className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/5">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Hemmalag</label>
                        <input value={m.home_team} onChange={e => updateMatch(m._key, { home_team: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Bortalag</label>
                        <input value={m.away_team} onChange={e => updateMatch(m._key, { away_team: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Datum</label>
                        <input type="date" value={m.match_date} onChange={e => updateMatch(m._key, { match_date: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Tid</label>
                        <input type="time" value={m.match_time || ''} onChange={e => updateMatch(m._key, { match_time: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Arena</label>
                        <input value={m.venue || ''} onChange={e => updateMatch(m._key, { venue: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Tävling</label>
                        <input value={m.competition || ''} onChange={e => updateMatch(m._key, { competition: e.target.value })} className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={!!m.is_played} onChange={e => updateMatch(m._key, { is_played: e.target.checked })} className="w-4 h-4" />
                          <span className="text-white/60 text-xs">Match spelad</span>
                        </label>
                      </div>
                      {m.is_played && (
                        <>
                          <div>
                            <label className="block text-xs text-white/50 mb-1">Hemmamål</label>
                            <input type="number" min="0" value={m.home_score ?? ''} onChange={e => updateMatch(m._key, { home_score: e.target.value ? parseInt(e.target.value) : null })} className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-xs text-white/50 mb-1">Bortamål</label>
                            <input type="number" min="0" value={m.away_score ?? ''} onChange={e => updateMatch(m._key, { away_score: e.target.value ? parseInt(e.target.value) : null })} className={inputClass} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {matches.length === 0 && (
            <p className="text-white/40 text-sm text-center py-4">Alla matcher borttagna — ladda upp bilden igen.</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={reset} className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors cursor-pointer">
              Avbryt
            </button>
            <button type="button" onClick={saveAll} disabled={loading || matches.length === 0}
              className="flex-1 font-semibold py-2.5 rounded-xl text-sm text-black disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: primaryColor }}>
              {loading ? 'Sparar...' : `Spara ${matches.length} matcher`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
