import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AIClient from '@/components/dashboard/ai/AIClient'

export default async function AIPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = createAdminClient()
  const { data: memberships } = await admin.from('club_memberships').select('*, clubs(*), club_roles(*)').eq('profile_id', user.id).eq('status', 'active')
  const club = memberships?.[0]?.clubs as any
  if (!club) redirect('/onboarding')
  const { data: members } = await admin.from('club_memberships').select('*, profiles(*), club_roles(*)').eq('club_id', club.id).eq('status', 'active')
  const { data: teams } = await admin.from('teams').select('*').eq('club_id', club.id)
  return <AIClient club={club} members={members || []} teams={teams || []} userId={user.id} />
}
