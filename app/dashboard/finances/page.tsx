import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import FinancesClient from '@/components/dashboard/finances/FinancesClient'
import { groupMembersByProfile } from '@/lib/members/group-by-profile'

export default async function FinancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()

  const { data: memberships } = await admin
    .from('club_memberships')
    .select('*, clubs(*), club_roles(*)')
    .eq('profile_id', user.id)
    .eq('status', 'active')

  const club = memberships?.[0]?.clubs as any
  if (!club) redirect('/onboarding')

  const { data: seasons } = await admin
    .from('fee_seasons')
    .select('*')
    .eq('club_id', club.id)
    .order('season_year', { ascending: false })

  const { data: payments } = await admin
    .from('fee_payments')
    .select('*, profiles(*), fee_seasons(*)')
    .eq('club_id', club.id)
    .order('created_at', { ascending: false })

  const { data: expenses } = await admin
    .from('expenses')
    .select('*, profiles!expenses_submitted_by_fkey(*)')
    .eq('club_id', club.id)
    .order('created_at', { ascending: false })

  const { data: memberRows } = await admin
    .from('club_memberships')
    .select('*, profiles(*)')
    .eq('club_id', club.id)
    .eq('status', 'active')

  const uniqueMembers = groupMembersByProfile(memberRows || [])

  return (
    <FinancesClient
      club={club}
      seasons={seasons || []}
      payments={payments || []}
      expenses={expenses || []}
      members={uniqueMembers}
      userId={user.id}
    />
  )
}
