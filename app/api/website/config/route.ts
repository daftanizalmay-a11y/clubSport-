import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const { club_id, ...fields } = await req.json()
    if (!club_id) return NextResponse.json({ error: 'Saknat club_id' }, { status: 400 })

    const admin = createAdminClient()
    const { error } = await admin.from('club_website_config').upsert(
      { club_id, ...fields },
      { onConflict: 'club_id', ignoreDuplicates: false }
    )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
