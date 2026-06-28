'use client'

import type { PaymentStatus } from '@/lib/finances/payment-status'
import { STATUS_LABELS } from '@/lib/finances/payment-status'

const STYLES: Record<PaymentStatus, string> = {
  paid: 'bg-[#22c55e]/20 text-[#22c55e]',
  partially_paid: 'bg-yellow-400/20 text-yellow-400',
  unpaid: 'bg-red-500/20 text-red-400',
  overdue: 'bg-red-700/30 text-red-300',
  missing: 'bg-white/5 text-white/30',
  waived: 'bg-white/10 text-white/40',
}

const ICONS: Partial<Record<PaymentStatus, string>> = {
  paid: '✓',
  partially_paid: '⚠',
  unpaid: '✗',
  overdue: '!',
}

export default function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${STYLES[status] || STYLES.unpaid}`}>
      {ICONS[status] && <span>{ICONS[status]}</span>}
      {STATUS_LABELS[status] || status}
    </span>
  )
}
