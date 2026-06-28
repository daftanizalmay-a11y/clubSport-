'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/dashboard/finances/StatusBadge'
import EditPaymentModal from '@/components/dashboard/finances/EditPaymentModal'
import SendReminderButton from '@/components/dashboard/finances/SendReminderButton'
import type { PaymentStatus } from '@/lib/finances/payment-status'

interface Props {
  clubId: string
  memberId: string
  userId: string
  isAdmin: boolean
  roles: { id: string; slug: string; name_sv: string }[]
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function formatDate(iso?: string | null, withTime = false) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('sv-SE', withTime
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'long', year: 'numeric' })
}

function membershipStatusLabel(status: string) {
  if (status === 'active') return 'Aktiv'
  if (status === 'pending') return 'Väntande'
  if (status === 'inactive') return 'Inaktiv'
  if (status === 'suspended') return 'Avstängd'
  return status
}

function membershipBadgeClass(status: string) {
  if (status === 'active') return 'bg-[#22c55e]/20 text-[#22c55e]'
  if (status === 'pending') return 'bg-yellow-400/20 text-yellow-400'
  return 'bg-white/10 text-white/40'
}

export default function MemberProfilePage({ clubId, memberId, userId, isAdmin, roles }: Props) {
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    bio: '',
    nationality: '',
    date_of_birth: '',
    address: '',
    emergency_contact: '',
    jersey_number: '',
  })

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clubs/${clubId}/members/${memberId}/profile`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kunde inte ladda profil')
      setMember(data)
      setEditForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        nationality: data.nationality || '',
        date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : '',
        address: data.address || '',
        emergency_contact: data.emergency_contact || '',
        jersey_number: data.jersey_number?.toString() || '',
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fel')
    } finally {
      setLoading(false)
    }
  }, [clubId, memberId])

  useEffect(() => { loadProfile() }, [loadProfile])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function saveProfile() {
    setSaving(true)
    await fetch('/api/members/update-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: memberId, ...editForm }),
    })
    setSaving(false)
    setEditing(false)
    showToast('Profil uppdaterad')
    loadProfile()
  }

  async function toggleStatus() {
    const primaryMembership = member?.memberships?.find((m: any) => m.status !== 'removed')
    if (!primaryMembership) return
    const newStatus = member.status === 'active' ? 'inactive' : 'active'
    await fetch('/api/members/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membership_id: primaryMembership.id, status: newStatus }),
    })
    showToast(newStatus === 'active' ? 'Medlem aktiverad' : 'Medlem inaktiverad')
    loadProfile()
    router.refresh()
  }

  async function removeMember() {
    if (!confirm('Ta bort medlemmen från klubben? Alla roller avslutas.')) return
    for (const m of member.memberships.filter((ms: any) => ms.status !== 'removed')) {
      await fetch('/api/members/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_id: m.id, status: 'removed' }),
      })
    }
    showToast('Medlem borttagen')
    router.push('/dashboard/members')
  }

  if (loading) {
    return <p className="text-white/40 text-sm">Laddar medlemsprofil...</p>
  }

  if (error || !member) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/members" className="text-white/40 hover:text-white text-sm">← Tillbaka till medlemmar</Link>
        <p className="text-red-400">{error || 'Medlemmen hittades inte'}</p>
      </div>
    )
  }

  const primaryColor = member.club?.primary_color || '#22c55e'
  const statEntries = Object.entries(member.stats?.stats || {}).filter(([, v]) => v != null && v !== '')
  const hasStats = statEntries.length > 0

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#22c55e] text-black font-medium px-4 py-2.5 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      <Link href="/dashboard/members" className="text-white/40 hover:text-white text-sm inline-block">← Tillbaka till medlemmar</Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-bold text-black flex-shrink-0"
            style={{ backgroundColor: primaryColor }}>
            {member.avatar_url
              ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
              : member.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{member.full_name || 'Okänd'}</h1>
            <p className="text-white/40 mt-1">{member.email}</p>
            {member.phone && <p className="text-white/40 text-sm">{member.phone}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${membershipBadgeClass(member.status)}`}>
                {membershipStatusLabel(member.status)}
              </span>
              {member.roles.map((r: any) => (
                <span key={r.id} className={`text-xs px-3 py-1 rounded-full ${r.is_board_role ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-white/10 text-white/50'}`}>
                  {r.name}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-white/30 space-y-0.5">
              <p>Medlem sedan {formatDate(member.joined_at)}</p>
              {member.last_login_at && <p>Senaste inloggning {formatDate(member.last_login_at, true)}</p>}
            </div>
          </div>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => setEditing(!editing)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-black cursor-pointer"
            style={{ backgroundColor: primaryColor }}>
            {editing ? 'Avbryt redigering' : 'Redigera profil'}
          </button>
        )}
      </div>

      {/* Membership */}
      <Card title="Medlemskap">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-white/40 text-sm">Status</p>
            <p className="text-white font-semibold">{membershipStatusLabel(member.status)}</p>
          </div>
          <div>
            <p className="text-white/40 text-sm">Medlem sedan</p>
            <p className="text-white font-semibold">{formatDate(member.joined_at)}</p>
          </div>
          <div>
            <p className="text-white/40 text-sm">Roller</p>
            <p className="text-white font-semibold">{member.roles.map((r: any) => r.name).join(', ') || '—'}</p>
          </div>
        </div>
        {isAdmin && memberId !== userId && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            <button type="button" onClick={toggleStatus}
              className="text-xs px-3 py-1.5 border border-white/20 text-white/60 hover:text-white rounded-xl cursor-pointer">
              {member.status === 'active' ? 'Inaktivera medlem' : 'Aktivera medlem'}
            </button>
            <button type="button" onClick={removeMember}
              className="text-xs px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer">
              Ta bort från klubben
            </button>
          </div>
        )}
      </Card>

      {/* Fees */}
      <Card title="Avgifter & betalningar">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/40 text-sm">Nuvarande status</span>
            <StatusBadge status={(member.latest_fee_status || 'missing') as PaymentStatus} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/40 text-xs">Förfallet</p>
              <p className="text-white font-semibold">{member.amount_due?.toLocaleString('sv-SE') ?? 0} kr</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Betalt</p>
              <p className="text-[#22c55e] font-semibold">{member.amount_paid?.toLocaleString('sv-SE') ?? 0} kr</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Återstående</p>
              <p className={`font-semibold ${member.outstanding_balance > 0 ? 'text-red-400' : 'text-[#22c55e]'}`}>
                {member.outstanding_balance?.toLocaleString('sv-SE') ?? 0} kr
              </p>
            </div>
          </div>
          {member.outstanding_balance > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex justify-between items-center">
              <span className="text-red-300 text-sm">Utestående belopp</span>
              <span className="font-bold text-red-300">{member.outstanding_balance.toLocaleString('sv-SE')} kr</span>
            </div>
          )}
          {member.payments?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide">Senaste betalningar</p>
              {member.payments.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white">{p.season_name || 'Avgift'}</p>
                    <p className="text-white/30 text-xs">{formatDate(p.paid_at || p.created_at, true)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{p.amount_paid.toLocaleString('sv-SE')} / {p.amount_due.toLocaleString('sv-SE')} kr</p>
                    <StatusBadge status={p.status as PaymentStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/dashboard/finances"
              className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg">
              Visa alla betalningar
            </Link>
            {isAdmin && member.current_payment_id && (
              <EditPaymentModal
                clubId={clubId}
                paymentId={member.current_payment_id}
                currentAmount={member.amount_paid ?? 0}
                dueAmount={member.amount_due ?? 0}
                primaryColor={primaryColor}
                onSave={() => { showToast('Betalning uppdaterad'); loadProfile() }}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Reminders */}
      <Card title="Påminnelser">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/40 text-sm">Totalt skickade</span>
            <span className="text-white font-bold">{member.reminder_count} st</span>
          </div>
          {member.last_reminder_sent_at && (
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Senaste påminnelse</span>
              <span className="text-white/60">{formatDate(member.last_reminder_sent_at, true)}</span>
            </div>
          )}
          {member.reminders?.length > 0 && (
            <ul className="space-y-2 pt-2 border-t border-white/10">
              {member.reminders.map((r: any) => (
                <li key={r.id} className="text-sm text-white/50 flex gap-2">
                  <span className="text-white/30 flex-shrink-0">{formatDate(r.sent_at, true)}</span>
                  <span>— {r.message || `Påminnelse: ${r.amount_remaining} kr utestående`}</span>
                </li>
              ))}
            </ul>
          )}
          {isAdmin && member.outstanding_balance > 0 && member.current_payment_id && (
            <SendReminderButton
              clubId={clubId}
              paymentId={member.current_payment_id}
              memberName={member.full_name}
              amountRemaining={member.outstanding_balance}
              lastReminder={member.last_reminder_sent_at}
              reminderCount={member.reminder_count}
              onSent={() => { showToast('Påminnelse skickad'); loadProfile() }}
            />
          )}
        </div>
      </Card>

      {/* Teams */}
      <Card title="Lag">
        {member.teams?.length === 0 ? (
          <p className="text-white/30 text-sm">Medlemmen tillhör inga lag ännu.</p>
        ) : (
          <div className="space-y-2">
            {member.teams.map((team: any) => (
              <Link key={team.id} href={`/dashboard/teams?highlight=${team.team_id}`}
                className="block p-3 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] transition-colors">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-semibold text-white">{team.name}</p>
                    <p className="text-sm text-white/40">
                      {[team.age_group, team.gender, team.sport].filter(Boolean).join(' · ')}
                    </p>
                    {team.jersey_number != null && (
                      <p className="text-xs text-white/30 mt-1">Tröjnr {team.jersey_number}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${team.is_active && team.team_is_active ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-white/10 text-white/40'}`}>
                    {team.is_active && team.team_is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Statistics */}
      {member.stats && (
        <Card title="Statistik">
          {hasStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {statEntries.map(([key, value]) => (
                <div key={key}>
                  <p className="text-white/40 text-sm">{member.stat_labels?.[key] || key}</p>
                  <p className="text-2xl font-bold text-white">{String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm">Ingen statistik registrerad för {member.stats.sport || 'denna sport'}.</p>
          )}
        </Card>
      )}

      {/* Contact & details */}
      <Card title="Kontakt & uppgifter">
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/40 mb-1">Namn</label>
              <input value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Telefon</label>
              <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Födelsedatum</label>
              <input type="date" value={editForm.date_of_birth} onChange={e => setEditForm(p => ({ ...p, date_of_birth: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Nationalitet</label>
              <input value={editForm.nationality} onChange={e => setEditForm(p => ({ ...p, nationality: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Tröjnummer</label>
              <input type="number" value={editForm.jersey_number} onChange={e => setEditForm(p => ({ ...p, jersey_number: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/40 mb-1">Adress</label>
              <input value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/40 mb-1">Nödkontakt</label>
              <input value={editForm.emergency_contact} onChange={e => setEditForm(p => ({ ...p, emergency_contact: e.target.value }))}
                placeholder="Namn och telefon"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-white/40 mb-1">Bio</label>
              <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-white/20 text-white py-2 rounded-xl text-sm cursor-pointer">Avbryt</button>
              <button type="button" onClick={saveProfile} disabled={saving}
                className="flex-1 font-semibold py-2 rounded-xl text-sm text-black disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: primaryColor }}>
                {saving ? 'Sparar...' : 'Spara profil'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-white/40">Telefon</p><p className="text-white">{member.phone || '—'}</p></div>
            <div><p className="text-white/40">Födelsedatum</p><p className="text-white">{member.date_of_birth ? formatDate(member.date_of_birth) : '—'}</p></div>
            <div><p className="text-white/40">Nationalitet</p><p className="text-white">{member.nationality || '—'}</p></div>
            <div><p className="text-white/40">Tröjnummer</p><p className="text-white">{member.jersey_number ?? '—'}</p></div>
            <div className="sm:col-span-2"><p className="text-white/40">Adress</p><p className="text-white">{member.address || '—'}</p></div>
            <div className="sm:col-span-2"><p className="text-white/40">Nödkontakt</p><p className="text-white">{member.emergency_contact || '—'}</p></div>
            {member.bio && <div className="sm:col-span-2"><p className="text-white/40">Bio</p><p className="text-white/70">{member.bio}</p></div>}
          </div>
        )}
      </Card>

      {/* Admin actions */}
      {isAdmin && (
        <Card title="Administration">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setEditing(true)}
              className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg cursor-pointer">
              Redigera medlemsuppgifter
            </button>
            {member.email && (
              <a href={`mailto:${member.email}`}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg">
                Skicka e-post
              </a>
            )}
            <Link href="/dashboard/members"
              className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg">
              Hantera roller
            </Link>
          </div>
          <p className="text-white/20 text-xs mt-3">Revisionslogg kommer i en framtida version.</p>
        </Card>
      )}
    </div>
  )
}
