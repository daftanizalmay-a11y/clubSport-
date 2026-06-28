'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SponsorsEditor({ club, sponsors }: { club: any; sponsors: any[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '', tier: 'bronze' })
  const primaryColor = club?.primary_color || '#22c55e'

  async function addSponsor(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/website/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, club_id: club.id }),
    })
    setLoading(false)
    setShowForm(false)
    setForm({ name: '', logo_url: '', website_url: '', tier: 'bronze' })
    router.refresh()
  }

  async function toggleActive(sponsor: any) {
    await fetch('/api/website/sponsors', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sponsor.id, is_active: !sponsor.is_active }),
    })
    router.refresh()
  }

  async function deleteSponsor(id: string) {
    if (!confirm('Ta bort denna sponsor?')) return
    await fetch('/api/website/sponsors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Sponsorer ({sponsors.length})</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
          style={{ backgroundColor: primaryColor }}>
          + Lägg till sponsor
        </button>
      </div>

      {showForm && (
        <form onSubmit={addSponsor} className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Namn</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Nivå</label>
            <select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}
              className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none">
              <option value="gold">Guld</option>
              <option value="silver">Silver</option>
              <option value="bronze">Brons</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Logotyp URL</label>
            <input value={form.logo_url} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Webbplats</label>
            <input value={form.website_url} onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
          </div>
          <div className="col-span-2 flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm">Avbryt</button>
            <button type="submit" disabled={loading}
              className="flex-1 font-bold py-2.5 rounded-xl text-sm text-black disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}>
              {loading ? 'Sparar...' : 'Lägg till'}
            </button>
          </div>
        </form>
      )}

      {sponsors.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/30 text-sm">
          Inga sponsorer ännu.
        </div>
      ) : (
        <div className="space-y-3">
          {sponsors.map(s => (
            <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              {s.logo_url
                ? <img src={s.logo_url} alt={s.name} className="w-12 h-12 object-contain rounded-lg bg-white/5" />
                : <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white/40 text-xs">Logo</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{s.name}</p>
                <p className="text-white/40 text-xs capitalize">{s.tier}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-white/10 text-white/40'}`}>
                {s.is_active ? 'Aktiv' : 'Inaktiv'}
              </span>
              <button onClick={() => toggleActive(s)}
                className="text-xs px-3 py-1.5 border border-white/20 text-white/50 hover:text-white rounded-lg transition-colors">
                {s.is_active ? 'Inaktivera' : 'Aktivera'}
              </button>
              <button onClick={() => deleteSponsor(s.id)}
                className="text-xs px-3 py-1.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                Ta bort
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
