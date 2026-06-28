import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import EventsClient from '@/components/dashboard/events/EventsClient'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = createAdminClient()
  const { data: memberships } = await admin.from('club_memberships').select('*, clubs(*), club_roles(*)').eq('profile_id', user.id).eq('status', 'active')
  const club = memberships?.[0]?.clubs as any
  if (!club) redirect('/onboarding')
  return <EventsClient club={club} userId={user.id} />
}
