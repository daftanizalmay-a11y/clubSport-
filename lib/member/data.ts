import type { SupabaseClient } from '@supabase/supabase-js'
import {
  fetchMemberTeams,
} from '@/lib/members/profile-data'
import { derivePaymentStatus, resolveAmountDue, amountRemaining } from '@/lib/finances/payment-status'

export async function fetchMemberProfile(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin.from('profiles').select('*').eq('id', userId).single()
  if (error || !data) return null
  return data
}

export async function fetchMemberClubs(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from('club_memberships')
    .select('id, status, joined_at, created_at, clubs(id, name, subdomain, sport, primary_color, logo_url), club_roles(id, slug, name_sv, name_en)')
    .eq('profile_id', userId)
    .neq('status', 'removed')
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map(row => {
    const club = Array.isArray(row.clubs) ? row.clubs[0] : row.clubs
    const role = Array.isArray(row.club_roles) ? row.club_roles[0] : row.club_roles
    return {
      membership_id: row.id,
      status: row.status,
      joined_at: row.joined_at || row.created_at,
      club: club ? {
        id: club.id,
        name: club.name,
        subdomain: club.subdomain,
        sport: club.sport,
        primary_color: club.primary_color,
        logo_url: club.logo_url,
      } : null,
      role: role ? {
        id: role.id,
        slug: role.slug,
        name: role.name_sv || role.name_en || role.slug,
      } : null,
    }
  }).filter(r => r.club)
}

export async function fetchAllMemberTeamsWithClub(admin: SupabaseClient, userId: string) {
  const { data: memberships } = await admin
    .from('club_memberships')
    .select('club_id, clubs(id, name)')
    .eq('profile_id', userId)
    .eq('status', 'active')

  if (!memberships?.length) return []

  const results = []
  for (const m of memberships) {
    const club = Array.isArray(m.clubs) ? m.clubs[0] : m.clubs
    const teams = await fetchMemberTeams(admin, m.club_id as string, userId)
    for (const t of teams) {
      results.push({ ...t, club_id: m.club_id, club_name: club?.name || 'Klubb' })
    }
  }
  return results
}

export async function fetchAllMemberPayments(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from('fee_payments')
    .select('*, fee_seasons(name, amount_sek, due_date), clubs(name)')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(p => {
    const season = p.fee_seasons as { name?: string; amount_sek?: number; due_date?: string | null } | null
    const club = Array.isArray(p.clubs) ? p.clubs[0] : p.clubs
    const amountDue = resolveAmountDue(p, season?.amount_sek ?? p.amount_sek ?? 0)
    const amountPaid = p.amount_paid ?? (p.status === 'paid' ? amountDue : 0)
    return {
      id: p.id,
      club_id: p.club_id,
      club_name: (club as { name?: string } | null)?.name ?? null,
      season_id: p.season_id,
      season_name: season?.name ?? null,
      amount_due: amountDue,
      amount_paid: amountPaid,
      amount_remaining: amountRemaining(amountDue, amountPaid),
      status: derivePaymentStatus(p.status, amountPaid, amountDue, season?.due_date),
      paid_at: p.paid_at,
      notes: p.notes,
      created_at: p.created_at,
    }
  })
}

export async function fetchAllMemberReminders(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from('fee_reminders')
    .select('id, sent_at, amount_remaining, message, payment_id, club_id, clubs(name)')
    .eq('profile_id', userId)
    .order('sent_at', { ascending: false })

  if (!error && data?.length) {
    return data.map(r => {
      const club = Array.isArray(r.clubs) ? r.clubs[0] : r.clubs
      return {
        id: r.id,
        sent_at: r.sent_at,
        amount_remaining: r.amount_remaining,
        message: r.message,
        payment_id: r.payment_id,
        club_id: r.club_id,
        club_name: (club as { name?: string } | null)?.name ?? null,
        title: r.message || `Påminnelse: ${r.amount_remaining} kr`,
        amount: r.amount_remaining,
      }
    })
  }

  // Fallback from payments
  const payments = await fetchAllMemberPayments(admin, userId)
  const synthesized: {
    id: string
    sent_at: string
    amount_remaining: number
    message: string
    payment_id: string
    club_id: string
    club_name: string | null
    title: string
    amount: number
  }[] = []
  for (const p of payments) {
    const { data: raw } = await admin
      .from('fee_payments')
      .select('last_reminder_sent_at, reminder_sent_at')
      .eq('id', p.id)
      .maybeSingle()
    const sentAt = raw?.last_reminder_sent_at || raw?.reminder_sent_at
    if (sentAt) {
      synthesized.push({
        id: `payment-${p.id}`,
        sent_at: sentAt,
        amount_remaining: p.amount_remaining,
        message: `Avgiftspåminnelse: ${p.amount_remaining} kr utestående`,
        payment_id: p.id,
        club_id: p.club_id,
        club_name: p.club_name,
        title: `Avgiftspåminnelse (${p.club_name || 'Klubb'})`,
        amount: p.amount_remaining,
      })
    }
  }

  return synthesized.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
}

export async function fetchMemberDashboardStats(admin: SupabaseClient, userId: string) {
  const [clubs, teams, payments, reminders] = await Promise.all([
    fetchMemberClubs(admin, userId),
    fetchAllMemberTeamsWithClub(admin, userId),
    fetchAllMemberPayments(admin, userId),
    fetchAllMemberReminders(admin, userId),
  ])

  const activeClubs = clubs.filter(c => c.status === 'active')
  const outstanding = payments.reduce((sum, p) => sum + p.amount_remaining, 0)
  const latestPayment = payments[0]
  const feeStatus = outstanding <= 0
    ? 'paid'
    : latestPayment?.status === 'partially_paid'
      ? 'partially_paid'
      : 'unpaid'

  let matchesPlayed = 0
  const { data: statsRows } = await admin
    .from('member_stats')
    .select('stats')
    .eq('profile_id', userId)

  for (const row of statsRows || []) {
    const stats = row.stats as Record<string, number> | null
    matchesPlayed += stats?.matches_played ?? 0
  }

  return {
    clubs_count: activeClubs.length,
    teams_count: teams.filter(t => t.is_active).length,
    fee_status: feeStatus,
    outstanding_balance: outstanding,
    matches_played: matchesPlayed,
    teams: teams.slice(0, 5),
    recent_reminders: reminders.slice(0, 5),
    clubs: activeClubs,
  }
}
