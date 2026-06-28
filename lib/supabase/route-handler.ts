import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

/** Supabase client for Route Handlers — reads session cookies from the request directly. */
export function createClientFromRequest(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // GET handlers don't need to persist refreshed tokens; middleware handles refresh.
        },
      },
    }
  )
}
