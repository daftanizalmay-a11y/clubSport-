'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MemberPaymentRow } from '@/lib/finances/member-payments'
import MembersPaymentList from './MembersPaymentList'
import { FINANCE_OPTION_CLASS, FINANCE_SELECT_CLASS } from './select-styles'

interface Props {
  club: { id: string; name: string; primary_color?: string }
  seasons: { id: string; name: string; amount_sek: number }[]
}

export default function SeasonManager({ club, seasons }: Props) {
  const router = useRouter()
  const primaryColor = club.primary_color || '#22c55e'
  const [showNewSeason, setShowNewSeason] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<string>(seasons[0]?.id || '')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [members, setMembers] = useState<MemberPaymentRow[]>([])
  const [missingCount, setMissingCount] = useState(0)
  const [form, setForm] = useState({ name: '', amount_sek: '', due_date: '', season_year: new Date().getFullYear().toString() })

  const currentSeason = seasons.find(s => s.id === selectedSeason)

  async function loadMembers() {
    if (!selectedSeason || !club.id) {
      setMembers([])
      return
    }
    setFetching(true)
    try {
      const params = new URLSearchParams({ season_id: selectedSeason })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/clubs/${club.id}/finances/payments?${params}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMembers(data.members || [])
      setMissingCount(data.summary?.missing ?? 0)
    } catch {
      setMembers([])
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club.id, selectedSeason, statusFilter])

  async function createSeason(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/finances/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, club_id: club.id, amount_sek: parseInt(form.amount_sek), season_year: parseInt(form.season_year) }),
    })
    if (res.ok) {
      setShowNewSeason(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function generatePayments() {
    if (!selectedSeason) return
    setLoading(true)
    await fetch('/api/finances/generate-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ season_id: selectedSeason, club_id: club.id }),
    })
    setLoading(false)
    await loadMembers()
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)}
            className={FINANCE_SELECT_CLASS}>
            {seasons.map(s => <option key={s.id} value={s.id} className={FINANCE_OPTION_CLASS}>{s.name} — {s.amount_sek} kr</option>)}
            {seasons.length === 0 && <option value="" className={FINANCE_OPTION_CLASS}>Ingen säsong ännu</option>}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className={FINANCE_SELECT_CLASS}>
            <option value="" className={FINANCE_OPTION_CLASS}>Alla statusar</option>
            <option value="partially_paid" className={FINANCE_OPTION_CLASS}>Delvis betald</option>
            <option value="unpaid" className={FINANCE_OPTION_CLASS}>Obetald</option>
            <option value="overdue" className={FINANCE_OPTION_CLASS}>Förfallen</option>
            <option value="paid" className={FINANCE_OPTION_CLASS}>Betald</option>
          </select>
        </div>
        <button type="button" onClick={() => setShowNewSeason(true)}
          className="font-semibold px-4 py-2 rounded-xl text-sm text-black cursor-pointer"
          style={{ backgroundColor: primaryColor }}>
          + Ny säsong
        </button>
      </div>

      {showNewSeason && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Ny avgiftssäsong</h3>
          <form onSubmit={createSeason} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Namn</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Belopp (kr)</label>
              <input required type="number" value={form.amount_sek} onChange={e => setForm(p => ({ ...p, amount_sek: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Förfallodatum</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowNewSeason(false)} className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm cursor-pointer">Avbryt</button>
              <button type="submit" disabled={loading} className="flex-1 font-semibold py-2.5 rounded-xl text-sm text-black disabled:opacity-50 cursor-pointer" style={{ backgroundColor: primaryColor }}>
                {loading ? 'Skapar...' : 'Skapa säsong'}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedSeason && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Medlemsavgifter — {currentSeason?.name}</h3>

          {fetching ? (
            <p className="text-white/40 text-sm">Laddar medlemmar...</p>
          ) : members.length === 0 ? (
            <p className="text-white/30 text-sm">Inga medlemmar matchar filtret.</p>
          ) : (
            <MembersPaymentList
              clubId={club.id}
              clubName={club.name}
              primaryColor={primaryColor}
              members={members}
              onRefresh={loadMembers}
              onGenerate={generatePayments}
              generating={loading}
              missingCount={missingCount}
            />
          )}
        </div>
      )}
    </div>
  )
}
