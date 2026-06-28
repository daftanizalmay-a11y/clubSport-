'use client'
import { useState } from 'react'
import SeasonManager from './SeasonManager'
import PaymentsTracker from './PaymentsTracker'
import ExpensesTracker from './ExpensesTracker'

interface Props {
  club: any
  seasons: any[]
  payments: any[]
  expenses: any[]
  members: any[]
  userId: string
}

const tabs = [
  { id: 'overview', label: 'Översikt', icon: '📊' },
  { id: 'fees', label: 'Medlemsavgifter', icon: '💳' },
  { id: 'expenses', label: 'Utgifter & kvitton', icon: '🧾' },
]

export default function FinancesClient({ club, seasons, payments, expenses, members, userId }: Props) {
  const [activeTab, setActiveTab] = useState('overview')

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_sek, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount_sek, 0)
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount_sek, 0)
  const totalExpenses = expenses.filter(e => e.status === 'approved' || e.status === 'reimbursed').reduce((sum, e) => sum + e.amount_sek, 0)
  const pendingExpenses = expenses.filter(e => e.status === 'submitted').length
  const netBalance = totalCollected - totalExpenses

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Ekonomi</p>
        <h1 className="text-3xl font-bold text-white">Finanser</h1>
        <p className="text-white/50 mt-1">{club.name}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-2xl font-bold text-[#22c55e]">{totalCollected.toLocaleString('sv-SE')} kr</p>
          <p className="text-white/40 text-sm mt-1">Inbetalt</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-2xl mb-2">⏳</p>
          <p className="text-2xl font-bold text-yellow-400">{totalPending.toLocaleString('sv-SE')} kr</p>
          <p className="text-white/40 text-sm mt-1">Väntande</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-2xl mb-2">🧾</p>
          <p className="text-2xl font-bold text-[#f97316]">{totalExpenses.toLocaleString('sv-SE')} kr</p>
          <p className="text-white/40 text-sm mt-1">Utgifter</p>
          {pendingExpenses > 0 && (
            <p className="text-xs text-yellow-400 mt-1">{pendingExpenses} väntar granskning</p>
          )}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-2xl mb-2">💰</p>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-[#22c55e]' : 'text-red-400'}`}>
            {netBalance.toLocaleString('sv-SE')} kr
          </p>
          <p className="text-white/40 text-sm mt-1">Nettosaldo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white'}`}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment status breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Betalningsstatus</h2>
            {payments.length === 0 ? (
              <p className="text-white/30 text-sm">Inga betalningar ännu. Skapa en avgiftssäsong först.</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Betalda', status: 'paid', color: '#22c55e' },
                  { label: 'Väntande', status: 'pending', color: '#facc15' },
                  { label: 'Förfallna', status: 'overdue', color: '#ef4444' },
                  { label: 'Undantagna', status: 'waived', color: '#94a3b8' },
                ].map((s) => {
                  const count = payments.filter(p => p.status === s.status).length
                  const pct = payments.length > 0 ? Math.round((count / payments.length) * 100) : 0
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">{s.label}</span>
                        <span className="text-white font-medium">{count} st ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent expenses */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Senaste utgifter</h2>
            {expenses.length === 0 ? (
              <p className="text-white/30 text-sm">Inga utgifter inlämnade ännu.</p>
            ) : (
              <div className="space-y-3">
                {expenses.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{e.title}</p>
                      <p className="text-white/30 text-xs">{e.profiles?.full_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">{e.amount_sek.toLocaleString('sv-SE')} kr</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        e.status === 'approved' || e.status === 'reimbursed' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                        e.status === 'submitted' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{e.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <SeasonManager club={club} seasons={seasons} />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTracker club={club} expenses={expenses} userId={userId} />
      )}
    </div>
  )
}
