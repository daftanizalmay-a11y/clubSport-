'use client'

import { useEffect, useState } from 'react'
import { Card } from './ui'

const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#22c55e]/50'

export default function EditProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    nationality: '',
    bio: '',
    address: '',
    emergency_contact: '',
  })

  useEffect(() => {
    fetch('/api/member/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setProfile(data)
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : '',
            nationality: data.nationality || '',
            bio: data.bio || '',
            address: data.address || '',
            emergency_contact: data.emergency_contact || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/member/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    })
    setSaving(false)
    if (res.ok) {
      setToast('Profilen uppdaterad ✓')
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (loading) return <p className="text-white/40 text-sm">Laddar profil...</p>

  return (
    <div className="max-w-2xl space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#22c55e] text-black font-medium px-4 py-2.5 rounded-xl text-sm">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-white">Redigera min profil</h1>
        {profile?.email && (
          <p className="text-white/40 text-sm mt-1">E-post: {profile.email} (kan inte ändras här)</p>
        )}
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Namn</label>
            <input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              className={inputClass} placeholder="Ditt namn" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Telefon</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className={inputClass} placeholder="+46 70 000 00 00" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Födelsedatum</label>
            <input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Nationalitet</label>
            <input value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })}
              className={inputClass} placeholder="Svensk" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Adress</label>
            <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
              className={inputClass} placeholder="Gatuadress, stad" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Nödkontakt</label>
            <input value={formData.emergency_contact} onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
              className={inputClass} placeholder="Namn och telefon" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Bio</label>
            <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
              rows={3} className={`${inputClass} resize-none`} placeholder="Kort om dig..." />
          </div>
          <button type="button" onClick={handleSave} disabled={saving}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl cursor-pointer">
            {saving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </Card>
    </div>
  )
}
