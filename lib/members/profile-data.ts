import type { SupabaseClient } from '@supabase/supabase-js'
import {
  amountRemaining,
  derivePaymentStatus,
  resolveAmountDue,
  type PaymentStatus,
} from '@/lib/finances/payment-status'

export interface MemberTeamRow {
  id: string
  team_id: string
  name: string
  label: string
  sport: string | null
  age_group: string | null
  gender: string | null
  season: string | null
  jersey_number: number | null
  is_active: boolean
  team_is_active: boolean
}

export interface MemberPaymentRow {
  id: string
  season_id: string
  season_name: string | null
  amount_due: number
  amount_paid: number
  amount_remaining: number
  status: PaymentStatus
  paid_at: string | null
  notes: string | null
  created_at: string
  reminder_count: number
  last_reminder_sent_at: string | null
}

export interface MemberReminderRow {
  id: string
  sent_at: string
  amount_remaining: number
  message: string | null
  payment_id: string | null
}

export interface MemberStatsRow {
  sport: string
  stats: Record<string, number | string | null>
}

function formatTeamLabel(team: {
  name: string
  age_group?: string | null
  gender?: string | null
  sport?: string | null
}) {
  const parts = [team.age_group, team.gender, team.sport].filter(Boolean)
  return parts.length ? `${team.name} (${parts.join(', ')})` : team.name
}

export async function fetchMemberTeams(
  admin: SupabaseClient,
  clubId: string,
  profileId: string
): Promise<MemberTeamRow[]> {
  const { data, error } = await admin
    .from('team_members')
    .select('id, team_id, jersey_number, is_active, teams(id, name, sport, age_group, gender, season, is_active)')
    .eq('club_id', clubId)
    .eq('profile_id', profileId)

  if (error || !data?.length) return []

  return data.map(row => {
    const rawTeam = row.teams
    const team = (Array.isArray(rawTeam) ? rawTeam[0] : rawTeam) as {
      id: string
      name: string
      sport: string | null
      age_group: string | null
      gender: string | null
      season: string | null
      is_active: boolean
    } | null | undefined
    return {
      id: row.id as string,
      team_id: row.team_id as string,
      name: team?.name || 'Okänt lag',
      sport: team?.sport ?? null,
      age_group: team?.age_group ?? null,
      gender: team?.gender ?? null,
      season: team?.season ?? null,
      jersey_number: row.jersey_number as number | null,
      is_active: row.is_active as boolean,
      team_is_active: team?.is_active ?? true,
      label: team ? formatTeamLabel(team) : 'Okänt lag',
    }
  }) as MemberTeamRow[]
}

export async function fetchMemberPayments(
  admin: SupabaseClient,
  clubId: string,
  profileId: string,
  limit = 10
): Promise<MemberPaymentRow[]> {
  const { data, error } = await admin
    .from('fee_payments')
    .select('*, fee_seasons(name, amount_sek, due_date)')
    .eq('club_id', clubId)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(p => {
    const season = p.fee_seasons as { name?: string; amount_sek?: number; due_date?: string | null } | null
    const amountDue = resolveAmountDue(p, season?.amount_sek ?? p.amount_sek ?? 0)
    const amountPaid = p.amount_paid ?? (p.status === 'paid' ? amountDue : 0)
    return {
      id: p.id,
      season_id: p.season_id,
      season_name: season?.name ?? null,
      amount_due: amountDue,
      amount_paid: amountPaid,
      amount_remaining: amountRemaining(amountDue, amountPaid),
      status: derivePaymentStatus(p.status, amountPaid, amountDue, season?.due_date),
      paid_at: p.paid_at,
      notes: p.notes,
      created_at: p.created_at,
      reminder_count: p.reminder_count ?? 0,
      last_reminder_sent_at: p.last_reminder_sent_at ?? p.reminder_sent_at ?? null,
    }
  })
}

export async function fetchMemberReminders(
  admin: SupabaseClient,
  clubId: string,
  profileId: string
): Promise<MemberReminderRow[]> {
  const { data, error } = await admin
    .from('fee_reminders')
    .select('id, sent_at, amount_remaining, message, payment_id')
    .eq('club_id', clubId)
    .eq('profile_id', profileId)
    .order('sent_at', { ascending: false })

  if (!error && data?.length) {
    return data as MemberReminderRow[]
  }

  // Fallback: synthesize from fee_payments when reminder log table is empty
  const payments = await fetchMemberPayments(admin, clubId, profileId, 20)
  const synthesized: MemberReminderRow[] = []
  for (const p of payments) {
    if (p.last_reminder_sent_at) {
      synthesized.push({
        id: `payment-${p.id}`,
        sent_at: p.last_reminder_sent_at,
        amount_remaining: p.amount_remaining,
        message: `Avgiftspåminnelse: ${p.amount_remaining} kr utestående`,
        payment_id: p.id,
      })
    }
  }
  return synthesized.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
}

export async function fetchMemberStats(
  admin: SupabaseClient,
  clubId: string,
  profileId: string,
  clubSport: string
): Promise<MemberStatsRow | null> {
  const { data } = await admin
    .from('member_stats')
    .select('sport, stats')
    .eq('club_id', clubId)
    .eq('profile_id', profileId)
    .eq('sport', clubSport)
    .maybeSingle()

  if (data) return { sport: data.sport, stats: data.stats as Record<string, number | string | null> }

  return { sport: clubSport, stats: {} }
}

export async function fetchMemberProfileCore(
  admin: SupabaseClient,
  clubId: string,
  profileId: string
) {
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (profileErr || !profile) return null

  const { data: memberships } = await admin
    .from('club_memberships')
    .select('id, status, joined_at, created_at, jersey_number, club_roles(id, slug, name_sv, name_en, is_board_role)')
    .eq('club_id', clubId)
    .eq('profile_id', profileId)
    .neq('status', 'removed')

  if (!memberships?.length) return null

  const activeMemberships = memberships.filter(m => m.status === 'active')
  const status = activeMemberships.length > 0
    ? 'active'
    : memberships.some(m => m.status === 'pending')
      ? 'pending'
      : 'inactive'

  const joinedAt = memberships.reduce((earliest, m) => {
    const d = m.joined_at || m.created_at
    return !earliest || (d && d < earliest) ? d : earliest
  }, null as string | null)

  const roles = activeMemberships
    .map(m => {
      const raw = m.club_roles
      return (Array.isArray(raw) ? raw[0] : raw) as {
        id: string
        slug: string
        name_sv: string
        name_en?: string
        is_board_role?: boolean
      } | null | undefined
    })
    .filter((r): r is NonNullable<typeof r> => r != null)

  let lastLogin: string | null = null
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(profileId)
    lastLogin = authUser.user?.last_sign_in_at ?? null
  } catch {
    lastLogin = null
  }

  return {
    profile,
    memberships,
    activeMemberships,
    status,
    joined_at: joinedAt,
    roles,
    last_login_at: lastLogin,
  }
}

export const STAT_LABELS: Record<string, Record<string, string>> = {
  cricket: {
    matches_played: 'Matcher',
    runs: 'Runs',
    wickets: 'Wickets',
    average: 'Snitt',
    strike_rate: 'Strike rate',
  },
  football: {
    matches_played: 'Matcher',
    goals: 'Mål',
    assists: 'Assists',
    yellow_cards: 'Gula kort',
    red_cards: 'Röda kort',
  },
  hockey: {
    matches_played: 'Matcher',
    goals: 'Mål',
    assists: 'Assists',
    plus_minus: 'Plus/Minus',
  },
  badminton: {
    matches_played: 'Matcher',
    wins: 'Vinster',
    losses: 'Förluster',
    win_rate: 'Vinstprocent',
  },
}
