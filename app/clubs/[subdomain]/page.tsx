import { createAdminClient } from '@/lib/supabase/admin'
import ClubPublicPage from '@/components/public/ClubPublicPage'
import { getDemoData } from '@/lib/website/demo-data'
import { isTemplateSlug } from '@/lib/website/templates'

export default async function PublicClubPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params

  if (isTemplateSlug(subdomain)) {
    const demo = getDemoData(subdomain)
    if (demo) {
      return <ClubPublicPage {...demo} isDemo />
    }
  }

  const admin = createAdminClient()

  const { data: clubs } = await admin.from('clubs').select('*').eq('subdomain', subdomain).limit(1)
  const club = clubs?.[0]

  if (!club) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-white text-xl font-bold mb-2">Klubb hittades inte</p>
          <p className="text-white/40 text-sm mb-6">Kontrollera adressen och försök igen.</p>
          <p className="text-white/30 text-xs">Tillgängliga mallar: multi-sport, cricket, football, hockey, badminton</p>
        </div>
      </main>
    )
  }

  const [
    { data: rolesRaw },
    { data: members },
    { data: configArr },
    { data: posts },
    { data: events },
    { data: gallery },
    { data: sponsors },
    { data: sections },
    { data: leagueTables },
    { data: fixtures },
  ] = await Promise.all([
    admin.from('club_roles').select('*').order('sort_order', { ascending: true }),
    admin.from('club_memberships').select('*, profiles(*), club_roles(*)').eq('club_id', club.id).eq('status', 'active'),
    admin.from('club_website_config').select('*').eq('club_id', club.id).limit(1),
    admin.from('club_posts').select('*, profiles(full_name)').eq('club_id', club.id).eq('is_published', true).order('is_pinned', { ascending: false }).order('published_at', { ascending: false }),
    admin.from('events').select('*').eq('club_id', club.id).eq('is_cancelled', false).gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }).limit(5),
    admin.from('club_gallery').select('*').eq('club_id', club.id).order('sort_order', { ascending: true }).limit(12),
    admin.from('club_sponsors').select('*').eq('club_id', club.id).eq('is_active', true).order('sort_order', { ascending: true }),
    admin.from('club_website_sections').select('*').eq('club_id', club.id).eq('is_visible', true).order('sort_order', { ascending: true }),
    admin.from('league_tables').select('*, league_table_entries(*)').eq('club_id', club.id).order('created_at', { ascending: false }),
    admin.from('fixtures').select('*').eq('club_id', club.id).order('match_date', { ascending: false }),
  ])

  const roles = (rolesRaw || []).filter((r: { slug: string }) => r.slug !== 'superadmin' && r.slug !== 'club_admin')
  const boardMembers = (members || []).filter((m: { club_roles?: { is_board_role?: boolean } }) => m.club_roles?.is_board_role)

  return (
    <ClubPublicPage
      club={club}
      roles={roles}
      boardMembers={boardMembers}
      config={configArr?.[0] || null}
      posts={posts || []}
      events={events || []}
      gallery={gallery || []}
      sponsors={sponsors || []}
      sections={sections || []}
      leagueTables={leagueTables || []}
      fixtures={fixtures || []}
      members={members || []}
    />
  )
}
