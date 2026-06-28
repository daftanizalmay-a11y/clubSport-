'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MembersList({ club, members, roles, userId }: { club: any; members: any[]; roles: any[]; userId: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [addingRole, setAddingRole] = useState(false)
  const [newRoleId, setNewRoleId] = useState('')
  const primaryColor = club?.primary_color || '#22c55e'

  const filtered = members.filter(m => {
    const matchesSearch = !search ||
      m.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.profiles?.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === 'all' || m.club_roles?.slug === filterRole
    return matchesSearch && matchesRole
  })

  // Group by profile to show each member once with all their roles
  const grouped = filtered.reduce((acc: any, m: any) => {
    const pid = m.profile_id
    if (!acc[pid]) {
      acc[pid] = { ...m, allRoles: [m.club_roles], allMemberships: [m] }
    } else {
      acc[pid].allRoles.push(m.club_roles)
      acc[pid].allMemberships.push(m)
    }
    return acc
  }, {})
  const groupedMembers = Object.values(grouped) as any[]

  function openEdit(m: any) {
    if (expandedId === m.profile_id) { setExpandedId(null); return }
    setExpandedId(m.profile_id)
    setEditForm({
      full_name: m.profiles?.full_name || '',
      phone: m.profiles?.phone || '',
      bio: m.profiles?.bio || '',
      jersey_number: m.profiles?.jersey_number || '',
      nationality: m.profiles?.nationality || '',
    })
    setNewRoleId('')
    setAddingRole(false)
  }

  async function saveProfile(profileId: string) {
    setSaving(true)
    await fetch('/api/members/update-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, ...editForm }),
    })
    setSaving(false)
    setExpandedId(null)
    router.refresh()
  }

  async function addRole(profileId: string, clubId: string) {
    if (!newRoleId) return
    setSaving(true)
    await fetch('/api/members/add-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profileId, club_id: clubId, role_id: newRoleId }),
    })
    setSaving(false)
    setNewRoleId('')
    setAddingRole(false)
    router.refresh()
  }

  async function removeRole(membershipId: string) {
    if (!confirm('Ta bort denna roll?')) return
    await fetch('/api/members/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membership_id: membershipId, status: 'removed' }),
    })
    router.refresh()
  }

  async function toggleMemberStatus(membershipId: string, status: string) {
    await fetch('/api/members/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membership_id: membershipId, status }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Search and filter */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Sök namn eller e-post..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm" />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
          <option value="all">Alla roller</option>
          {roles.map(r => <option key={r.slug} value={r.slug}>{r.name_sv}</option>)}
        </select>
      </div>

      {/* Members list */}
      <div className="space-y-2">
        {groupedMembers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-8 text-center text-white/30 text-sm">Inga medlemmar hittades.</div>
        ) : groupedMembers.map(m => (
          <div key={m.profile_id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Member row */}
            <div
              className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => openEdit(m)}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: primaryColor }}>
                {m.profiles?.avatar_url
                  ? <img src={m.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  : m.profiles?.full_name?.charAt(0) || '?'}
              </div>

              {/* Name + email — click opens full profile */}
              <Link href={`/dashboard/members/${m.profile_id}`} className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                <p className="text-white text-sm font-medium truncate hover:underline">{m.profiles?.full_name}</p>
                <p className="text-white/30 text-xs truncate">{m.profiles?.email}</p>
              </Link>

              {/* Roles badges */}
              <div className="flex flex-wrap gap-1.5 max-w-xs justify-end">
                {m.allRoles.filter(Boolean).map((r: any) => (
                  <span key={r.id} className={`text-xs px-2 py-0.5 rounded-full ${r.is_board_role ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-white/10 text-white/50'}`}>
                    {r.name_sv}
                  </span>
                ))}
              </div>

              {/* Status */}
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${m.status === 'active' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-white/10 text-white/40'}`}>
                {m.status === 'active' ? 'Aktiv' : 'Inaktiv'}
              </span>

              {/* Expand icon */}
              <span className={`text-white/20 text-xs transition-transform ${expandedId === m.profile_id ? 'rotate-180' : ''}`}>▼</span>
            </div>

            {/* Inline edit panel */}
            {expandedId === m.profile_id && (
              <div className="border-t border-white/10 px-4 py-5 bg-white/3">
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Namn</label>
                    <input value={editForm.full_name} onChange={e => setEditForm((p: any) => ({ ...p, full_name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Telefon</label>
                    <input value={editForm.phone} onChange={e => setEditForm((p: any) => ({ ...p, phone: e.target.value }))}
                      placeholder="+46 70 000 00 00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Tröjnummer</label>
                    <input type="number" value={editForm.jersey_number} onChange={e => setEditForm((p: any) => ({ ...p, jersey_number: e.target.value }))}
                      placeholder="10"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Nationalitet</label>
                    <input value={editForm.nationality} onChange={e => setEditForm((p: any) => ({ ...p, nationality: e.target.value }))}
                      placeholder="Svensk"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/40 mb-1.5">Bio</label>
                    <textarea value={editForm.bio} onChange={e => setEditForm((p: any) => ({ ...p, bio: e.target.value }))}
                      rows={2} placeholder="Kort beskrivning om medlemmen..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none" />
                  </div>
                </div>

                {/* Roles management */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-white/40">Roller</label>
                    <button onClick={() => setAddingRole(!addingRole)}
                      className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-colors">
                      + Lägg till roll
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {m.allMemberships.filter((ms: any) => ms.status === 'active').map((ms: any) => (
                      <div key={ms.id} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1">
                        <span className="text-xs text-white">{ms.club_roles?.name_sv}</span>
                        {m.allMemberships.filter((x: any) => x.status === 'active').length > 1 && (
                          <button onClick={() => removeRole(ms.id)} className="text-white/30 hover:text-red-400 transition-colors text-xs">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {addingRole && (
                    <div className="flex gap-2">
                      <select value={newRoleId} onChange={e => setNewRoleId(e.target.value)}
                        className="flex-1 bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
                        <option value="">Välj roll att lägga till...</option>
                        {roles.filter(r => !m.allMemberships.some((ms: any) => ms.role_id === r.id && ms.status === 'active')).map(r => (
                          <option key={r.id} value={r.id}>{r.name_sv}</option>
                        ))}
                      </select>
                      <button onClick={() => addRole(m.profile_id, m.club_id)} disabled={!newRoleId || saving}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-black disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}>
                        Lägg till
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {m.profile_id !== userId && (
                      <button onClick={() => toggleMemberStatus(m.allMemberships[0].id, m.status === 'active' ? 'inactive' : 'active')}
                        className="text-xs px-3 py-1.5 border border-white/20 text-white/50 hover:text-white rounded-xl transition-colors">
                        {m.status === 'active' ? 'Inaktivera' : 'Aktivera'}
                      </button>
                    )}
                    <Link href={`/dashboard/members/${m.profile_id}`}
                      className="text-xs px-3 py-1.5 border border-white/20 text-white/50 hover:text-white rounded-xl transition-colors">
                      Visa profil →
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setExpandedId(null)}
                      className="text-xs px-3 py-1.5 border border-white/20 text-white/50 hover:text-white rounded-xl transition-colors">
                      Avbryt
                    </button>
                    <button onClick={() => saveProfile(m.profile_id)} disabled={saving}
                      className="text-xs px-4 py-1.5 rounded-xl font-semibold text-black disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: primaryColor }}>
                      {saving ? 'Sparar...' : 'Spara'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
