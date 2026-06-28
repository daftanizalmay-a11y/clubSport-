'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TeamRow {
  team_name: string
  position?: number | null
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
  is_our_team?: boolean
}

interface TeamDraft extends TeamRow {
  _key: string
}

interface Props {
  clubId: string
  club: { name: string; primary_color?: string }
  leagueTables: { id: string; name: string; season?: string }[]
  defaultTableId?: string
  onSaved?: () => void
}

const MAX_BYTES = 5 * 1024 * 1024
const STAT_COLS = ['played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against', 'points'] as const

function newKey() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toDraft(t: TeamRow): TeamDraft {
  return { _key: newKey(), ...t }
}

function ConfidenceBar({ score, color }: { score: number; color: string }) {
  const pct = Math.round(score * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">AI-säkerhet</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function TableImageUploader({ clubId, club, leagueTables, defaultTableId, onSaved }: Props) {
  const router = useRouter()
  const primaryColor = club.primary_color || '#3b82f6'
  const [tableId, setTableId] = useState(defaultTableId || leagueTables[0]?.id || '')
  const [teams, setTeams] = useState<TeamDraft[]>([])
  const [confidence, setConfidence] = useState<number | null>(null)
  const [meta, setMeta] = useState<{ competition?: string; season?: string; notes?: string }>({})
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const hasExtracted = teams.length > 0

  const reset = useCallback(() => {
    setTeams([])
    setPreview(null)
    setConfidence(null)
    setMeta({})
    setError(null)
    setEditingKey(null)
  }, [])

  const processFile = useCallback(async (file: File) => {
    if (!clubId) return
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
      const res = await fetch(`/api/clubs/${clubId}/fixtures/league-table/upload-image`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Extrahering misslyckades')
        return
      }
      if (!data.teams?.length) {
        setError('Inga lag hittades i bilden')
        return
      }
      setTeams(data.teams.map((t: TeamRow) => toDraft(t)))
      setConfidence(data.confidence ?? null)
      setMeta({ competition: data.competition, season: data.season, notes: data.notes })
    } catch {
      setError('Nätverksfel — försök igen')
    } finally {
      setLoading(false)
    }
  }, [clubId])

  function updateTeam(key: string, patch: Partial<TeamDraft>) {
    setTeams(prev => prev.map(t => t._key === key ? { ...t, ...patch } : t))
  }

  function removeTeam(key: string) {
    setTeams(prev => prev.filter(t => t._key !== key))
  }

  async function saveBatch() {
    if (!teams.length) return
    setLoading(true)
    setError(null)

    const payload = teams.map(({ _key, ...t }) => ({
      ...t,
      is_our_team: t.is_our_team ?? t.team_name === club.name,
    }))

    try {
      const res = await fetch(`/api/clubs/${clubId}/fixtures/league-table/save-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teams: payload,
          table_id: tableId || undefined,
          competition: meta.competition,
          season: meta.season,
          extraction_confidence: confidence,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Kunde inte spara')
        return
      }
      setSavedMessage(`${data.updated} uppdaterade, ${data.created} nya lag sparade`)
      reset()
      onSaved?.()
      router.refresh()
    } catch {
      setError('Kunde inte spara — försök igen')
    } finally {
      setLoading(false)
    }
  }

  const confColor = confidence != null && confidence >= 0.85 ? '#22c55e' : confidence != null && confidence >= 0.6 ? '#eab308' : '#ef4444'
  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-white/30'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-1">Ladda upp tabellbild</h3>
        <p className="text-white/40 text-sm">
          Ladda upp en bild av serietabellen — Claude AI extraherar alla lag och statistik (M, V, O, F, GM, IM, P).
        </p>
      </div>

      {leagueTables.length > 0 && (
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Måltabell</label>
          <select
            value={tableId}
            onChange={e => setTableId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
          >
            {leagueTables.map(t => (
              <option key={t.id} value={t.id}>{t.name}{t.season ? ` — ${t.season}` : ''}</option>
            ))}
          </select>
        </div>
      )}

      {savedMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">{savedMessage}</div>
      )}

      {!hasExtracted && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); e.dataTransfer.files[0] && processFile(e.dataTransfer.files[0]) }}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer ${dragging ? 'bg-blue-500/5' : ''}`}
          style={{ borderColor: dragging ? primaryColor : `${primaryColor}66` }}
        >
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="max-h-48 mx-auto mb-4 rounded-xl object-contain" />
          )}
          {loading ? (
            <div className="space-y-2">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-white/50 text-sm">Analyserar alla lag i tabellen...</p>
            </div>
          ) : (
            <>
              <p className="text-white/30 text-sm mb-4">Dra och släpp JPG/PNG (max 5 MB)</p>
              <label className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-black cursor-pointer" style={{ backgroundColor: primaryColor }}>
                Välj fil
                <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
              </label>
            </>
          )}
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

      {hasExtracted && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-start gap-4">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/10" />
            )}
            <div className="flex-1 min-w-[180px]">
              <p className="text-white font-semibold text-lg">Extraherade {teams.length} lag</p>
              {meta.competition && <p className="text-white/40 text-xs">{meta.competition}{meta.season ? ` · ${meta.season}` : ''}</p>}
              {confidence != null && <div className="mt-2 max-w-xs"><ConfidenceBar score={confidence} color={confColor} /></div>}
              {meta.notes && <p className="text-white/30 text-xs italic mt-1">AI: {meta.notes}</p>}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Lag</th>
                  <th className="px-2 py-2">M</th>
                  <th className="px-2 py-2">V</th>
                  <th className="px-2 py-2">O</th>
                  <th className="px-2 py-2">F</th>
                  <th className="px-2 py-2">GM</th>
                  <th className="px-2 py-2">IM</th>
                  <th className="px-2 py-2 font-bold">P</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => (
                  <tr key={t._key} className={`border-t border-white/5 ${t.is_our_team ? 'bg-white/[0.03]' : ''}`}>
                    <td className="px-3 py-2 text-white/40">{t.position ?? i + 1}</td>
                    <td className="px-3 py-2">
                      {editingKey === t._key ? (
                        <input value={t.team_name} onChange={e => updateTeam(t._key, { team_name: e.target.value })} className={inputClass} />
                      ) : (
                        <button type="button" onClick={() => setEditingKey(t._key)} className="text-white text-left hover:underline cursor-pointer">
                          {t.team_name}
                          {t.is_our_team && <span className="ml-1 text-[10px] px-1 rounded text-black" style={{ backgroundColor: primaryColor }}>Vi</span>}
                        </button>
                      )}
                    </td>
                    {STAT_COLS.map(col => (
                      <td key={col} className="px-1 py-1 text-center">
                        <input
                          type="number"
                          min="0"
                          value={t[col]}
                          onChange={e => updateTeam(t._key, { [col]: parseInt(e.target.value) || 0 })}
                          className="w-12 bg-white/5 border border-white/10 rounded px-1 py-1 text-white text-xs text-center focus:outline-none"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <button type="button" onClick={() => removeTeam(t._key)} className="text-red-400/70 hover:text-red-400 text-xs cursor-pointer">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={reset} className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm cursor-pointer">
              Avbryt
            </button>
            <button type="button" onClick={saveBatch} disabled={loading || !teams.length}
              className="flex-1 font-semibold py-2.5 rounded-xl text-sm text-black disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: primaryColor }}>
              {loading ? 'Sparar...' : `Spara ${teams.length} lag`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
