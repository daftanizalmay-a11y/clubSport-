'use client'

import { useEffect, useState } from 'react'
import DynamicSelect from '@/components/shared/DynamicSelect'

export interface TeamFormData {
  id: string
  name: string
  sport: string
  age_group: string | null
  gender: string | null
  season: string | null
}

interface Props {
  clubId: string
  team: TeamFormData
  open: boolean
  onClose: () => void
  onSaved: () => void
  primaryColor?: string
}

const selectClass = 'w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm [color-scheme:dark] focus:outline-none focus:border-gray-500'

export default function EditTeamModal({
  clubId,
  team,
  open,
  onClose,
  onSaved,
  primaryColor = '#22c55e',
}: Props) {
  const [form, setForm] = useState({
    name: team.name,
    sport: team.sport || 'other',
    age_group: team.age_group || '',
    gender: team.gender || '',
    season: team.season || new Date().getFullYear().toString(),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm({
        name: team.name,
        sport: team.sport || 'other',
        age_group: team.age_group || '',
        gender: team.gender || '',
        season: team.season || new Date().getFullYear().toString(),
      })
      setError(null)
    }
  }, [open, team])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Lagnamn krävs')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clubs/${clubId}/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Kunde inte spara')
        return
      }
      onSaved()
      onClose()
    } catch {
      setError('Nätverksfel')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold mb-4">Redigera lag</h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Lagnamn</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Sport</label>
            <DynamicSelect
              clubId={clubId}
              type="sport"
              value={form.sport}
              onChange={sport => setForm(p => ({ ...p, sport }))}
              className={selectClass}
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Åldersgrupp</label>
            <DynamicSelect
              clubId={clubId}
              type="age_group"
              value={form.age_group}
              onChange={age_group => setForm(p => ({ ...p, age_group }))}
              allowEmpty
              emptyLabel="Välj åldersgrupp..."
              className={selectClass}
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Kön</label>
            <DynamicSelect
              clubId={clubId}
              type="gender"
              value={form.gender}
              onChange={gender => setForm(p => ({ ...p, gender }))}
              allowEmpty
              emptyLabel="Välj..."
              className={selectClass}
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Säsong</label>
            <DynamicSelect
              clubId={clubId}
              type="season"
              value={form.season}
              onChange={season => setForm(p => ({ ...p, season }))}
              className={selectClass}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm cursor-pointer hover:border-white/40"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 font-semibold py-2.5 rounded-xl text-sm text-black disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? 'Sparar...' : 'Spara'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
