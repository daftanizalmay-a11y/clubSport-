'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  profile: any
  memberships: any[]
  payments: any[]
  isOwnProfile: boolean
  canEdit: boolean
}

export default function ProfileClient({ profile, memberships, payments, isOwnProfile, canEdit }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    nationality: profile.nationality || '',
  })

  const primaryClub = memberships?.[0]?.clubs as any
  const primaryColor = primaryClub?.primary_color || '#22c55e'

  const boardRoles = memberships.filter(m => m.club_roles?.is_board_role)
  const paidCount = payments.filter(p => p.status === 'paid').length
  const pendingCount = payments.filter(p => p.status === 'pending').length

  async function saveProfile() {
    setSaving(true)
    await fetch('/api/profile/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, ...form }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('profile_id', profile.id)
    const res = await fetch('/api/profile/upload-avatar', { method: 'POST', body: formData })
    if (res.ok) router.refresh()
    setUploadingAvatar(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Cover */}
      <div className="h-40 w-full relative" style={{ backgroundColor: primaryColor + '30' }}>
        {primaryClub?.cover_url && <img src={primaryClub.cover_url} alt="" className="w-full h-full object-cover" />}
        <div className="absolute top-4 left-4">
          <Link href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">← Dashboard</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 pb-12">
        {/* Profile header */}
        <div className="flex items-end gap-5 mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl border-4 border-[#0a0f1e] overflow-hidden flex items-center justify-center text-4xl font-bold text-black"
              style={{ backgroundColor: primaryColor }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : profile.full_name?.charAt(0) || '?'}
            </div>
            {canEdit && (
              <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-colors border border-white/20">
                <span className="text-xs">📷</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              </label>
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
            <p className="text-white/40 text-sm">{profile.email}</p>
            {boardRoles.length > 0 && (
              <div className="flex gap-2 mt-2">
                {boardRoles.map(m => (
                  <span key={m.id} className="text-xs px-2 py-0.5 rounded-full text-black font-medium" style={{ backgroundColor: primaryColor }}>
                    {m.club_roles?.name_sv}
                  </span>
                ))}
              </div>
            )}
          </div>
          {canEdit && !editing && (
            <button onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-xl border border-white/20 text-white/60 hover:text-white text-sm transition-colors">
              Redigera profil
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            {/* Edit form */}
            {editing ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Redigera profil</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Namn</label>
                    <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Telefon</label>
                    <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+46 70 000 00 00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Nationalitet</label>
                    <input value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))}
                      placeholder="Svensk"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      rows={3} placeholder="Berätta lite om dig själv..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditing(false)}
                      className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors">
                      Avbryt
                    </button>
                    <button onClick={saveProfile} disabled={saving}
                      className="flex-1 font-bold py-2.5 rounded-xl text-sm text-black disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}>
                      {saving ? 'Sparar...' : 'Spara'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Om mig</h2>
                {profile.bio ? (
                  <p className="text-white/70 text-sm leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-white/20 text-sm italic">Ingen bio tillagd ännu.</p>
                )}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                  {profile.phone && (
                    <div><p className="text-white/30 text-xs">Telefon</p><p className="text-white text-sm">{profile.phone}</p></div>
                  )}
                  {profile.nationality && (
                    <div><p className="text-white/30 text-xs">Nationalitet</p><p className="text-white text-sm">{profile.nationality}</p></div>
                  )}
                  {profile.jersey_number && (
                    <div><p className="text-white/30 text-xs">Tröjnummer</p><p className="text-white text-sm font-bold">#{profile.jersey_number}</p></div>
                  )}
                </div>
              </div>
            )}

            {/* Club memberships */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Klubbar & roller</h2>
              {memberships.length === 0 ? (
                <p className="text-white/30 text-sm">Inte medlem i någon klubb ännu.</p>
              ) : (
                <div className="space-y-3">
                  {memberships.map(m => (
                    <div key={m.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        {m.clubs?.logo_url
                          ? <img src={m.clubs.logo_url} alt="" className="w-8 h-8 rounded-lg object-contain" />
                          : <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black" style={{ backgroundColor: m.clubs?.primary_color || '#22c55e' }}>{m.clubs?.name?.charAt(0)}</div>
                        }
                        <div>
                          <p className="text-white text-sm font-medium">{m.clubs?.name}</p>
                          <p className="text-white/30 text-xs">{m.clubs?.sport}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${m.club_roles?.is_board_role ? 'text-black font-medium' : 'bg-white/10 text-white/50'}`}
                        style={m.club_roles?.is_board_role ? { backgroundColor: primaryColor } : {}}>
                        {m.club_roles?.name_sv}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Statistik</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Klubbar</span>
                  <span className="text-white font-bold">{memberships.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Styrelseroller</span>
                  <span className="text-white font-bold">{boardRoles.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Betalda avgifter</span>
                  <span className="text-[#22c55e] font-bold">{paidCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Väntande avgifter</span>
                  <span className="text-yellow-400 font-bold">{pendingCount}</span>
                </div>
              </div>
            </div>

            {/* Payment history */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Betalningar</h2>
              {payments.length === 0 ? (
                <p className="text-white/20 text-xs">Inga betalningar ännu.</p>
              ) : (
                <div className="space-y-2">
                  {payments.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-xs font-medium">{p.fee_seasons?.name}</p>
                        <p className="text-white/30 text-xs">{p.amount_sek.toLocaleString('sv-SE')} kr</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === 'paid' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                        p.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{p.status === 'paid' ? 'Betald' : p.status === 'pending' ? 'Väntande' : 'Förfallen'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
