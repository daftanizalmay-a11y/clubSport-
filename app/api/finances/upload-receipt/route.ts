import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const club_id = formData.get('club_id') as string

    if (!file) return NextResponse.json({ error: 'Ingen fil' }, { status: 400 })

    const admin = createAdminClient()
    const ext = file.name.split('.').pop()
    const fileName = `${club_id}/${user.id}/${Date.now()}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error } = await admin.storage.from('receipts').upload(fileName, buffer, { contentType: file.type })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: { publicUrl } } = admin.storage.from('receipts').getPublicUrl(fileName)
    return NextResponse.json({ url: publicUrl, name: file.name })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
