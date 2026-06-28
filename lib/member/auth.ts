import type { NextRequest } from 'next/server'
import { createClientFromRequest } from '@/lib/supabase/route-handler'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function requireMemberUser(request?: NextRequest) {
  const supabase = request ? createClientFromRequest(request) : await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Ej autentiserad', status: 401 as const }
  }

  return { user, admin: createAdminClient() }
}

export const MEMBER_PUBLIC_PATHS = [
  '/member/login',
  '/member/register',
  '/member/forgot-password',
  '/member/reset-password',
  '/member/auth/callback',
]

export function isMemberPublicPath(pathname: string) {
  return MEMBER_PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))
}
