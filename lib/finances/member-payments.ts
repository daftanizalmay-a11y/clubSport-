import { groupMembersByProfile, type GroupedMember } from '@/lib/members/group-by-profile'
import {
  amountRemaining,
  derivePaymentStatus,
  resolveAmountDue,
  type PaymentStatus,
} from './payment-status'

export interface FeePaymentRecord {
  id: string
  profile_id: string
  season_id: string
  amount_sek?: number
  amount_due?: number | null
  amount_paid?: number | null
  status?: string | null
  paid_at?: string | null
  last_reminder_sent_at?: string | null
  reminder_count?: number | null
  notes?: string | null
}

export interface MemberPaymentRow {
  profile_id: string
  full_name: string
  email: string
  membership_status: string
  payment_id: string | null
  payment_status: PaymentStatus
  amount_due: number
  amount_paid: number
  amount_remaining: number
  amount_sek: number
  paid_at: string | null
  last_reminder_sent_at: string | null
  reminder_count: number
  notes: string | null
  due_date: string | null
  season_name: string | null
}

function resolveAmounts(payment: FeePaymentRecord | undefined, seasonAmount: number) {
  const amountDue = resolveAmountDue(payment, seasonAmount)
  let amountPaid = payment?.amount_paid ?? 0
  if (payment?.status === 'paid' && amountPaid === 0) amountPaid = amountDue
  return { amountDue, amountPaid }
}

export function buildMemberPaymentRows(
  members: GroupedMember[],
  payments: FeePaymentRecord[],
  seasonId: string,
  seasonAmount: number,
  dueDate?: string | null,
  seasonName?: string | null
): MemberPaymentRow[] {
  const seasonPayments = payments.filter(p => p.season_id === seasonId)

  return members.map(member => {
    const payment = seasonPayments.find(p => p.profile_id === member.profile_id)
    const { amountDue, amountPaid } = resolveAmounts(payment, seasonAmount)
    const remaining = amountRemaining(amountDue, amountPaid)

    let paymentStatus: PaymentStatus = 'missing'
    if (payment) {
      paymentStatus = derivePaymentStatus(payment.status, amountPaid, amountDue, dueDate)
    }

    return {
      profile_id: member.profile_id,
      full_name: member.profiles?.full_name || member.profiles?.email || 'Okänd',
      email: member.profiles?.email || '',
      membership_status: member.status,
      payment_id: payment?.id ?? null,
      payment_status: paymentStatus,
      amount_due: amountDue,
      amount_paid: amountPaid,
      amount_remaining: remaining,
      amount_sek: amountDue,
      paid_at: payment?.paid_at ?? null,
      last_reminder_sent_at: payment?.last_reminder_sent_at ?? null,
      reminder_count: payment?.reminder_count ?? 0,
      notes: payment?.notes ?? null,
      due_date: dueDate ?? null,
      season_name: seasonName ?? null,
    }
  }).sort((a, b) => a.full_name.localeCompare(b.full_name, 'sv'))
}

export function groupMembershipRows(rows: Record<string, unknown>[]): GroupedMember[] {
  return groupMembersByProfile(rows)
}

export function uniqueProfileIds(rows: { profile_id: string }[]): string[] {
  return [...new Set(rows.map(r => r.profile_id))]
}
