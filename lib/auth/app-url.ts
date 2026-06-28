/** Canonical app URL for auth redirects (Supabase allow-list must include callback paths). */
export function getAppUrl(fallback?: string): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || fallback || 'http://localhost:3000'
  return url.replace(/\/$/, '')
}

export function getPasswordResetRedirectUrl(fallback?: string): string {
  return `${getAppUrl(fallback)}/member/auth/callback`
}
