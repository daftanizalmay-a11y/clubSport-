import type { FixturePayload } from './types'

export function validateFixturePayload(payload: FixturePayload, clubName: string): string | null {
  if (!payload.home_team?.trim()) return 'Hemmalag saknas'
  if (!payload.away_team?.trim()) return 'Bortalag saknas'
  if (!payload.match_date?.match(/^\d{4}-\d{2}-\d{2}$/)) return 'Ogiltigt datum (YYYY-MM-DD)'
  if (payload.is_played) {
    if (payload.home_score == null || payload.away_score == null) {
      return 'Resultat krävs för spelade matcher'
    }
    if (payload.home_score < 0 || payload.away_score < 0) return 'Ogiltigt resultat'
  }
  void clubName
  return null
}
