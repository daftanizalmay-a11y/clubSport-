'use client'

interface Props {
  club: { name: string; primary_color?: string }
  leagueTables: { id: string; name: string; season?: string; is_active?: boolean }[]
}

export default function LeagueTableSourceSettings({ club, leagueTables }: Props) {
  const primaryColor = club.primary_color || '#22c55e'
  const active = leagueTables.find(t => t.is_active) || leagueTables[0]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold mb-1">Källinställningar</h3>
        <p className="text-white/40 text-sm">
          Tabellen kan fyllas via bild-AI, manuell inmatning, eller automatiskt när spelade matcher sparas från Fixtures.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
        <p className="text-sm text-white/60">Aktiv tabell</p>
        {active ? (
          <p className="text-white font-medium">{active.name}{active.season ? ` — ${active.season}` : ''}</p>
        ) : (
          <p className="text-white/40 text-sm">Ingen tabell skapad ännu — skapa en under &quot;Alla lag&quot; eller ladda upp en tabellbild.</p>
        )}

        <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-white/40">
          <p><span className="text-white/60">Bild-AI:</span> Ladda upp foto/screenshot av serietabellen under Manuell uppladdning.</p>
          <p><span className="text-white/60">Fixtures:</span> Spelade matcher med resultat uppdaterar tabellen automatiskt.</p>
          <p><span className="text-white/60">Manuell:</span> Redigera enskilda lag under Alla lag.</p>
        </div>

        {leagueTables.length > 1 && (
          <div className="pt-2">
            <p className="text-xs text-white/40 mb-2">{leagueTables.length} tabeller totalt</p>
            <ul className="space-y-1">
              {leagueTables.map(t => (
                <li key={t.id} className="text-sm text-white/60 flex items-center gap-2">
                  {t.is_active && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />}
                  {t.name}{t.season ? ` (${t.season})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
