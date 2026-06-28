import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ProfileClient from '@/components/profile/ProfileClient'

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('*').eq('id', params.id).single()
  if (!profile) redirect('/dashboard')

  const { data: memberships } = await admin
    .from('club_memberships')
    .select('*, clubs(*), club_roles(*)')
    .eq('profile_id', params.id)
    .eq('status', 'active')

  const { data: payments } = await admin
    .from('fee_payments')
    .select('*, fee_seasons(*)')
    .eq('profile_id', params.id)
    .order('created_at', { ascending: false })

  const isOwnProfile = user.id === params.id

  const { data: viewerMemberships } = await admin
    .from('club_memberships')
    .select('*, club_roles(*)')
    .eq('profile_id', user.id)
    .eq('status', 'active')

  const viewerIsAdmin = viewerMemberships?.some((m: any) =>
    ['club_admin', 'superadmin'].includes(m.club_roles?.slug)
  ) || false

  return (
    <ProfileClient
      profile={profile}
      memberships={memberships || []}
      payments={payments || []}
      isOwnProfile={isOwnProfile}
      canEdit={isOwnProfile || viewerIsAdmin}
    />
  )
}
