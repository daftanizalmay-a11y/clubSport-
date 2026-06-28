'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const colorThemes = [
  { name: 'Grön (standard)', primary: '#22c55e', label: 'Grön' },
  { name: 'Blå', primary: '#3b82f6', label: 'Blå' },
  { name: 'Orange', primary: '#f97316', label: 'Orange' },
  { name: 'Röd', primary: '#ef4444', label: 'Röd' },
  { name: 'Lila', primary: '#8b5cf6', label: 'Lila' },
  { name: 'Rosa', primary: '#ec4899', label: 'Rosa' },
  { name: 'Turkos', primary: '#14b8a6', label: 'Turkos' },
  { name: 'Gul', primary: '#f59e0b', label: 'Gul' },
  { name: 'Vit', primary: '#f1f5f9', label: 'Vit' },
  { name: 'Guld', primary: '#d4af37', label: 'Guld' },
]

export default function BrandingSettings({ club }: { club: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    primary_color: club.primary_color || '#22c55e',
    tagline: club.tagline || '',
    logo_url: club.logo_url || '',
    cover_url: club.cover_url || '',
  })

  async function uploadFile(file: File, type: 'logo' | 'cover') {
    if (type === 'logo') setUploadingLogo(true)
    else setUploadingCover(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('club_id', club.id)
    formData.append('type', type)

    const res = await fetch('/api/settings/upload-asset', { method: 'POST', body: formData })
    if (res.ok) {
      const { url } = await res.json()
      setForm(p => ({ ...p, [`${type}_url`]: url }))
    }

    if (type === 'logo') setUploadingLogo(false)
    else setUploadingCover(false)
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/settings/branding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ club_id: club.id, ...form }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Logo */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Logotyp</h2>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl font-bold text-white/30">{club.name?.charAt(0)}</span>
            )}
          </div>
          <div>
            <input type="file" accept="image/*" id="logo-upload" className="hidden"
              onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'logo')} />
            <label htmlFor="logo-upload"
              className="cursor-pointer inline-block bg-white/10 hover:bg-white/15 text-white text-sm px-4 py-2 rounded-xl transition-colors">
              {uploadingLogo ? 'Laddar upp...' : 'Byt logotyp'}
            </label>
            <p className="text-white/30 text-xs mt-2">PNG eller SVG rekommenderas. Max 10MB.</p>
          </div>
        </div>
      </div>

      {/* Cover image */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Omslagsbild</h2>
        <div className="rounded-xl overflow-hidden border border-white/10 h-32 bg-white/5 mb-4 relative">
          {form.cover_url ? (
            <img src={form.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/20 text-sm">Ingen omslagsbild</p>
            </div>
          )}
        </div>
        <input type="file" accept="image/*" id="cover-upload" className="hidden"
          onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'cover')} />
        <label htmlFor="cover-upload"
          className="cursor-pointer inline-block bg-white/10 hover:bg-white/15 text-white text-sm px-4 py-2 rounded-xl transition-colors">
          {uploadingCover ? 'Laddar upp...' : 'Byt omslagsbild'}
        </label>
        <p className="text-white/30 text-xs mt-2">Rekommenderad storlek: 1200x400px.</p>
      </div>

      {/* Color theme */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Färgtema</h2>
        <p className="text-white/40 text-sm mb-4">Välj er klubbfärg. Den används i appen, hemsidan och alla dokument.</p>
        <div className="grid grid-cols-5 gap-3 mb-4">
          {colorThemes.map((theme) => (
            <button key={theme.primary} onClick={() => setForm(p => ({ ...p, primary_color: theme.primary }))}
              className="flex flex-col items-center gap-2 group">
              <div className={`w-10 h-10 rounded-full border-2 transition-all ${form.primary_color === theme.primary ? 'border-white scale-110' : 'border-transparent group-hover:border-white/30'}`}
                style={{ backgroundColor: theme.primary }} />
              <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">{theme.label}</span>
            </button>
          ))}
        </div>

        {/* Custom color */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
          <label className="text-sm text-white/60">Anpassad färg:</label>
          <input type="color" value={form.primary_color}
            onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))}
            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0" />
          <span className="text-white/40 text-sm font-mono">{form.primary_color}</span>
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/3">
          <p className="text-white/40 text-xs mb-3">Förhandsgranskning</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
              style={{ backgroundColor: form.primary_color }}>
              {club.name?.charAt(0)}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{club.name}</p>
              <p className="text-xs" style={{ color: form.primary_color }}>{club.subdomain}.clubsports.se</p>
            </div>
            <button className="ml-auto text-sm px-4 py-1.5 rounded-lg font-medium text-black transition-colors"
              style={{ backgroundColor: form.primary_color }}>
              Knapp
            </button>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tagline</h2>
        <input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))}
          placeholder="Er klubbs motto eller tagline..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors" />
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors">
        {saving ? 'Sparar...' : saved ? '✓ Sparat!' : 'Spara ändringar'}
      </button>
    </div>
  )
}
