'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InviteForm({ club, roles, onInvited }: { club: any; roles: any[]; onInvited: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', role_id: '' })
  const primaryColor = club?.primary_color || '#22c55e'

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/members/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, club_id: club.id }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Något gick fel.'); setLoading(false); return }
    setSuccess(true)
    setForm({ email: '', role_id: '' })
    setLoading(false)
    router.refresh()
    setTimeout(() => { setSuccess(false); onInvited() }, 2000)
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Bjud in ny medlem</h2>
        <p className="text-white/40 text-sm mb-6">Medlemmen får ett e-postmeddelande med en länk för att gå med i {club.name}.</p>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">E-postadress</label>
            <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="medlem@epost.se" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Roll</label>
            <select required value={form.role_id} onChange={e => setForm(p => ({ ...p, role_id: e.target.value }))} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30">
              <option value="">Välj roll...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name_sv}</option>)}
            </select>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
          {success && <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl px-4 py-3 text-[#22c55e] text-sm">✓ Inbjudan skickad!</div>}
          <button type="submit" disabled={loading} className="w-full font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-black" style={{ backgroundColor: primaryColor }}>
            {loading ? 'Skickar...' : 'Skicka inbjudan'}
          </button>
        </form>
      </div>
    </div>
  )
}
