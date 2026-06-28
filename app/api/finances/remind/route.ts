import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { payment_id, email, club_name, amount } = await req.json()
    // Mark reminder as sent
    const admin = createAdminClient()
    await admin.from('fee_payments').update({ reminder_sent_at: new Date().toISOString() }).eq('id', payment_id)
    // Email sending would go here via Resend/SendGrid
    // For now we just mark it as sent
    console.log(`Reminder sent to ${email} for ${club_name} — ${amount} kr`)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
