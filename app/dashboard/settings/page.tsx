import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import SettingsClient from '@/components/dashboard/settings/SettingsClient'

export default async function SettingsPage() {
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

  const { data: feeTypes } = await admin
    .from('fee_types')
    .select('*')
    .eq('club_id', club.id)
    .order('sort_order', { ascending: true })

  return (
    <SettingsClient
      club={club}
      feeTypes={feeTypes || []}
      userId={user.id}
    />
  )
}
