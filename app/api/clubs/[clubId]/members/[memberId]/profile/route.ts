import { NextRequest, NextResponse } from 'next/server'
import { requireClubMember, getClubOrError } from '@/lib/fixtures/auth'
import {
  fetchMemberPayments,
  fetchMemberProfileCore,
  fetchMemberReminders,
  fetchMemberStats,
  fetchMemberTeams,
  STAT_LABELS,
} from '@/lib/members/profile-data'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; memberId: string }> }
) {
  try {
    const { clubId, memberId } = await params
    const auth = await requireClubMember(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const clubResult = await getClubOrError(auth.admin, clubId)
    if ('error' in clubResult) {
      return NextResponse.json({ error: clubResult.error }, { status: clubResult.status })
    }
    const { club } = clubResult

    const core = await fetchMemberProfileCore(auth.admin, clubId, memberId)
    if (!core) {
      return NextResponse.json({ error: 'Medlemmen hittades inte' }, { status: 404 })
    }

    const [teams, payments, reminders, statsRow] = await Promise.all([
      fetchMemberTeams(auth.admin, clubId, memberId),
      fetchMemberPayments(auth.admin, clubId, memberId, 10),
      fetchMemberReminders(auth.admin, clubId, memberId),
      fetchMemberStats(auth.admin, clubId, memberId, club.sport || 'other'),
    ])

    const currentPayment = payments[0] ?? null
    const totalReminders = reminders.length || payments.reduce((n, p) => n + (p.reminder_count || 0), 0)
    const lastReminder = reminders[0]?.sent_at ?? payments.find(p => p.last_reminder_sent_at)?.last_reminder_sent_at ?? null

    return NextResponse.json({
      id: core.profile.id,
      full_name: core.profile.full_name,
      email: core.profile.email,
      phone: core.profile.phone,
      avatar_url: core.profile.avatar_url,
      bio: core.profile.bio,
      date_of_birth: core.profile.date_of_birth,
      nationality: core.profile.nationality,
      address: core.profile.address,
      emergency_contact: core.profile.emergency_contact,
      jersey_number: core.profile.jersey_number,
      status: core.status,
      joined_at: core.joined_at,
      last_login_at: core.last_login_at,
      roles: core.roles.map(r => ({
        id: r!.id,
        slug: r!.slug,
        name: r!.name_sv || r!.name_en || r!.slug,
        is_board_role: r!.is_board_role ?? false,
      })),
      memberships: core.memberships,
      current_payment: currentPayment,
      latest_fee_status: currentPayment?.status ?? 'missing',
      amount_due: currentPayment?.amount_due ?? 0,
      amount_paid: currentPayment?.amount_paid ?? 0,
      outstanding_balance: currentPayment?.amount_remaining ?? 0,
      current_payment_id: currentPayment?.id ?? null,
      payments: payments.slice(0, 5),
      reminder_count: totalReminders,
      last_reminder_sent_at: lastReminder,
      reminders: reminders.slice(0, 10),
      teams,
      stats: statsRow,
      stat_labels: STAT_LABELS[club.sport || ''] ?? {},
      club: { id: club.id, name: club.name, sport: club.sport, primary_color: club.primary_color },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
