'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WEBSITE_TEMPLATES, type ThemeMode } from '@/lib/website/templates'

interface TemplateSelectorProps {
  club: Record<string, unknown>
  config: Record<string, unknown> | null
}

export default function TemplateSelector({ club, config }: TemplateSelectorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState((config?.website_template as string) || 'multi-sport')
  const [themeMode, setThemeMode] = useState<ThemeMode>((config?.theme_mode as ThemeMode) || 'dark')
  const primaryColor = (club?.primary_color as string) || '#22c55e'

  async function save(template: string, theme: ThemeMode) {
    setSaving(true)
    await fetch('/api/website/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        club_id: club.id,
        website_template: template,
        theme_mode: theme,
      }),
    })
    setSaving(false)
    router.refresh()
  }

  function selectTemplate(slug: string) {
    setSelectedTemplate(slug)
    save(slug, themeMode)
  }

  function selectTheme(mode: ThemeMode) {
    setThemeMode(mode)
    save(selectedTemplate, mode)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Webbmall</h2>
        <p className="text-white/40 text-sm">Välj en sportanpassad designmall för er klubbsida. Varje mall har ljust och mörkt läge.</p>
      </div>

      <div className="flex gap-2">
        {(['light', 'dark'] as ThemeMode[]).map(mode => (
          <button
            key={mode}
            type="button"
            onClick={() => selectTheme(mode)}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 ${
              themeMode === mode ? 'bg-white/15 text-white font-medium' : 'text-white/40 hover:text-white'
            }`}
          >
            {mode === 'light' ? 'Ljust läge' : 'Mörkt läge'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {WEBSITE_TEMPLATES.map(template => {
          const tokens = themeMode === 'dark' ? template.dark : template.light
          const isSelected = selectedTemplate === template.slug
          return (
            <button
              key={template.slug}
              type="button"
              onClick={() => selectTemplate(template.slug)}
              disabled={saving}
              className={`text-left border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                isSelected ? 'ring-2 ring-offset-2 ring-offset-[#0a0f1e]' : 'hover:border-white/30'
              }`}
              style={{
                borderColor: isSelected ? primaryColor : 'rgba(255,255,255,0.1)',
                ...(isSelected ? { outlineColor: primaryColor } : {}),
              }}
            >
              <div className="h-28 relative overflow-hidden" style={{ backgroundColor: tokens.background }}>
                <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})` }} />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: tokens.primary, color: tokens.onPrimary }}>
                      {template.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate" style={{ color: tokens.foreground, fontFamily: template.fonts.heading }}>{template.nameSv}</p>
                      <p className="text-[10px] uppercase tracking-wider opacity-60" style={{ color: tokens.mutedForeground }}>{template.style}</p>
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ backgroundColor: primaryColor }}>
                    ✓
                  </div>
                )}
              </div>
              <div className="p-4 bg-white/5">
                <p className="text-white/50 text-xs leading-relaxed mb-3">{template.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[tokens.primary, tokens.secondary, tokens.accent, tokens.background].map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <a
                    href={`/clubs/${template.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="ml-auto text-xs text-white/40 hover:text-white transition-colors"
                  >
                    Förhandsgranska →
                  </a>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
