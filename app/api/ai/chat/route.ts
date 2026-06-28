import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const { messages, club_context } = await req.json()

    const systemPrompt = `Du är en AI-assistent för ${club_context.name}, en ${club_context.sport}-klubb baserad i ${club_context.city || 'Sverige'}.

Klubbinformation:
- Namn: ${club_context.name}
- Sport: ${club_context.sport}
- Stad: ${club_context.city || 'Ej angivet'}
- Antal medlemmar: ${club_context.member_count}
- Antal lag: ${club_context.team_count}
- Plan: ${club_context.plan}

Du hjälper klubbens administratörer och styrelsemedlemmar med:
- Skrivande av protokoll, kallelser och officiella dokument
- Svar på frågor om föreningsadministration
- Hjälp med kommunikation till medlemmar
- Råd om svenska idrottsföreningars rutiner och regler
- AGM-planering och styrelsefrågor

Svara alltid på svenska om inte användaren skriver på engelska. Var professionell men vänlig.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ content })
  } catch (err) {
    console.error('AI error:', err)
    return NextResponse.json({ error: 'AI-fel' }, { status: 500 })
  }
}
