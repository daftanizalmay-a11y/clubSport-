import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import WebsiteClient from '@/components/dashboard/website/WebsiteClient'

export default async function WebsitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = createAdminClient()
  const { data: memberships } = await admin.from('club_memberships').select('*, clubs(*), club_roles(*)').eq('profile_id', user.id).eq('status', 'active')
  const membership = memberships?.[0]
  const rawClub = membership?.clubs
  const club = (Array.isArray(rawClub) ? rawClub[0] : rawClub) as { id: string; name: string; sport: string; primary_color?: string; subdomain?: string } | null
  if (!club?.id) redirect('/onboarding')
  const { data: configArr } = await admin.from('club_website_config').select('*').eq('club_id', club.id).limit(1)
  const config = configArr?.[0] || null
  const { data: posts } = await admin.from('club_posts').select('*, profiles(full_name)').eq('club_id', club.id).order('created_at', { ascending: false })
  const { data: sponsors } = await admin.from('club_sponsors').select('*').eq('club_id', club.id).order('sort_order', { ascending: true })
  const { data: gallery } = await admin.from('club_gallery').select('*').eq('club_id', club.id).order('sort_order', { ascending: true })
  const { data: sections } = await admin.from('club_website_sections').select('*').eq('club_id', club.id).order('sort_order', { ascending: true })
  const { data: leagueTables } = await admin.from('league_tables').select('*, league_table_entries(*)').eq('club_id', club.id).order('created_at', { ascending: false })
  const { data: fixtures } = await admin.from('fixtures').select('*').eq('club_id', club.id).order('match_date', { ascending: false })
  const { data: members } = await admin.from('club_memberships').select('*, profiles(*), club_roles(*)').eq('club_id', club.id).eq('status', 'active')
  return (
    <Suspense fallback={<p className="text-white/40 text-sm">Laddar klubbsida...</p>}>
      <WebsiteClient
        club={club}
        config={config}
        posts={posts || []}
        sponsors={sponsors || []}
        gallery={gallery || []}
        sections={sections || []}
        leagueTables={leagueTables || []}
        fixtures={fixtures || []}
        members={members || []}
        userId={user.id}
      />
    </Suspense>
  )
}
