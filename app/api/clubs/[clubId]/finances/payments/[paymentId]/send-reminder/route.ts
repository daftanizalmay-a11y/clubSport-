import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember, getClubOrError } from '@/lib/fixtures/auth'
import { sendFeeReminderEmail } from '@/lib/email'
import { amountRemaining, resolveAmountDue } from '@/lib/finances/payment-status'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; paymentId: string }> }
) {
  try {
    const { clubId, paymentId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const clubResult = await getClubOrError(auth.admin, clubId)
    if ('error' in clubResult) {
      return NextResponse.json({ success: false, error: clubResult.error }, { status: clubResult.status })
    }
    const { club } = clubResult

    const { data: payment, error: fetchErr } = await auth.admin
      .from('fee_payments')
      .select('*, profiles(full_name, email), fee_seasons(name, due_date)')
      .eq('id', paymentId)
      .eq('club_id', clubId)
      .single()

    if (fetchErr || !payment) {
      return NextResponse.json({ success: false, error: 'Betalning hittades inte' }, { status: 404 })
    }

    const profile = payment.profiles as { full_name?: string; email?: string } | null
    const season = payment.fee_seasons as { name?: string; due_date?: string | null } | null
    const email = profile?.email

    if (!email) {
      return NextResponse.json({ success: false, error: 'Medlemmen saknar e-postadress' }, { status: 400 })
    }

    const seasonAmount = (payment.fee_seasons as { amount_sek?: number } | null)?.amount_sek ?? payment.amount_sek ?? 0
    const amountDue = resolveAmountDue(payment, seasonAmount)
    const amountPaid = payment.amount_paid ?? 0
    const remaining = amountRemaining(amountDue, amountPaid)

    if (remaining <= 0) {
      return NextResponse.json({ success: false, error: 'Inget utestående belopp att påminna om' }, { status: 400 })
    }

    const emailResult = await sendFeeReminderEmail({
      to: email,
      memberName: profile?.full_name || email,
      clubName: club.name,
      clubColor: club.primary_color,
      seasonName: season?.name || 'Medlemsavgift',
      amountDue,
      amountPaid,
      amountRemaining: remaining,
      dueDate: season?.due_date,
    })

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: 'Kunde inte skicka e-post' }, { status: 500 })
    }

    const now = new Date().toISOString()
    const reminderCount = (payment.reminder_count ?? 0) + 1

    const { error: updateErr } = await auth.admin
      .from('fee_payments')
      .update({
        last_reminder_sent_at: now,
        reminder_count: reminderCount,
        reminder_sent_at: now,
      })
      .eq('id', paymentId)

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
    }

    try {
      await auth.admin.from('fee_reminders').insert({
        club_id: clubId,
        profile_id: payment.profile_id,
        payment_id: paymentId,
        amount_remaining: remaining,
        message: `Avgiftspåminnelse: ${remaining} kr utestående`,
        sent_at: now,
      })
    } catch {
      // fee_reminders table may not exist until migration is applied
    }

    return NextResponse.json({
      success: true,
      reminder_sent_at: now,
      reminder_count: reminderCount,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
