import { multiSportTemplate } from './multi-sport'
import { cricketTemplate } from './cricket'
import { footballTemplate } from './football'
import { hockeyTemplate } from './hockey'
import { badmintonTemplate } from './badminton'
import type { ThemeMode, ThemeTokens, WebsiteTemplate } from './types'

export * from './types'
export { multiSportTemplate, cricketTemplate, footballTemplate, hockeyTemplate, badmintonTemplate }

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  multiSportTemplate,
  cricketTemplate,
  footballTemplate,
  hockeyTemplate,
  badmintonTemplate,
]

export const TEMPLATE_SLUGS = WEBSITE_TEMPLATES.map(t => t.slug)

export function getTemplate(idOrSlug?: string | null): WebsiteTemplate {
  if (!idOrSlug) return multiSportTemplate
  return WEBSITE_TEMPLATES.find(t => t.id === idOrSlug || t.slug === idOrSlug) ?? multiSportTemplate
}

export function isTemplateSlug(slug: string): boolean {
  return TEMPLATE_SLUGS.includes(slug)
}

export function getThemeTokens(template: WebsiteTemplate, mode: ThemeMode): ThemeTokens {
  return mode === 'dark' ? template.dark : template.light
}

export function themeToCssVars(tokens: ThemeTokens, template: WebsiteTemplate): Record<string, string> {
  return {
    '--site-primary': tokens.primary,
    '--site-on-primary': tokens.onPrimary,
    '--site-secondary': tokens.secondary,
    '--site-accent': tokens.accent,
    '--site-bg': tokens.background,
    '--site-fg': tokens.foreground,
    '--site-muted': tokens.muted,
    '--site-muted-fg': tokens.mutedForeground,
    '--site-border': tokens.border,
    '--site-card': tokens.card,
    '--site-card-fg': tokens.cardForeground,
    '--site-hero-overlay': tokens.heroOverlay,
    '--site-navbar': tokens.navbar,
    '--site-destructive': tokens.destructive,
    '--site-font-heading': template.fonts.heading,
    '--site-font-body': template.fonts.body,
    '--site-radius': template.spacing.radius,
    '--site-section-gap': template.spacing.section,
    '--site-container': template.spacing.container,
  }
}
