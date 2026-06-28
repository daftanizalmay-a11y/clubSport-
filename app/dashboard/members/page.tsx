import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import MembersClient from '@/components/dashboard/members/MembersClient'

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = createAdminClient()
  const { data: memberships } = await admin.from('club_memberships').select('*, clubs(*), club_roles(*)').eq('profile_id', user.id).eq('status', 'active')
  const club = memberships?.[0]?.clubs as any
  if (!club) redirect('/onboarding')
  const { data: members } = await admin.from('club_memberships').select('*, profiles(*), club_roles(*)').eq('club_id', club.id).order('created_at', { ascending: true })
  const { data: roles } = await admin.from('club_roles').select('*').not('slug', 'eq', 'superadmin').order('sort_order', { ascending: true })
  const { data: invitations } = await admin.from('invitations').select('*, club_roles(*)').eq('club_id', club.id).eq('status', 'pending').order('created_at', { ascending: false })
  const { data: joinRequests } = await admin.from('join_requests').select('*, club_roles(*)').eq('club_id', club.id).eq('status', 'pending').order('created_at', { ascending: false })
  return (
    <MembersClient
      club={club}
      members={members || []}
      roles={roles || []}
      invitations={invitations || []}
      joinRequests={joinRequests || []}
      userId={user.id}
    />
  )
}
