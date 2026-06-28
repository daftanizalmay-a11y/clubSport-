/** User-facing Swedish messages for Supabase Auth errors */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'För många e-postförfrågningar. Vänta en minut och försök igen.'
  }
  if (lower.includes('email rate limit exceeded')) {
    return 'E-postgränsen är nådd (ca 5 e-post/min). Vänta 1–2 minuter innan du försöker igen.'
  }
  if (lower.includes('user not found') || lower.includes('invalid login credentials')) {
    return 'Fel e-post eller lösenord.'
  }
  if (lower.includes('email not confirmed')) {
    return 'E-postadressen är inte bekräftad ännu.'
  }
  if (lower.includes('pkce') || lower.includes('code verifier')) {
    return 'Återställningslänken är ogiltig. Begär en ny länk från samma webbläsare.'
  }

  return message
}

export function isRateLimitError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('rate limit') || lower.includes('too many requests')
}
