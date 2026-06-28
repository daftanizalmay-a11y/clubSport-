'use client'

import { useAuth } from '@/lib/supabase/hooks'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, formatDate } from './ui'

export default function MemberDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    Promise.all([
      fetch('/api/member/profile', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/member/stats', { credentials: 'include' }).then(r => r.json()),
    ]).then(([profileData, statsData]) => {
      if (!profileData.error) setProfile(profileData)
      if (!statsData.error) setStats(statsData)
    }).finally(() => setLoading(false))
  }, [authLoading])

  if (loading || authLoading) {
    return <p className="text-white/40 text-sm">Laddar...</p>
  }

  const feeLabel = stats?.fee_status === 'paid'
    ? 'Betald ✓'
    : stats?.fee_status === 'partially_paid'
      ? 'Delvis betald'
      : 'Öppen'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Mina sidor</h1>
        <p className="text-white/40 mt-1">
          Välkommen{profile?.full_name ? `, ${profile.full_name}` : ''}{user?.email ? ` (${user.email})` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-white/40 text-sm">Klubbar</div>
          <div className="text-3xl font-bold text-white mt-1">{stats?.clubs_count ?? 0}</div>
        </Card>
        <Card>
          <div className="text-white/40 text-sm">Lag</div>
          <div className="text-3xl font-bold text-white mt-1">{stats?.teams_count ?? 0}</div>
        </Card>
        <Card>
          <div className="text-white/40 text-sm">Medlemsavgift</div>
          <div className={`text-2xl font-bold mt-1 ${stats?.fee_status === 'paid' ? 'text-[#22c55e]' : 'text-red-400'}`}>
            {feeLabel}
          </div>
        </Card>
        <Card>
          <div className="text-white/40 text-sm">Matcher</div>
          <div className="text-3xl font-bold text-white mt-1">{stats?.matches_played ?? 0}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-3">Min profil</h3>
          {profile && (
            <div className="space-y-2 mb-4 text-sm">
              <div>
                <p className="text-white/40">Namn</p>
                <p className="font-semibold text-white">{profile.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-white/40">E-post</p>
                <p className="text-white/70">{profile.email}</p>
              </div>
            </div>
          )}
          <Link href="/member/profile"
            className="block text-center w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold py-2.5 rounded-xl text-sm">
            Redigera profil
          </Link>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-3">Medlemsavgifter</h3>
          {stats?.outstanding_balance > 0 ? (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
              <p className="text-sm text-red-300/80">Återstår att betala</p>
              <p className="text-2xl font-bold text-red-300">{stats.outstanding_balance.toLocaleString('sv-SE')} kr</p>
            </div>
          ) : (
            <div className="p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl mb-4">
              <p className="text-[#22c55e] text-sm">✓ Uppdaterad</p>
            </div>
          )}
          <Link href="/member/payments"
            className="block text-center w-full border border-white/20 hover:border-white/40 text-white py-2.5 rounded-xl text-sm">
            Min betalningshistorik
          </Link>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-3">Mina lag</h3>
          <div className="space-y-2 mb-4">
            {(stats?.teams?.length ?? 0) === 0 ? (
              <p className="text-white/30 text-sm">Du tillhör inga lag ännu.</p>
            ) : stats.teams.slice(0, 3).map((team: any) => (
              <div key={team.id} className="p-2 bg-white/5 rounded-lg text-sm">
                <p className="font-semibold text-white">{team.name}</p>
                <p className="text-white/40 text-xs">{team.club_name} · {team.sport}</p>
              </div>
            ))}
          </div>
          <Link href="/member/teams"
            className="block text-center w-full border border-white/20 hover:border-white/40 text-white py-2.5 rounded-xl text-sm">
            Visa alla lag
          </Link>
        </Card>
      </div>

      {stats?.recent_reminders?.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Senaste meddelanden</h3>
          <div className="space-y-2">
            {stats.recent_reminders.map((reminder: any) => (
              <div key={reminder.id} className="p-3 bg-white/[0.03] border border-white/10 rounded-xl flex justify-between gap-3">
                <div>
                  <p className="font-semibold text-white text-sm">{reminder.title || reminder.message}</p>
                  <p className="text-xs text-white/40">{formatDate(reminder.sent_at)}</p>
                </div>
                <span className="text-white/60 text-sm flex-shrink-0">{reminder.amount?.toLocaleString('sv-SE')} kr</span>
              </div>
            ))}
          </div>
          <Link href="/member/reminders" className="inline-block mt-3 text-sm text-[#22c55e] hover:underline">
            Visa alla påminnelser →
          </Link>
        </Card>
      )}
    </div>
  )
}
