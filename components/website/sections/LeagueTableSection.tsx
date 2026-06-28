'use client'

import { useTemplate } from '../TemplateRoot'
import SectionHeading from '../ui/SectionHeading'
import { IconTable } from '../icons'

interface LeagueTableSectionProps {
  title: string
  leagueTables: Record<string, unknown>[]
}

export default function LeagueTableSection({ title, leagueTables }: LeagueTableSectionProps) {
  const { template } = useTemplate()
  const activeTable = leagueTables.find(t => t.is_active) || leagueTables[0]
  if (!activeTable) return null

  const entries = [...((activeTable.league_table_entries as Record<string, unknown>[]) || [])]
    .sort((a, b) => {
      const gdA = (a.goals_for as number) - (a.goals_against as number)
      const gdB = (b.goals_for as number) - (b.goals_against as number)
      return (b.points as number) - (a.points as number) || gdB - gdA
    })

  if (entries.length === 0) return null

  const style = template.sectionStyles.leagueTable
  const striped = style === 'striped'
  const minimal = style === 'minimal'

  return (
    <section>
      <SectionHeading
        title={title}
        subtitle={`${activeTable.name as string} — ${activeTable.season as string}`}
        icon={<IconTable />}
      />
      <div className="border overflow-x-auto" style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
        <table className={`w-full text-sm ${minimal ? 'text-center' : ''}`}>
          <thead>
            <tr className="text-xs uppercase border-b" style={{ color: 'var(--site-muted-fg)', borderColor: 'var(--site-border)' }}>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Lag</th>
              {!minimal && <>
                <th className="px-3 py-3 text-center">M</th>
                <th className="px-3 py-3 text-center">V</th>
                <th className="px-3 py-3 text-center">O</th>
                <th className="px-3 py-3 text-center">F</th>
                <th className="px-3 py-3 text-center hidden sm:table-cell">GM</th>
                <th className="px-3 py-3 text-center hidden sm:table-cell">IM</th>
              </>}
              <th className="px-3 py-3 text-center font-bold">P</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.id as string}
                className="border-t transition-colors duration-150"
                style={{
                  borderColor: 'var(--site-border)',
                  backgroundColor: entry.is_our_team
                    ? 'var(--site-muted)'
                    : striped && i % 2 === 1
                      ? 'rgba(0,0,0,0.02)'
                      : 'transparent',
                }}
              >
                <td className="px-4 py-2.5 text-sm" style={{ color: 'var(--site-muted-fg)' }}>{i + 1}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {!!entry.is_our_team && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--site-primary)' }} />
                    )}
                    <span className={`font-medium ${entry.is_our_team ? '' : ''}`} style={{ color: 'var(--site-card-fg)' }}>
                      {entry.team_name as string}
                    </span>
                  </div>
                </td>
                {!minimal && <>
                  <td className="px-3 py-2.5 text-center" style={{ color: 'var(--site-muted-fg)' }}>{entry.played as number}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: 'var(--site-muted-fg)' }}>{entry.won as number}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: 'var(--site-muted-fg)' }}>{entry.drawn as number}</td>
                  <td className="px-3 py-2.5 text-center" style={{ color: 'var(--site-muted-fg)' }}>{entry.lost as number}</td>
                  <td className="px-3 py-2.5 text-center hidden sm:table-cell" style={{ color: 'var(--site-muted-fg)' }}>{entry.goals_for as number}</td>
                  <td className="px-3 py-2.5 text-center hidden sm:table-cell" style={{ color: 'var(--site-muted-fg)' }}>{entry.goals_against as number}</td>
                </>}
                <td className="px-3 py-2.5 text-center font-bold" style={{ color: 'var(--site-primary)' }}>{entry.points as number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
