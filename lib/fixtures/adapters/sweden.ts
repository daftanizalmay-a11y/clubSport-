import type { FixtureAdapter, FixtureAdapterContext, FixturePayload } from '../types'

/** Base mock adapter for development when no API key is set */
export function mockFixtures(ctx: FixtureAdapterContext, league: string, prefix: string): FixturePayload[] {
  const today = new Date()
  const d = (offset: number) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() + offset)
    return dt.toISOString().split('T')[0]
  }
  return [
    {
      external_id: `${prefix}-${ctx.clubId}-1`,
      home_team: ctx.clubName,
      away_team: `${prefix} Motståndare A`,
      match_date: d(7),
      match_time: '15:00',
      venue: 'Hemmaplan',
      competition: league,
      is_played: false,
      is_home_game: true,
    },
    {
      external_id: `${prefix}-${ctx.clubId}-2`,
      home_team: `${prefix} Motståndare B`,
      away_team: ctx.clubName,
      match_date: d(-3),
      match_time: '18:00',
      venue: 'Bortaplan',
      competition: league,
      home_score: 1,
      away_score: 2,
      is_played: true,
      is_home_game: false,
    },
  ]
}

export async function fetchSportRadarFixtures(
  apiKey: string,
  competitionId: string,
  teamName: string
): Promise<FixturePayload[]> {
  const url = `https://api.sportradar.com/soccer/trial/v4/en/competitions/${competitionId}/schedules.json?api_key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`SportRadar API: ${res.status}`)

  const data = await res.json()
  const schedules = data?.schedules || data?.sport_events || []

  return schedules
    .filter((s: Record<string, unknown>) => {
      const home = (s.home as Record<string, string>)?.name || (s.sport_event as Record<string, unknown>)?.home
      const away = (s.away as Record<string, string>)?.name || (s.sport_event as Record<string, unknown>)?.away
      const homeName = typeof home === 'string' ? home : (home as Record<string, string>)?.name
      const awayName = typeof away === 'string' ? away : (away as Record<string, string>)?.name
      return homeName?.includes(teamName) || awayName?.includes(teamName)
    })
    .slice(0, 20)
    .map((s: Record<string, unknown>): FixturePayload => {
      const event = (s.sport_event || s) as Record<string, unknown>
      const home = (event.home || s.home) as Record<string, string>
      const away = (event.away || s.away) as Record<string, string>
      const status = event.status as Record<string, unknown> | undefined
      const homeScore = status?.home_score as number | undefined
      const awayScore = status?.away_score as number | undefined
      const start = (event.start_time || s.scheduled) as string
      const date = start ? start.split('T')[0] : new Date().toISOString().split('T')[0]
      const time = start?.includes('T') ? start.split('T')[1]?.slice(0, 5) : null

      return {
        external_id: (event.id || s.id) as string,
        home_team: home?.name || 'Hemmalag',
        away_team: away?.name || 'Bortalag',
        match_date: date,
        match_time: time,
        venue: (event.venue as Record<string, string>)?.name || null,
        competition: (event.competition as Record<string, string>)?.name || null,
        home_score: homeScore ?? null,
        away_score: awayScore ?? null,
        is_played: homeScore != null && awayScore != null,
        is_home_game: home?.name?.includes(teamName) ?? false,
      }
    })
}

export const footballSwedenAdapter: FixtureAdapter = {
  type: 'football_api',
  name: 'Fotboll API (Sverige)',
  description: 'Allsvenskan & Superettan via SportRadar',
  supportedSports: ['football', 'multi_sport'],
  supportedCountries: ['SE'],
  requiresApiKey: true,
  supportsAutoSync: true,
  async fetchFixtures(ctx) {
    const league = (ctx.source.config?.league as string) || 'allsvenskan'
    const competitionIds: Record<string, string> = {
      allsvenskan: 'sr:competition:29',
      superettan: 'sr:competition:30',
    }
    const competitionId = competitionIds[league] || competitionIds.allsvenskan

    if (!ctx.apiKey) {
      return mockFixtures(ctx, league === 'superettan' ? 'Superettan' : 'Allsvenskan', 'SE-FB')
    }

    try {
      return await fetchSportRadarFixtures(ctx.apiKey, competitionId, ctx.clubName)
    } catch {
      return mockFixtures(ctx, league === 'superettan' ? 'Superettan' : 'Allsvenskan', 'SE-FB')
    }
  },
}

export const hockeySwedenAdapter: FixtureAdapter = {
  type: 'hockey_api',
  name: 'Hockey API (SHL)',
  description: 'SHL matcher via SportRadar',
  supportedSports: ['hockey', 'multi_sport'],
  supportedCountries: ['SE'],
  requiresApiKey: true,
  supportsAutoSync: true,
  async fetchFixtures(ctx) {
    const teamId = (ctx.source.config?.team_id as string) || ctx.clubName

    if (!ctx.apiKey) {
      return mockFixtures(ctx, 'SHL', 'SE-HK')
    }

    try {
      const url = `https://api.sportradar.com/icehockey/trial/v2/en/teams/${teamId}/schedule.json?api_key=${ctx.apiKey}`
      const res = await fetch(url, { next: { revalidate: 0 } })
      if (!res.ok) throw new Error(`SHL API: ${res.status}`)
      const data = await res.json()
      const games = data?.games || []

      return games.slice(0, 20).map((g: Record<string, unknown>): FixturePayload => ({
        external_id: g.id as string,
        home_team: (g.home as Record<string, string>)?.name || 'Hemmalag',
        away_team: (g.away as Record<string, string>)?.name || 'Bortalag',
        match_date: ((g.scheduled as string) || '').split('T')[0],
        match_time: ((g.scheduled as string) || '').split('T')[1]?.slice(0, 5) || null,
        venue: (g.venue as Record<string, string>)?.name || null,
        competition: 'SHL',
        home_score: (g.home_points as number) ?? null,
        away_score: (g.away_points as number) ?? null,
        is_played: g.status === 'closed',
        is_home_game: (g.home as Record<string, string>)?.name === ctx.clubName,
      }))
    } catch {
      return mockFixtures(ctx, 'SHL', 'SE-HK')
    }
  },
}

export const cricketManualAdapter: FixtureAdapter = {
  type: 'cricket',
  name: 'Cricket (SCF)',
  description: 'Webhook eller manuell inmatning',
  supportedSports: ['cricket', 'multi_sport'],
  supportedCountries: ['SE'],
  requiresApiKey: false,
  supportsAutoSync: false,
  async fetchFixtures() {
    return []
  },
}

export const badmintonManualAdapter: FixtureAdapter = {
  type: 'badminton',
  name: 'Badminton (SBF)',
  description: 'Webhook eller CSV-import',
  supportedSports: ['badminton', 'multi_sport'],
  supportedCountries: ['SE'],
  requiresApiKey: false,
  supportsAutoSync: false,
  async fetchFixtures() {
    return []
  },
}

export const imageAdapter: FixtureAdapter = {
  type: 'image',
  name: 'Bilduppladdning',
  description: 'AI-extrahering från matchbilder',
  supportedSports: ['*'],
  supportedCountries: ['*'],
  requiresApiKey: false,
  supportsAutoSync: false,
  async fetchFixtures() {
    return []
  },
}

export const webhookAdapter: FixtureAdapter = {
  type: 'webhook',
  name: 'Webhook',
  description: 'Ta emot matchdata externt',
  supportedSports: ['*'],
  supportedCountries: ['*'],
  requiresApiKey: false,
  supportsAutoSync: false,
  async fetchFixtures() {
    return []
  },
}
