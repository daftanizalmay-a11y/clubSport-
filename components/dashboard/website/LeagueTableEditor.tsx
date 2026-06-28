'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LeagueTableEditor({ club, leagueTables, embedded }: { club: any; leagueTables: any[]; embedded?: boolean }) {
  const router = useRouter()
  const primaryColor = club?.primary_color || '#22c55e'
  const [selectedTableId, setSelectedTableId] = useState<string>(leagueTables[0]?.id || '')
  const [showNewTable, setShowNewTable] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableForm, setTableForm] = useState({ name: '', season: new Date().getFullYear().toString() })
  const [teamForm, setTeamForm] = useState({ team_name: '', played: '0', won: '0', drawn: '0', lost: '0', goals_for: '0', goals_against: '0', points: '0', is_our_team: false })

  const selectedTable = leagueTables.find(t => t.id === selectedTableId)
  const entries = selectedTable?.league_table_entries || []
  const sorted = [...entries].sort((a, b) => b.points - a.points || (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against))

  async function createTable(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/website/league-tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tableForm, club_id: club.id }),
    })
    const data = await res.json()
    setLoading(false)
    setShowNewTable(false)
    setSelectedTableId(data.id || '')
    router.refresh()
  }

  async function addTeam(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/website/league-tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_entry',
        table_id: selectedTableId,
        club_id: club.id,
        ...teamForm,
        played: parseInt(teamForm.played), won: parseInt(teamForm.won),
        drawn: parseInt(teamForm.drawn), lost: parseInt(teamForm.lost),
        goals_for: parseInt(teamForm.goals_for), goals_against: parseInt(teamForm.goals_against),
        points: parseInt(teamForm.points),
      }),
    })
    setLoading(false)
    setShowAddTeam(false)
    setTeamForm({ team_name: '', played: '0', won: '0', drawn: '0', lost: '0', goals_for: '0', goals_against: '0', points: '0', is_our_team: false })
    router.refresh()
  }

  async function deleteEntry(id: string) {
    await fetch('/api/website/league-tables', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: id }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Lagstabell</h2>
            <p className="text-white/40 text-sm mt-0.5">Hantera serietabellen som visas på er klubbsida.</p>
          </div>
          <button onClick={() => setShowNewTable(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
            style={{ backgroundColor: primaryColor }}>
            + Ny tabell
          </button>
        </div>
      )}

      {embedded && (
        <div className="flex justify-end gap-2 flex-wrap">
          <button onClick={() => setShowNewTable(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
            style={{ backgroundColor: primaryColor }}>
            + Ny tabell
          </button>
        </div>
      )}

      {showNewTable && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <form onSubmit={createTable} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Tabellnamn</label>
              <input required value={tableForm.name} onChange={e => setTableForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Allsvenskan"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Säsong</label>
              <input required value={tableForm.season} onChange={e => setTableForm(p => ({ ...p, season: e.target.value }))}
                placeholder="2026"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowNewTable(false)}
                className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors">Avbryt</button>
              <button type="submit" disabled={loading}
                className="flex-1 font-semibold py-2.5 rounded-xl text-sm text-black disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}>
                {loading ? 'Skapar...' : 'Skapa tabell'}
              </button>
            </div>
          </form>
        </div>
      )}

      {leagueTables.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <select value={selectedTableId} onChange={e => setSelectedTableId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none">
              {leagueTables.map(t => <option key={t.id} value={t.id}>{t.name} — {t.season}</option>)}
            </select>
            <button onClick={() => setShowAddTeam(true)}
              className="px-4 py-2 rounded-xl text-sm border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
              + Lägg till lag
            </button>
          </div>

          {showAddTeam && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Lägg till lag i tabellen</h3>
              <form onSubmit={addTeam} className="grid grid-cols-4 gap-3">
                <div className="col-span-4">
                  <label className="block text-sm text-white/60 mb-1.5">Lagnamn</label>
                  <input required value={teamForm.team_name} onChange={e => setTeamForm(p => ({ ...p, team_name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
                </div>
                {[
                  { key: 'played', label: 'M' }, { key: 'won', label: 'V' }, { key: 'drawn', label: 'O' }, { key: 'lost', label: 'F' },
                  { key: 'goals_for', label: 'GM' }, { key: 'goals_against', label: 'IM' }, { key: 'points', label: 'P' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-white/40 mb-1">{f.label}</label>
                    <input type="number" min="0" value={(teamForm as any)[f.key]} onChange={e => setTeamForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                ))}
                <div className="col-span-4 flex items-center gap-2">
                  <input type="checkbox" checked={teamForm.is_our_team} onChange={e => setTeamForm(p => ({ ...p, is_our_team: e.target.checked }))} className="w-4 h-4" />
                  <label className="text-white/60 text-sm">Detta är vår klubb (markeras i tabellen)</label>
                </div>
                <div className="col-span-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddTeam(false)}
                    className="flex-1 border border-white/20 text-white py-2 rounded-xl text-sm">Avbryt</button>
                  <button type="submit" disabled={loading}
                    className="flex-1 font-semibold py-2 rounded-xl text-sm text-black disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}>
                    {loading ? '...' : 'Lägg till'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table preview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold">{selectedTable?.name} — {selectedTable?.season}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs uppercase">
                  <th className="text-left px-4 py-2">#</th>
                  <th className="text-left px-4 py-2">Lag</th>
                  <th className="px-3 py-2">M</th>
                  <th className="px-3 py-2">V</th>
                  <th className="px-3 py-2">O</th>
                  <th className="px-3 py-2">F</th>
                  <th className="px-3 py-2">GM</th>
                  <th className="px-3 py-2">IM</th>
                  <th className="px-3 py-2 font-bold">P</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan={10} className="text-center text-white/20 py-8 text-sm">Inga lag tillagda ännu.</td></tr>
                ) : sorted.map((entry, i) => (
                  <tr key={entry.id} className={`border-t border-white/5 ${entry.is_our_team ? 'bg-white/5' : ''}`}>
                    <td className="px-4 py-2 text-white/40">{i + 1}</td>
                    <td className="px-4 py-2">
                      <span className={`font-medium ${entry.is_our_team ? 'text-white' : 'text-white/70'}`}>{entry.team_name}</span>
                      {entry.is_our_team && <span className="ml-2 text-xs px-1.5 py-0.5 rounded text-black" style={{ backgroundColor: primaryColor }}>Vi</span>}
                    </td>
                    <td className="px-3 py-2 text-center text-white/50">{entry.played}</td>
                    <td className="px-3 py-2 text-center text-white/50">{entry.won}</td>
                    <td className="px-3 py-2 text-center text-white/50">{entry.drawn}</td>
                    <td className="px-3 py-2 text-center text-white/50">{entry.lost}</td>
                    <td className="px-3 py-2 text-center text-white/50">{entry.goals_for}</td>
                    <td className="px-3 py-2 text-center text-white/50">{entry.goals_against}</td>
                    <td className="px-3 py-2 text-center font-bold text-white">{entry.points}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => deleteEntry(entry.id)} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
