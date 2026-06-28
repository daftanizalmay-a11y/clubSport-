'use client'
import { useState } from 'react'
import Link from 'next/link'

const content = {
  sv: {
    badge: '⚡ AI-driven föreningsadministration',
    h1a: 'Allt din förening',
    h1b: 'behöver, på ett ställe.',
    sub: 'ClubSports ger din idrottsförening en egen plattform med AI-assistent, medlemshantering, lag, styrelse och AGM — anpassad efter er sport och era färger.',
    cta: 'Kom igång gratis',
    demo: 'Se en demo',
    note: 'Gratis att starta · Ingen kreditkort krävs · Klar på 5 minuter',
  },
  en: {
    badge: '⚡ AI-powered club administration',
    h1a: 'Everything your club',
    h1b: 'needs, in one place.',
    sub: 'ClubSports gives your sports club its own branded platform with AI assistant, member management, teams, board tools and AGM — adapted to your sport and colors.',
    cta: 'Get started free',
    demo: 'Watch a demo',
    note: 'Free to start · No credit card · Ready in 5 minutes',
  },
}

export default function Hero() {
  const [lang] = useState<'sv' | 'en'>('sv')
  const t = content[lang]

  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#22c55e]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#f97316]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-sm px-4 py-1.5 rounded-full mb-8">
          {t.badge}
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          {t.h1a}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#f97316]">
            {t.h1b}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
          {t.sub}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            {t.cta}
          </Link>
          <button className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl text-lg transition-colors">
            {t.demo}
          </button>
        </div>

        <p className="mt-6 text-sm text-white/30">{t.note}</p>
      </div>
    </section>
  )
}
