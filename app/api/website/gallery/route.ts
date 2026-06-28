import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const club_id = formData.get('club_id') as string
    const caption = formData.get('caption') as string || ''

    if (!file || !club_id) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })

    const admin = createAdminClient()
    const ext = file.name.split('.').pop()
    const fileName = `gallery/${club_id}/${Date.now()}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await admin.storage
      .from('club-assets')
      .upload(fileName, buffer, { contentType: file.type, upsert: false })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = admin.storage.from('club-assets').getPublicUrl(fileName)

    const { error: dbError } = await admin.from('club_gallery').insert({
      club_id,
      image_url: publicUrl,
      caption: caption || null,
      uploaded_by: user.id,
    })

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (err) {
    console.error('Gallery upload error:', err)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { photo_id } = await req.json()
    if (!photo_id) return NextResponse.json({ error: 'Saknat photo_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('club_gallery').delete().eq('id', photo_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
