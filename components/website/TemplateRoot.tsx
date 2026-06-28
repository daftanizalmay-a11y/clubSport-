'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  getTemplate,
  getThemeTokens,
  themeToCssVars,
  type ThemeMode,
  type WebsiteTemplate,
} from '@/lib/website/templates'

interface TemplateContextValue {
  template: WebsiteTemplate
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  isDemo: boolean
}

const TemplateContext = createContext<TemplateContextValue | null>(null)

export function useTemplate() {
  const ctx = useContext(TemplateContext)
  if (!ctx) throw new Error('useTemplate must be used within TemplateRoot')
  return ctx
}

interface TemplateRootProps {
  templateId?: string | null
  initialTheme?: ThemeMode
  isDemo?: boolean
  children: ReactNode
}

export default function TemplateRoot({
  templateId,
  initialTheme = 'dark',
  isDemo = false,
  children,
}: TemplateRootProps) {
  const template = useMemo(() => getTemplate(templateId), [templateId])
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme)

  const cssVars = useMemo(() => {
    const tokens = getThemeTokens(template, themeMode)
    return themeToCssVars(tokens, template)
  }, [template, themeMode])

  const style = cssVars as React.CSSProperties

  return (
    <TemplateContext.Provider
      value={{
        template,
        themeMode,
        setThemeMode,
        toggleTheme: () => setThemeMode(m => (m === 'dark' ? 'light' : 'dark')),
        isDemo,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={template.fonts.googleFontsUrl} />
      <div
        className="min-h-screen"
        style={{
          ...style,
          backgroundColor: 'var(--site-bg)',
          color: 'var(--site-fg)',
          fontFamily: 'var(--site-font-body)',
        }}
      >
        {children}
      </div>
    </TemplateContext.Provider>
  )
}
