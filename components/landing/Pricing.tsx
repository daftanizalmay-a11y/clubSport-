const plans = [
  {
    name: 'Starter',
    price: '0',
    desc: 'Perfekt för att komma igång',
    features: ['Upp till 50 medlemmar', '2 lag', 'Bashantering', 'Offentlig klubbsida'],
    cta: 'Kom igång gratis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '299',
    desc: 'För aktiva föreningar',
    features: ['Upp till 250 medlemmar', '10 lag', 'AI-assistent', 'Eget varumärke', 'Styrelse & AGM', 'Prioriterad support'],
    cta: 'Välj Pro',
    highlight: true,
  },
  {
    name: 'Club',
    price: '699',
    desc: 'Fullständig plattform',
    features: ['Obegränsade medlemmar', 'Obegränsade lag', 'Avancerad AI', 'Fullständig governance', 'API-åtkomst', 'Dedikerad support'],
    cta: 'Välj Club',
    highlight: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 border-t border-white/5">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-[#22c55e] text-sm font-semibold uppercase tracking-widest mb-3">Priser</p>
          <h2 className="text-4xl md:text-5xl font-bold">Enkla priser för alla föreningar.</h2>
          <p className="mt-4 text-white/50">Börja gratis. Uppgradera när ni växer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl p-8 border ${p.highlight ? 'border-[#22c55e] bg-[#22c55e]/5' : 'border-white/10 bg-white/5'}`}>
              {p.highlight && (
                <p className="text-[#22c55e] text-xs font-semibold uppercase tracking-widest mb-4">Mest populär</p>
              )}
              <h3 className="text-2xl font-bold mb-1">{p.name}</h3>
              <p className="text-white/50 text-sm mb-4">{p.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{p.price} kr</span>
                <span className="text-white/40 text-sm">/månad</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-[#22c55e]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="/auth/register" className={`block text-center py-3 rounded-xl font-semibold transition-colors ${p.highlight ? 'bg-[#22c55e] hover:bg-[#16a34a] text-black' : 'border border-white/20 hover:border-white/40 text-white'}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
