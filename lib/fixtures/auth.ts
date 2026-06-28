import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClientFromRequest } from '@/lib/supabase/route-handler'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidClubId(clubId: string): boolean {
  return !!clubId && clubId !== 'undefined' && UUID_RE.test(clubId)
}

async function resolveUser(request?: NextRequest) {
  const supabase = request ? createClientFromRequest(request) : await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (user) return user

  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

export async function requireClubMember(clubId: string, request?: NextRequest) {
  if (!isValidClubId(clubId)) {
    return { error: `Ogiltigt klubb-ID: ${clubId || '(saknas)'}`, status: 400 as const }
  }

  const user = await resolveUser(request)
  if (!user) return { error: 'Ej autentiserad', status: 401 as const }

  const admin = createAdminClient()
  const { data: membership, error: memError } = await admin
    .from('club_memberships')
    .select('id')
    .eq('club_id', clubId)
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (memError) {
    return { error: `Medlemskapskontroll misslyckades: ${memError.message}`, status: 500 as const }
  }

  if (!membership) {
    return {
      error: `Ingen åtkomst till denna klubb (user: ${user.id.slice(0, 8)}…, club: ${clubId.slice(0, 8)}…)`,
      status: 403 as const,
    }
  }

  return { user, admin }
}

/** @deprecated use requireClubMember — kept for stricter admin-only actions */
export async function requireClubAdmin(clubId: string, request?: NextRequest) {
  return requireClubMember(clubId, request)
}

export async function getClubOrError(admin: ReturnType<typeof createAdminClient>, clubId: string) {
  const { data: club, error } = await admin.from('clubs').select('*').eq('id', clubId).single()
  if (error || !club) return { error: 'Klubb hittades inte', status: 404 as const }
  return { club }
}
