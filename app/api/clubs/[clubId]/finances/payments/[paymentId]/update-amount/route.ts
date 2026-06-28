import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember } from '@/lib/fixtures/auth'
import {
  amountRemaining,
  calculatePaymentStatus,
  resolveAmountDue,
  toDbPaymentStatus,
  STATUS_LABELS,
} from '@/lib/finances/payment-status'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; paymentId: string }> }
) {
  try {
    const { clubId, paymentId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await req.json()
    const amountPaid = Math.max(0, Math.floor(Number(body.amount_paid) || 0))
    const notes = body.notes != null ? String(body.notes) : undefined

    const { data: payment, error: fetchErr } = await auth.admin
      .from('fee_payments')
      .select('*, fee_seasons(due_date, name, amount_sek)')
      .eq('id', paymentId)
      .eq('club_id', clubId)
      .single()

    if (fetchErr || !payment) {
      return NextResponse.json({ success: false, error: 'Betalning hittades inte' }, { status: 404 })
    }

    const season = payment.fee_seasons as { due_date?: string | null; name?: string; amount_sek?: number } | null
    const seasonAmount = season?.amount_sek ?? payment.amount_sek ?? 0
    const amountDue = resolveAmountDue(payment, seasonAmount)

    if (amountPaid > amountDue) {
      return NextResponse.json({ success: false, error: 'Betalt belopp kan inte överstiga förfallet belopp' }, { status: 400 })
    }

    const displayStatus = calculatePaymentStatus(amountPaid, amountDue, season?.due_date)
    const dbStatus = toDbPaymentStatus(amountPaid, amountDue, season?.due_date, payment.status)
    const remaining = amountRemaining(amountDue, amountPaid)

    const update: Record<string, unknown> = {
      amount_paid: amountPaid,
      status: dbStatus,
      paid_at: dbStatus === 'paid' ? new Date().toISOString() : null,
    }
    if (notes !== undefined) update.notes = notes
    if (!payment.amount_due || payment.amount_due === 0) {
      update.amount_due = amountDue
    }

    const { error: updateErr } = await auth.admin
      .from('fee_payments')
      .update(update)
      .eq('id', paymentId)

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      status: displayStatus,
      status_label: STATUS_LABELS[displayStatus],
      amount_paid: amountPaid,
      amount_due: amountDue,
      amount_remaining: remaining,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
