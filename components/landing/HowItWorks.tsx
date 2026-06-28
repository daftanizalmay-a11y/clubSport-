const steps = [
  { n: '1', title: 'Välj er sport', title_en: 'Choose your sport', desc: 'Välj sport och plattformen anpassar sig — layout, roller och funktioner passar er idrott.', desc_en: 'Choose your sport and the platform adapts — layout, roles and features fit your sport.' },
  { n: '2', title: 'Sätt upp er klubb', title_en: 'Set up your club', desc: 'Lägg till logotyp, färger och subdomain. Er klubbsida är redo på minuter.', desc_en: 'Add your logo, colors and subdomain. Your club page is ready in minutes.' },
  { n: '3', title: 'Bjud in medlemmar', title_en: 'Invite members', desc: 'Skicka inbjudningar per e-post. Medlemmar väljer sina roller och lag.', desc_en: 'Send invitations by email. Members choose their roles and teams.' },
  { n: '4', title: 'Låt AI:n hjälpa', title_en: 'Let AI help', desc: 'AI-assistenten hanterar protokoll, svarar på frågor och håller koll på er förening.', desc_en: 'The AI assistant handles minutes, answers questions and keeps track of your club.' },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 border-t border-white/5">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-[#f97316] text-sm font-semibold uppercase tracking-widest mb-3">Hur det fungerar</p>
          <h2 className="text-4xl md:text-5xl font-bold">Från registrering till aktiv klubb på en dag.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#f97316] flex items-center justify-center text-black font-bold text-lg mb-4">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-[#22c55e]">{s.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
