'use client'

import { useTemplate } from '../TemplateRoot'
import SectionHeading from '../ui/SectionHeading'
import { IconTrophy } from '../icons'
import type { FixturesStyle } from '@/lib/website/templates/types'

interface FixturesSectionProps {
  title: string
  fixtures: Record<string, unknown>[]
}

export default function FixturesSection({ title, fixtures }: FixturesSectionProps) {
  const { template } = useTemplate()
  if (fixtures.length === 0) return null

  const upcoming = fixtures.filter(f => !f.is_played).sort((a, b) => new Date(a.match_date as string).getTime() - new Date(b.match_date as string).getTime())
  const played = fixtures.filter(f => f.is_played).sort((a, b) => new Date(b.match_date as string).getTime() - new Date(a.match_date as string).getTime())
  const style = template.sectionStyles.fixtures

  return (
    <section>
      <SectionHeading title={title} icon={<IconTrophy />} />
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: 'var(--site-muted-fg)' }}>Kommande</h3>
          <div className={style === 'timeline' ? 'relative border-l-2 ml-4 space-y-6' : 'space-y-2'} style={style === 'timeline' ? { borderColor: 'var(--site-border)' } : undefined}>
            {upcoming.slice(0, 5).map((f, i) => (
              <FixtureRow key={f.id as string} fixture={f} style={style} upcoming index={i} />
            ))}
          </div>
        </div>
      )}
      {played.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: 'var(--site-muted-fg)' }}>Resultat</h3>
          <div className="space-y-2">
            {played.slice(0, 5).map(f => (
              <FixtureRow key={f.id as string} fixture={f} style={style} upcoming={false} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function formatFixtureMeta(fixture: Record<string, unknown>): string {
  return [
    fixture.match_time ? `kl ${String(fixture.match_time)}` : null,
    fixture.venue ? String(fixture.venue) : null,
    fixture.competition ? String(fixture.competition) : null,
  ].filter(Boolean).join(' · ')
}

function FixtureRow({ fixture, style, upcoming, index }: { fixture: Record<string, unknown>; style: FixturesStyle; upcoming: boolean; index?: number }) {
  const date = new Date(fixture.match_date as string)

  if (style === 'scorecard' && !upcoming) {
    return (
      <div className="border overflow-hidden" style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
        <div className="px-4 py-2 text-xs font-medium flex justify-between" style={{ backgroundColor: 'var(--site-muted)', color: 'var(--site-muted-fg)' }}>
          <span>{fixture.competition as string}</span>
          <span>{date.toLocaleDateString('sv-SE')}</span>
        </div>
        <div className="grid grid-cols-3 items-center p-4 text-center">
          <span className="text-sm font-medium" style={{ color: 'var(--site-card-fg)' }}>{fixture.home_team as string}</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--site-primary)' }}>{fixture.home_score as number} / {fixture.away_score as number}</span>
          <span className="text-sm font-medium" style={{ color: 'var(--site-card-fg)' }}>{fixture.away_team as string}</span>
        </div>
      </div>
    )
  }

  if (style === 'scorecard' && upcoming) {
    return (
      <div className="flex items-center gap-4 border px-4 py-3" style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
        <DateBadge date={date} />
        <div className="flex-1">
          <p className="font-medium text-sm" style={{ color: 'var(--site-card-fg)' }}>{fixture.home_team as string} vs {fixture.away_team as string}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--site-muted-fg)' }}>
            {formatFixtureMeta(fixture)}
          </p>
        </div>
      </div>
    )
  }

  if (style === 'timeline' && upcoming) {
    return (
      <div className="relative pl-6">
        <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full border-2" style={{ backgroundColor: 'var(--site-bg)', borderColor: 'var(--site-primary)' }} />
        <div className="border p-4" style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
          <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--site-primary)' }}>{date.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p className="font-bold" style={{ color: 'var(--site-card-fg)', fontFamily: 'var(--site-font-heading)' }}>{fixture.home_team as string} vs {fixture.away_team as string}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--site-muted-fg)' }}>
            {formatFixtureMeta(fixture)}
          </p>
        </div>
      </div>
    )
  }

  if (style === 'compact') {
    return (
      <div className="flex items-center justify-between py-3 border-b text-sm" style={{ borderColor: 'var(--site-border)' }}>
        <span style={{ color: 'var(--site-fg)' }}>
          {upcoming
            ? `${fixture.home_team} vs ${fixture.away_team}`
            : `${fixture.home_team} ${fixture.home_score}–${fixture.away_score} ${fixture.away_team}`}
        </span>
        <span className="text-xs flex-shrink-0 ml-4" style={{ color: 'var(--site-muted-fg)' }}>{date.toLocaleDateString('sv-SE')}</span>
      </div>
    )
  }

  if (!upcoming) {
    return (
      <div className="flex items-center gap-4 border px-4 py-3" style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
        <div className="flex-1 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-sm" style={{ color: 'var(--site-muted-fg)' }}>{fixture.home_team as string}</span>
          <span className="font-bold text-lg" style={{ color: 'var(--site-primary)' }}>{fixture.home_score as number} — {fixture.away_score as number}</span>
          <span className="text-sm" style={{ color: 'var(--site-muted-fg)' }}>{fixture.away_team as string}</span>
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--site-muted-fg)' }}>{date.toLocaleDateString('sv-SE')}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 border px-4 py-3" style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
      <DateBadge date={date} />
      <div className="flex-1">
        <p className="font-medium text-sm" style={{ color: 'var(--site-card-fg)' }}>{fixture.home_team as string} vs {fixture.away_team as string}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--site-muted-fg)' }}>
          {[fixture.match_time && `kl ${fixture.match_time}`, fixture.venue, fixture.competition].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  )
}

function DateBadge({ date }: { date: Date }) {
  return (
    <div
      className="w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}
    >
      <span>{date.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}</span>
      <span className="text-lg leading-none">{date.getDate()}</span>
    </div>
  )
}
