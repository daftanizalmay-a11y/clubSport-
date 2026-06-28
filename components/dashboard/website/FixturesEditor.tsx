'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DynamicSelect from '@/components/shared/DynamicSelect'

export default function FixturesEditor({ club, fixtures, embedded }: { club: any; fixtures: any[]; embedded?: boolean }) {
  const router = useRouter()
  const primaryColor = club?.primary_color || '#22c55e'
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'played'>('all')
  const [form, setForm] = useState({
    home_team: '', away_team: '', match_date: '', match_time: '',
    venue: '', competition: '', is_home_game: true,
    home_score: '', away_score: '', is_played: false, notes: '',
  })

  const filtered = fixtures.filter(f => {
    if (filter === 'upcoming') return !f.is_played
    if (filter === 'played') return f.is_played
    return true
  })

  function startEdit(f: any) {
    setEditingId(f.id)
    setForm({
      home_team: f.home_team, away_team: f.away_team,
      match_date: f.match_date, match_time: f.match_time || '',
      venue: f.venue || '', competition: f.competition || '',
      is_home_game: f.is_home_game,
      home_score: f.home_score?.toString() || '', away_score: f.away_score?.toString() || '',
      is_played: f.is_played, notes: f.notes || '',
    })
    setShowForm(true)
  }

  async function saveFixture(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      club_id: club.id,
      fixture_id: editingId,
      home_score: form.home_score !== '' ? parseInt(form.home_score) : null,
      away_score: form.away_score !== '' ? parseInt(form.away_score) : null,
    }
    await fetch('/api/website/fixtures', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    setShowForm(false)
    setEditingId(null)
    setForm({ home_team: '', away_team: '', match_date: '', match_time: '', venue: '', competition: '', is_home_game: true, home_score: '', away_score: '', is_played: false, notes: '' })
    router.refresh()
  }

  async function deleteFixture(id: string) {
    if (!confirm('Ta bort denna match?')) return
    await fetch('/api/website/fixtures', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixture_id: id }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Fixtures & resultat</h2>
            <p className="text-white/40 text-sm mt-0.5">Hantera kommande matcher och registrera resultat.</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ home_team: club.name, away_team: '', match_date: '', match_time: '', venue: '', competition: '', is_home_game: true, home_score: '', away_score: '', is_played: false, notes: '' }) }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
            style={{ backgroundColor: primaryColor }}>
            + Ny match
          </button>
        </div>
      )}

      {embedded && (
        <div className="flex justify-end">
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ home_team: club.name, away_team: '', match_date: '', match_time: '', venue: '', competition: '', is_home_game: true, home_score: '', away_score: '', is_played: false, notes: '' }) }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
            style={{ backgroundColor: primaryColor }}>
            + Ny match
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">{editingId ? 'Redigera match' : 'Ny match'}</h3>
          <form onSubmit={saveFixture} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Hemmalag</label>
              <input required value={form.home_team} onChange={e => setForm(p => ({ ...p, home_team: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Bortalag</label>
              <input required value={form.away_team} onChange={e => setForm(p => ({ ...p, away_team: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Datum</label>
              <input required type="date" value={form.match_date} onChange={e => setForm(p => ({ ...p, match_date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Tid</label>
              <input type="time" value={form.match_time} onChange={e => setForm(p => ({ ...p, match_time: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Arena/plats</label>
              <input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}
                placeholder="Malmö IP"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Tävling/liga</label>
              <DynamicSelect
                clubId={club.id}
                type="competition"
                value={form.competition}
                onChange={competition => setForm(p => ({ ...p, competition }))}
                allowEmpty
                emptyLabel="Välj tävling..."
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm [color-scheme:dark] focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_played} onChange={e => setForm(p => ({ ...p, is_played: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <span className="text-white/60 text-sm">Match spelad</span>
              </label>
            </div>

            {form.is_played && (
              <>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Hemmalag mål</label>
                  <input type="number" min="0" value={form.home_score} onChange={e => setForm(p => ({ ...p, home_score: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Bortalag mål</label>
                  <input type="number" min="0" value={form.away_score} onChange={e => setForm(p => ({ ...p, away_score: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
                </div>
              </>
            )}

            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }}
                className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors">Avbryt</button>
              <button type="submit" disabled={loading}
                className="flex-1 font-semibold py-2.5 rounded-xl text-sm text-black disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}>
                {loading ? 'Sparar...' : editingId ? 'Uppdatera' : 'Spara match'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit mb-4">
        {(['all', 'upcoming', 'played'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${filter === f ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white'}`}>
            {f === 'all' ? 'Alla' : f === 'upcoming' ? 'Kommande' : 'Spelade'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-3xl mb-3">🏆</p>
          <p className="text-white/30 text-sm">Inga matcher att visa.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => (
            <div key={f.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${f.is_home_game ? 'text-white' : 'text-white/60'}`}>{f.home_team}</span>
                  {f.is_played ? (
                    <span className="text-white font-bold text-lg">{f.home_score} — {f.away_score}</span>
                  ) : (
                    <span className="text-white/30 text-sm">vs</span>
                  )}
                  <span className={`text-sm font-bold ${!f.is_home_game ? 'text-white' : 'text-white/60'}`}>{f.away_team}</span>
                </div>
                <p className="text-white/30 text-xs mt-0.5">
                  {f.match_date} {f.match_time ? `kl ${f.match_time}` : ''} {f.venue ? `· ${f.venue}` : ''} {f.competition ? `· ${f.competition}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {f.source_type && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 uppercase">
                    {String(f.source_type)}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${f.is_played ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-yellow-400/20 text-yellow-400'}`}>
                  {f.is_played ? 'Spelad' : 'Kommande'}
                </span>
                <button type="button" onClick={() => startEdit(f)} className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/50 hover:text-white transition-colors">
                  Redigera
                </button>
                <button type="button" onClick={() => deleteFixture(f.id)} className="text-xs px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
