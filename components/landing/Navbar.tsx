'use client'
import { useState } from 'react'
import Link from 'next/link'

const content = {
  sv: { features: 'Funktioner', how: 'Hur det fungerar', pricing: 'Priser', signin: 'Logga in', cta: 'Kom igång gratis', lang: 'EN' },
  en: { features: 'Features', how: 'How it works', pricing: 'Pricing', signin: 'Sign in', cta: 'Get started free', lang: 'SV' },
}

export default function Navbar() {
  const [lang, setLang] = useState<'sv' | 'en'>('sv')
  const t = content[lang]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          <span className="text-white">Club</span>
          <span className="text-[#22c55e]">Sports</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">{t.features}</a>
          <a href="#how" className="hover:text-white transition-colors">{t.how}</a>
          <a href="#pricing" className="hover:text-white transition-colors">{t.pricing}</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
            className="text-xs text-white/50 hover:text-white border border-white/20 rounded px-2 py-1 transition-colors"
          >
            {t.lang}
          </button>
          <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors">
            {t.signin}
          </Link>
          <Link href="/auth/register" className="text-sm bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-4 py-2 rounded-lg transition-colors">
            {t.cta}
          </Link>
        </div>
      </div>
    </nav>
  )
}
