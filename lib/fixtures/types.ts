export type SourceType = 'image' | 'webhook' | 'football_api' | 'hockey_api' | 'cricket' | 'badminton'
export type SyncFrequency = 'hourly' | 'daily' | 'manual'
export type SyncStatus = 'success' | 'error'

export interface ExtractedFixture {
  home_team: string
  away_team: string
  match_date: string
  match_time?: string | null
  venue?: string | null
  home_score?: number | null
  away_score?: number | null
  competition?: string | null
  is_played?: boolean
  is_home_game?: boolean
  extraction_notes?: string | null
}

export interface ExtractedTableTeam {
  team_name: string
  position?: number | null
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
  is_our_team?: boolean
}

export interface TableExtractionResult {
  teams: ExtractedTableTeam[]
  total_teams: number
  confidence: number
  competition?: string | null
  season?: string | null
  notes?: string | null
}

export interface ExtractionResult {
  matches: ExtractedFixture[]
  total_matches: number
  confidence: number
  field_confidence?: Record<string, number>
  notes?: string | null
}

/** @deprecated use ExtractionResult.matches[0] */
export interface SingleExtractionResult {
  data: ExtractedFixture
  confidence: number
  field_confidence: Record<string, number>
}

export interface FixturePayload extends ExtractedFixture {
  external_id?: string | null
  source_club_id?: string | null
  notes?: string | null
  extraction_confidence?: number | null
}

export interface FixtureSource {
  id: string
  club_id: string
  sport_type: string
  source_type: SourceType
  name: string
  description: string | null
  is_enabled: boolean
  sync_frequency: SyncFrequency
  api_key_encrypted: string | null
  webhook_secret_encrypted: string | null
  config: Record<string, unknown>
  country_code: string
  last_sync_at: string | null
  last_sync_status: SyncStatus | null
}

export interface SyncResult {
  synced: number
  errors: string[]
  fixtures: FixturePayload[]
}

export interface FixtureAdapterContext {
  clubId: string
  clubName: string
  sportType: string
  source: FixtureSource
  apiKey?: string | null
}

export interface FixtureAdapter {
  type: SourceType
  name: string
  description: string
  supportedSports: string[]
  supportedCountries: string[]
  requiresApiKey: boolean
  supportsAutoSync: boolean
  fetchFixtures(ctx: FixtureAdapterContext): Promise<FixturePayload[]>
}

export const SOURCE_LABELS: Record<SourceType, string> = {
  image: 'Bilduppladdning (AI)',
  webhook: 'Webhook',
  football_api: 'Fotboll API (Allsvenskan/Superettan)',
  hockey_api: 'Hockey API (SHL)',
  cricket: 'Cricket (manuell/webhook)',
  badminton: 'Badminton (manuell/webhook)',
}

export const SOURCE_DESCRIPTIONS: Record<SourceType, string> = {
  image: 'Ladda upp matchbild — Claude AI extraherar lag, resultat och datum.',
  webhook: 'Ta emot matchdata via POST webhook med HMAC-signatur.',
  football_api: 'Synka matcher från Allsvenskan/Superettan via SportRadar.',
  hockey_api: 'Synka SHL-matcher via officiell API.',
  cricket: 'Manuell inmatning eller webhook från SCF.',
  badminton: 'Manuell inmatning eller webhook/CSV från SBF.',
}

export function sourcesForSport(sport: string): SourceType[] {
  const map: Record<string, SourceType[]> = {
    football: ['image', 'webhook', 'football_api'],
    hockey: ['image', 'webhook', 'hockey_api'],
    cricket: ['image', 'webhook', 'cricket'],
    badminton: ['image', 'webhook', 'badminton'],
    multi_sport: ['image', 'webhook', 'football_api', 'hockey_api', 'cricket', 'badminton'],
  }
  return map[sport] || ['image', 'webhook']
}
