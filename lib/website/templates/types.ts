export type ThemeMode = 'light' | 'dark'

export type HeroVariant = 'classic' | 'split' | 'diagonal' | 'fullscreen' | 'minimal'

export type FixturesStyle = 'cards' | 'scorecard' | 'timeline' | 'compact'

export type PlayersStyle = 'grid' | 'roster' | 'cards'

export type LeagueTableStyle = 'classic' | 'striped' | 'minimal'

export interface ThemeTokens {
  primary: string
  onPrimary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  card: string
  cardForeground: string
  heroOverlay: string
  navbar: string
  destructive: string
}

export interface WebsiteTemplate {
  id: string
  slug: string
  name: string
  nameSv: string
  description: string
  sport: string
  pattern: string
  style: string
  fonts: {
    heading: string
    body: string
    googleFontsUrl: string
  }
  light: ThemeTokens
  dark: ThemeTokens
  heroVariant: HeroVariant
  sectionStyles: {
    fixtures: FixturesStyle
    players: PlayersStyle
    leagueTable: LeagueTableStyle
  }
  spacing: {
    section: string
    container: string
    radius: string
  }
}

export interface ClubWebsiteData {
  club: Record<string, unknown>
  roles: Record<string, unknown>[]
  boardMembers: Record<string, unknown>[]
  config: Record<string, unknown> | null
  posts: Record<string, unknown>[]
  events: Record<string, unknown>[]
  gallery: Record<string, unknown>[]
  sponsors: Record<string, unknown>[]
  sections: Record<string, unknown>[]
  leagueTables: Record<string, unknown>[]
  fixtures: Record<string, unknown>[]
  members: Record<string, unknown>[]
}
