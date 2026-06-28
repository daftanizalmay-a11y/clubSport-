import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvitationEmail({
  to,
  clubName,
  clubLogo,
  clubColor,
  roleName,
  inviterName,
  token,
  subdomain,
}: {
  to: string
  clubName: string
  clubLogo?: string
  clubColor?: string
  roleName: string
  inviterName: string
  token: string
  subdomain: string
}) {
  const color = clubColor || '#22c55e'
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join?token=${token}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        
        <!-- Header -->
        <tr><td style="background:${color}20;padding:32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.1);">
          ${clubLogo ? `<img src="${clubLogo}" alt="${clubName}" style="height:60px;margin-bottom:16px;object-fit:contain;">` : ''}
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">${clubName}</h1>
          <p style="margin:8px 0 0;color:${color};font-size:14px;">${subdomain}.clubsports.se</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;color:#ffffff;font-size:20px;">Du har blivit inbjuden!</h2>
          <p style="margin:0 0 16px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">
            <strong style="color:#ffffff;">${inviterName}</strong> har bjudit in dig att gå med i 
            <strong style="color:#ffffff;">${clubName}</strong> som <strong style="color:${color};">${roleName}</strong>.
          </p>
          <p style="margin:0 0 32px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;">
            Klicka på knappen nedan för att acceptera inbjudan och skapa ditt konto.
          </p>
          
          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${joinUrl}" style="display:inline-block;background:${color};color:#000000;font-weight:bold;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;">
                Acceptera inbjudan
              </a>
            </td></tr>
          </table>

          <p style="margin:24px 0 0;color:rgba(255,255,255,0.3);font-size:13px;text-align:center;">
            Länken är giltig i 7 dagar. Om du inte förväntade dig denna inbjudan kan du ignorera detta e-postmeddelande.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.2);font-size:12px;">
            Skickat via <span style="color:rgba(255,255,255,0.4);">ClubSports</span> — Föreningsplattformen för moderna klubbar
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: 'ClubSports <onboarding@resend.dev>',
    to,
    subject: `Du är inbjuden till ${clubName}`,
    html,
  })

  if (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

export async function sendFeeReminderEmail({
  to,
  memberName,
  clubName,
  clubColor,
  seasonName,
  amountDue,
  amountPaid,
  amountRemaining: remaining,
  dueDate,
}: {
  to: string
  memberName: string
  clubName: string
  clubColor?: string
  seasonName: string
  amountDue: number
  amountPaid: number
  amountRemaining: number
  dueDate?: string | null
}) {
  const color = clubColor || '#22c55e'
  const dueText = dueDate
    ? new Date(dueDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        <tr><td style="background:${color}20;padding:32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.1);">
          <h1 style="margin:0;color:#ffffff;font-size:22px;">${clubName}</h1>
          <p style="margin:8px 0 0;color:${color};font-size:14px;">Påminnelse om medlemsavgift</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;">Hej ${memberName},</p>
          <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;">
            Du har en utestående medlemsavgift för <strong style="color:#fff;">${seasonName}</strong>:
          </p>
          <table width="100%" style="margin:24px 0;background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;">
            <tr><td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;">Totalt belopp</td><td style="color:#fff;text-align:right;font-size:15px;">${amountDue.toLocaleString('sv-SE')} kr</td></tr>
            <tr><td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;">Betalt</td><td style="color:#22c55e;text-align:right;font-size:15px;">${amountPaid.toLocaleString('sv-SE')} kr</td></tr>
            <tr><td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;font-weight:bold;">Kvar att betala</td><td style="color:#ef4444;text-align:right;font-size:18px;font-weight:bold;">${remaining.toLocaleString('sv-SE')} kr</td></tr>
          </table>
          ${dueText ? `<p style="color:rgba(255,255,255,0.5);font-size:14px;">Förfallodatum: ${dueText}</p>` : ''}
          <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:24px;">Vänligen betala det utestående beloppet så snart som möjligt.</p>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-top:16px;">Med vänlig hälsning,<br><strong style="color:#fff;">${clubName}</strong></p>
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.2);font-size:12px;">Skickat via ClubSports</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: 'ClubSports <onboarding@resend.dev>',
    to,
    subject: `Påminnelse: ${remaining.toLocaleString('sv-SE')} kr kvar att betala — ${clubName}`,
    html,
  })

  if (error) {
    console.error('Fee reminder email error:', error)
    return { success: false, error }
  }

  return { success: true, data }
}
