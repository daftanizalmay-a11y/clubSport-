/** Display status used in UI and API responses */
export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid' | 'overdue' | 'missing' | 'waived'

/** Values stored in fee_payments.status (payment_status enum) */
export type DbPaymentStatus = 'pending' | 'paid' | 'overdue' | 'waived'

export function resolveAmountDue(
  payment: { amount_due?: number | null; amount_sek?: number | null } | undefined,
  seasonAmount: number
): number {
  const storedDue = payment?.amount_due ?? 0
  if (storedDue > 0) return storedDue
  return payment?.amount_sek ?? seasonAmount ?? 0
}

export function calculatePaymentStatus(
  amountPaid: number,
  amountDue: number,
  dueDate?: string | null,
  now = new Date()
): Exclude<PaymentStatus, 'missing' | 'waived'> {
  const paid = Math.max(0, Math.floor(amountPaid))
  const due = Math.max(0, Math.floor(amountDue))
  const remaining = due - paid

  if (due === 0 || remaining <= 0) return 'paid'
  if (dueDate) {
    const dueDay = new Date(dueDate)
    dueDay.setHours(23, 59, 59, 999)
    if (dueDay < now && paid === 0) return 'overdue'
  }
  if (paid > 0) return 'partially_paid'
  if (dueDate) {
    const dueDay = new Date(dueDate)
    dueDay.setHours(23, 59, 59, 999)
    if (dueDay < now) return 'overdue'
  }
  return 'unpaid'
}

/** Map display logic to valid payment_status enum values in the database */
export function toDbPaymentStatus(
  amountPaid: number,
  amountDue: number,
  dueDate?: string | null,
  existingStatus?: string | null,
  now = new Date()
): DbPaymentStatus {
  if (existingStatus === 'waived') return 'waived'
  const remaining = amountRemaining(amountDue, amountPaid)
  if (remaining <= 0) return 'paid'
  if (dueDate) {
    const dueDay = new Date(dueDate)
    dueDay.setHours(23, 59, 59, 999)
    if (dueDay < now) return 'overdue'
  }
  return 'pending'
}

export function derivePaymentStatus(
  dbStatus: string | null | undefined,
  amountPaid: number,
  amountDue: number,
  dueDate?: string | null,
  now = new Date()
): PaymentStatus {
  if (dbStatus === 'waived') return 'waived'
  return calculatePaymentStatus(amountPaid, amountDue, dueDate, now)
}

export function amountRemaining(amountDue: number, amountPaid: number): number {
  return Math.max(0, Math.floor(amountDue) - Math.floor(amountPaid))
}

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Betald',
  partially_paid: 'Delvis betald',
  unpaid: 'Obetald',
  overdue: 'Förfallen',
  missing: 'Ej genererad',
  waived: 'Undantagen',
}
