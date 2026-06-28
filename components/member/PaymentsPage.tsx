'use client'

import { useEffect, useState } from 'react'
import StatusBadge from '@/components/dashboard/finances/StatusBadge'
import type { PaymentStatus } from '@/lib/finances/payment-status'
import { Card, formatDate } from './ui'

export default function PaymentsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/member/payments', { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-white/40 text-sm">Laddar betalningar...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mina avgifter</h1>
        <p className="text-white/40 text-sm mt-1">Betalningshistorik och utestående belopp</p>
      </div>

      {(data?.outstanding_balance ?? 0) > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-red-300/80 text-sm">Totalt utestående</p>
              <p className="text-3xl font-bold text-red-300">{data.outstanding_balance.toLocaleString('sv-SE')} kr</p>
            </div>
            <p className="text-white/40 text-sm max-w-xs text-right">
              Kontakta din klubb för betalningsinstruktioner.
            </p>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Betalningshistorik</h2>
        {!data?.payments?.length ? (
          <p className="text-white/30 text-sm">Inga betalningar registrerade.</p>
        ) : (
          <div className="space-y-3">
            {data.payments.map((p: any) => (
              <div key={p.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-white">{p.season_name || 'Medlemsavgift'}</p>
                    <p className="text-white/40 text-xs">{p.club_name}</p>
                  </div>
                  <StatusBadge status={p.status as PaymentStatus} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs">Förfallet</p>
                    <p className="text-white">{p.amount_due.toLocaleString('sv-SE')} kr</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Betalt</p>
                    <p className="text-[#22c55e]">{p.amount_paid.toLocaleString('sv-SE')} kr</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Kvar</p>
                    <p className={p.amount_remaining > 0 ? 'text-red-400' : 'text-white'}>
                      {p.amount_remaining.toLocaleString('sv-SE')} kr
                    </p>
                  </div>
                </div>
                {p.paid_at && (
                  <p className="text-white/30 text-xs mt-2">Betald {formatDate(p.paid_at)}</p>
                )}
                {p.notes && <p className="text-white/30 text-xs mt-1 italic">{p.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
