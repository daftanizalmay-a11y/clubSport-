import { NextRequest, NextResponse } from 'next/server'
import { requireClubAdmin, getClubOrError } from '@/lib/fixtures/auth'
import { extractFixturesFromImage, detectMediaType } from '@/lib/fixtures/vision'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId } = await params
    const auth = await requireClubAdmin(clubId, req)
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const clubResult = await getClubOrError(auth.admin, clubId)
    if ('error' in clubResult) {
      return NextResponse.json({ success: false, error: clubResult.error }, { status: clubResult.status })
    }
    const { club } = clubResult

    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'Ingen bild uppladdad' }, { status: 400 })
    }

    const mediaType = detectMediaType(file.type)
    if (!mediaType || (mediaType !== 'image/jpeg' && mediaType !== 'image/png')) {
      return NextResponse.json({ success: false, error: 'Endast JPG och PNG stöds' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'Bilden får max vara 5 MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')

    const result = await extractFixturesFromImage(base64, mediaType, {
      clubName: club.name,
      sport: club.sport || 'multi_sport',
    })

    return NextResponse.json({
      success: true,
      matches: result.matches,
      total_matches: result.total_matches,
      confidence: result.confidence,
      notes: result.notes,
      // backward compat for single-match clients
      extracted_data: result.matches[0] ?? null,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Serverfel'
    const status = msg.includes('extraher') || msg.includes('tolka') || msg.includes('identifiera') || msg.includes('ANTHROPIC') ? 422 : 500
    return NextResponse.json({ success: false, error: msg }, { status })
  }
}
