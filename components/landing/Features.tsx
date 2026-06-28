const features = [
  { icon: '🤖', title: 'AI-assistent', title_en: 'AI Assistant', desc: 'Din personliga klubbassistent som svarar på frågor, skriver protokoll och hjälper styrelsen.', desc_en: 'Your personal club assistant that answers questions, writes minutes and helps the board.' },
  { icon: '👥', title: 'Medlemshantering', title_en: 'Member Management', desc: 'Hantera alla medlemmar, roller och laguppställningar på ett ställe.', desc_en: 'Manage all members, roles and team lineups in one place.' },
  { icon: '🏆', title: 'Laghantering', title_en: 'Team Management', desc: 'Skapa lag per åldersgrupp, kön och säsong. Fungerar för alla sporter.', desc_en: 'Create teams by age group, gender and season. Works for all sports.' },
  { icon: '🏛️', title: 'Styrelse & AGM', title_en: 'Board & AGM', desc: 'Digitala styrelsemöten, röstningar, protokoll och årsmöten med ett klick.', desc_en: 'Digital board meetings, votes, minutes and annual general meetings in one click.' },
  { icon: '🎨', title: 'Eget varumärke', title_en: 'Custom Branding', desc: 'Er egen subdomain med logotyp, färger och omslagsbild. Er klubb, er identitet.', desc_en: 'Your own subdomain with logo, colors and cover image. Your club, your identity.' },
  { icon: '📊', title: 'Ekonomi & rapporter', title_en: 'Finance & Reports', desc: 'Budgetar, kassarapporter och automatiska sammanfattningar för revisorn.', desc_en: 'Budgets, cash reports and automatic summaries for the auditor.' },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-[#22c55e] text-sm font-semibold uppercase tracking-widest mb-3">Funktioner</p>
          <h2 className="text-4xl md:text-5xl font-bold">Allt er förening faktiskt behöver.</h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">Inte ett till verktyg. En komplett plattform byggd för idrottsföreningar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#22c55e]/30 hover:bg-white/8 transition-all">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
