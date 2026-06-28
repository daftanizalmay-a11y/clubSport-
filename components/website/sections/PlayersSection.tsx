'use client'

import { useTemplate } from '../TemplateRoot'
import SectionHeading from '../ui/SectionHeading'
import { IconUsers } from '../icons'

interface PlayersSectionProps {
  title: string
  members: Record<string, unknown>[]
}

export default function PlayersSection({ title, members }: PlayersSectionProps) {
  const { template } = useTemplate()
  const players = members.filter(m =>
    ['player', 'captain', 'vice_captain', 'junior', 'veteran'].includes((m.club_roles as Record<string, unknown>)?.slug as string)
  )
  if (players.length === 0) return null

  const style = template.sectionStyles.players

  if (style === 'roster') {
    return (
      <section>
        <SectionHeading title={title} icon={<IconUsers />} />
        <div className="border overflow-hidden" style={{ borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
          {players.map((m, i) => {
            const profile = m.profiles as Record<string, unknown>
            const role = m.club_roles as Record<string, unknown>
            return (
              <div
                key={m.id as string}
                className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
                style={{ backgroundColor: i % 2 === 0 ? 'var(--site-card)' : 'var(--site-muted)', borderColor: 'var(--site-border)' }}
              >
                <span className="w-8 text-center font-bold text-lg" style={{ color: 'var(--site-primary)' }}>
                  {profile?.jersey_number ? `#${profile.jersey_number}` : '—'}
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url as string} alt="" className="w-full h-full object-cover" />
                    : (profile?.full_name as string)?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--site-card-fg)' }}>{profile?.full_name as string}</p>
                  <p className="text-xs" style={{ color: 'var(--site-muted-fg)' }}>{role?.name_sv as string}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  const gridClass = style === 'cards'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
    : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'

  return (
    <section>
      <SectionHeading title={title} icon={<IconUsers />} />
      <div className={gridClass}>
        {players.map(m => {
          const profile = m.profiles as Record<string, unknown>
          const role = m.club_roles as Record<string, unknown>
          return (
            <div
              key={m.id as string}
              className={`border text-center ${style === 'cards' ? 'p-6' : 'p-4'}`}
              style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}
            >
              <div
                className={`${style === 'cards' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-lg'} rounded-full flex items-center justify-center font-bold mx-auto mb-2 overflow-hidden`}
                style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}
              >
                {profile?.avatar_url
                  ? <img src={profile.avatar_url as string} alt="" className="w-full h-full object-cover" />
                  : (profile?.full_name as string)?.charAt(0) || '?'}
              </div>
              {!!profile?.jersey_number && (
                <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--site-primary)' }}>#{profile.jersey_number as number}</p>
              )}
              <p className="text-xs font-medium truncate" style={{ color: 'var(--site-card-fg)' }}>{profile?.full_name as string}</p>
              <p className="text-xs" style={{ color: 'var(--site-muted-fg)' }}>{role?.name_sv as string}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
