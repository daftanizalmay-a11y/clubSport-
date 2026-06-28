'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DynamicSelect from '@/components/shared/DynamicSelect'
import EditTeamModal from './EditTeamModal'

export default function TeamsClient({ club, teams, members }: { club: any; teams: any[]; members: any[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', sport: club.sport || 'other', age_group: '', gender: '', season: new Date().getFullYear().toString() })
  const primaryColor = club?.primary_color || '#22c55e'

  async function createTeam(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/teams/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, club_id: club.id }) })
    if (res.ok) { setShowForm(false); setForm({ name: '', sport: club.sport || 'other', age_group: '', gender: '', season: new Date().getFullYear().toString() }); router.refresh() }
    setLoading(false)
  }

  async function toggleTeamStatus(teamId: string, isActive: boolean) {
    await fetch('/api/teams/update', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team_id: teamId, is_active: !isActive }) })
    router.refresh()
  }

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  function handleTeamSaved() {
    router.refresh()
    showToast('Lag uppdaterat')
  }

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#22c55e] text-black font-medium px-4 py-2.5 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}
      <div className="mb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Förening</p>
        <h1 className="text-3xl font-bold text-white">Lag</h1>
        <p className="text-white/50 mt-1">{club.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-white">{teams.length}</p><p className="text-white/40 text-sm mt-1">Totalt antal lag</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-white">{teams.filter(t => t.is_active).length}</p><p className="text-white/40 text-sm mt-1">Aktiva lag</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-white">{members.length}</p><p className="text-white/40 text-sm mt-1">Tillgängliga spelare</p></div>
      </div>

      <div className="flex justify-end mb-6">
        <button onClick={() => setShowForm(true)} className="font-semibold px-4 py-2 rounded-xl text-sm transition-colors text-black" style={{ backgroundColor: primaryColor }}>
          + Nytt lag
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Skapa nytt lag</h3>
          <form onSubmit={createTeam} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Lagnamn</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Herrlaget 2026" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Sport</label>
              <DynamicSelect
                clubId={club.id}
                type="sport"
                value={form.sport}
                onChange={sport => setForm(p => ({ ...p, sport }))}
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Åldersgrupp</label>
              <DynamicSelect
                clubId={club.id}
                type="age_group"
                value={form.age_group}
                onChange={age_group => setForm(p => ({ ...p, age_group }))}
                allowEmpty
                emptyLabel="Välj åldersgrupp..."
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Kön</label>
              <DynamicSelect
                clubId={club.id}
                type="gender"
                value={form.gender}
                onChange={gender => setForm(p => ({ ...p, gender }))}
                allowEmpty
                emptyLabel="Välj..."
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Säsong</label>
              <DynamicSelect
                clubId={club.id}
                type="season"
                value={form.season}
                onChange={season => setForm(p => ({ ...p, season }))}
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm [color-scheme:dark]"
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors">Avbryt</button>
              <button type="submit" disabled={loading} className="flex-1 font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 text-black transition-colors" style={{ backgroundColor: primaryColor }}>{loading ? 'Skapar...' : 'Skapa lag'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.length === 0 ? (
          <div className="col-span-3 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-white/30 text-sm">Inga lag skapade ännu.</p>
          </div>
        ) : teams.map(team => (
          <div key={team.id} className={`bg-white/5 border rounded-2xl p-5 transition-all ${team.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-black" style={{ backgroundColor: primaryColor }}>
                {team.name.charAt(0)}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${team.is_active ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-white/10 text-white/40'}`}>{team.is_active ? 'Aktiv' : 'Inaktiv'}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">{team.name}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {team.sport && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{team.sport}</span>}
              {team.age_group && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{team.age_group}</span>}
              {team.gender && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{team.gender}</span>}
              {team.season && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{team.season}</span>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingTeam(team)}
                className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                Redigera
              </button>
              <button
                type="button"
                onClick={() => toggleTeamStatus(team.id, team.is_active)}
                className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
              >
                {team.is_active ? 'Inaktivera' : 'Aktivera'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingTeam && (
        <EditTeamModal
          clubId={club.id}
          team={editingTeam}
          open={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          onSaved={handleTeamSaved}
          primaryColor={primaryColor}
        />
      )}
    </div>
  )
}
