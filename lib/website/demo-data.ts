import type { ClubWebsiteData } from './templates/types'

const demoClubBase = {
  id: 'demo-club',
  subdomain: 'demo',
  name: 'Stockholm Idrottsklubb',
  tagline: 'Tillsammans mot nya mål',
  sport: 'multi_sport',
  city: 'Stockholm',
  founded_year: 1987,
  contact_email: 'info@klubben.se',
  contact_phone: '08-123 456 78',
  address: 'Idrottsvägen 12',
  website_url: 'https://klubben.se',
  primary_color: '#DC2626',
  logo_url: null,
  cover_url: 'https://images.unsplash.com/photo-1461896836934- voices? no - use proper url',
}

function makeDemoData(overrides: Partial<typeof demoClubBase>, templateSlug: string): ClubWebsiteData {
  const club = { ...demoClubBase, ...overrides, subdomain: templateSlug }
  return {
    club,
    roles: [
      { id: 'r1', slug: 'player', name_sv: 'Spelare' },
      { id: 'r2', slug: 'captain', name_sv: 'Lagkapten' },
      { id: 'r3', slug: 'coach', name_sv: 'Tränare' },
    ],
    boardMembers: [
      { id: 'b1', profiles: { full_name: 'Anna Lindström', avatar_url: null }, club_roles: { name_sv: 'Ordförande', is_board_role: true } },
      { id: 'b2', profiles: { full_name: 'Erik Johansson', avatar_url: null }, club_roles: { name_sv: 'Kassör', is_board_role: true } },
      { id: 'b3', profiles: { full_name: 'Maria Svensson', avatar_url: null }, club_roles: { name_sv: 'Sekreterare', is_board_role: true } },
    ],
    config: {
      hero_title: club.name,
      hero_subtitle: club.tagline,
      primary_cta_text: 'Ansök om medlemskap',
      welcome_message: 'Välkommen till vår klubb! Vi är en aktiv förening med engagerade medlemmar och spännande aktiviteter året runt.',
      website_template: templateSlug,
      theme_mode: 'dark',
    },
    posts: [
      { id: 'p1', title: 'Säsongen startar snart', content: 'Vi ser fram emot en spännande säsong med nya medlemmar och uppdaterade träningspass. Anmäl dig redan idag!', is_pinned: true, published_at: '2026-06-01', profiles: { full_name: 'Anna Lindström' } },
      { id: 'p2', title: 'Klubbmästerskap 2026', content: 'Anmälan till årets klubbmästerskap är nu öppen. Tävlingen arrangeras den 15 augusti.', is_pinned: false, published_at: '2026-05-20', profiles: { full_name: 'Erik Johansson' } },
    ],
    events: [],
    gallery: [
      { id: 'g1', image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80', caption: 'Matchdag' },
      { id: 'g2', image_url: 'https://images.unsplash.com/photo-1517649763961-0c62306601b7?w=600&q=80', caption: 'Träning' },
      { id: 'g3', image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80', caption: 'Lagfoto' },
      { id: 'g4', image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80', caption: 'Cupfinal' },
    ],
    sponsors: [
      { id: 's1', name: 'SportPro AB', logo_url: null, website_url: 'https://example.com', is_active: true },
      { id: 's2', name: 'Nordic Gear', logo_url: null, website_url: 'https://example.com', is_active: true },
    ],
    sections: [
      { id: 'sec1', type: 'news', title: 'Nyheter', is_visible: true, sort_order: 0 },
      { id: 'sec2', type: 'fixtures', title: 'Matcher & resultat', is_visible: true, sort_order: 1 },
      { id: 'sec3', type: 'league_table', title: 'Tabell', is_visible: true, sort_order: 2 },
      { id: 'sec4', type: 'players', title: 'Spelare', is_visible: true, sort_order: 3 },
      { id: 'sec5', type: 'board', title: 'Styrelse', is_visible: true, sort_order: 4 },
      { id: 'sec6', type: 'gallery', title: 'Galleri', is_visible: true, sort_order: 5 },
      { id: 'sec7', type: 'sponsors', title: 'Sponsorer', is_visible: true, sort_order: 6 },
    ],
    leagueTables: [{
      id: 'lt1', name: 'Division 2', season: '2025/26', is_active: true,
      league_table_entries: [
        { id: 'e1', team_name: 'IF Solna', played: 10, won: 7, drawn: 2, lost: 1, goals_for: 22, goals_against: 8, points: 23, is_our_team: false },
        { id: 'e2', team_name: club.name, played: 10, won: 6, drawn: 3, lost: 1, goals_for: 19, goals_against: 9, points: 21, is_our_team: true },
        { id: 'e3', team_name: 'BK Östermalm', played: 10, won: 5, drawn: 2, lost: 3, goals_for: 15, goals_against: 12, points: 17, is_our_team: false },
        { id: 'e4', team_name: 'FC Söder', played: 10, won: 4, drawn: 1, lost: 5, goals_for: 11, goals_against: 16, points: 13, is_our_team: false },
      ],
    }],
    fixtures: [
      { id: 'f1', home_team: club.name, away_team: 'IF Solna', match_date: '2026-07-05', match_time: '15:00', venue: 'Hemmaplan', competition: 'Serie', is_played: false },
      { id: 'f2', home_team: 'BK Östermalm', away_team: club.name, match_date: '2026-07-12', match_time: '14:00', venue: 'Bortaplan', competition: 'Serie', is_played: false },
      { id: 'f3', home_team: club.name, away_team: 'FC Söder', match_date: '2026-06-15', match_time: '16:00', venue: 'Hemmaplan', competition: 'Serie', is_played: true, home_score: 3, away_score: 1 },
      { id: 'f4', home_team: 'IF Solna', away_team: club.name, match_date: '2026-06-01', match_time: '15:00', venue: 'Bortaplan', competition: 'Serie', is_played: true, home_score: 2, away_score: 2 },
    ],
    members: [
      { id: 'm1', profiles: { full_name: 'Johan Andersson', avatar_url: null, jersey_number: 10 }, club_roles: { slug: 'captain', name_sv: 'Lagkapten' } },
      { id: 'm2', profiles: { full_name: 'Lisa Berg', avatar_url: null, jersey_number: 7 }, club_roles: { slug: 'player', name_sv: 'Spelare' } },
      { id: 'm3', profiles: { full_name: 'Oscar Nilsson', avatar_url: null, jersey_number: 1 }, club_roles: { slug: 'player', name_sv: 'Spelare' } },
      { id: 'm4', profiles: { full_name: 'Sara Ek', avatar_url: null, jersey_number: 9 }, club_roles: { slug: 'player', name_sv: 'Spelare' } },
      { id: 'm5', profiles: { full_name: 'Filip Holm', avatar_url: null, jersey_number: 4 }, club_roles: { slug: 'player', name_sv: 'Spelare' } },
      { id: 'm6', profiles: { full_name: 'Emma Lund', avatar_url: null, jersey_number: 11 }, club_roles: { slug: 'player', name_sv: 'Spelare' } },
    ],
  }
}

export const DEMO_DATA: Record<string, ClubWebsiteData> = {
  'multi-sport': makeDemoData({
    name: 'Stockholm Allsport IF',
    tagline: 'Fler sporter — ett lag',
    sport: 'multi_sport',
    cover_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80',
  }, 'multi-sport'),
  cricket: makeDemoData({
    name: 'Stockholm Cricket Club',
    tagline: 'Tradition, fair play & community',
    sport: 'cricket',
    cover_url: 'https://images.unsplash.com/photo-1531418848799-7f4b86d4fd47?w=1600&q=80',
  }, 'cricket'),
  football: makeDemoData({
    name: 'Djurgårdens BK Demo',
    tagline: 'Hjärta, kamp & seger',
    sport: 'football',
    cover_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80',
  }, 'football'),
  hockey: makeDemoData({
    name: 'Stockholm Ice Hockey',
    tagline: 'Snabb, hård och stolt',
    sport: 'hockey',
    cover_url: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=1600&q=80',
  }, 'hockey'),
  badminton: makeDemoData({
    name: 'Stockholm Badmintonklubb',
    tagline: 'Precision. Fart. Fair play.',
    sport: 'badminton',
    cover_url: 'https://images.unsplash.com/photo-1626224583764-f87db74ac4ea?w=1600&q=80',
  }, 'badminton'),
}

export function getDemoData(templateSlug: string): ClubWebsiteData | null {
  return DEMO_DATA[templateSlug] ?? null
}
