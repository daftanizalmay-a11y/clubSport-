'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DynamicSelect from '@/components/shared/DynamicSelect'

export default function ClubInfoSettings({ club }: { club: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: club.name || '',
    sport: club.sport || '',
    contact_email: club.contact_email || '',
    contact_phone: club.contact_phone || '',
    address: club.address || '',
    city: club.city || '',
    website_url: club.website_url || '',
    founded_year: club.founded_year?.toString() || '',
    registration_no: club.registration_no || '',
  })

  async function handleSave() {
    setSaving(true)
    await fetch('/api/settings/club-info', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ club_id: club.id, ...form, founded_year: form.founded_year ? parseInt(form.founded_year) : null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Klubbinformation</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-white/60 mb-1.5">Föreningens namn</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#22c55e]/50" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-white/60 mb-1.5">Sport</label>
            <DynamicSelect
              clubId={club.id}
              type="sport"
              value={form.sport}
              onChange={sport => setForm(p => ({ ...p, sport }))}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm [color-scheme:dark] focus:outline-none focus:border-[#22c55e]/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Kontakt e-post</label>
            <input type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#22c55e]/50" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Telefon</label>
            <input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))}
              placeholder="+46 70 000 00 00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-white/60 mb-1.5">Adress</label>
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Gatuadress"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Stad</label>
            <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              placeholder="Malmö"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Grundat år</label>
            <input type="number" value={form.founded_year} onChange={e => setForm(p => ({ ...p, founded_year: e.target.value }))}
              placeholder="2005"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Webbplats</label>
            <input value={form.website_url} onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))}
              placeholder="https://arianacc.se"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Org.nummer</label>
            <input value={form.registration_no} onChange={e => setForm(p => ({ ...p, registration_no: e.target.value }))}
              placeholder="802500-0000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors">
        {saving ? 'Sparar...' : saved ? '✓ Sparat!' : 'Spara ändringar'}
      </button>
    </div>
  )
}
