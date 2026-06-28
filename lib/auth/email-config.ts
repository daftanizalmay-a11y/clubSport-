/** Dev: skip Supabase transactional emails and show reset link in UI instead */
export function isAuthEmailBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.SKIP_AUTH_EMAILS === 'true'
  )
}

/** Client-safe flag for dev UI hints */
export function isAuthEmailBypassPublic(): boolean {
  return process.env.NEXT_PUBLIC_SKIP_AUTH_EMAILS === 'true'
}
