import { createHmac, timingSafeEqual } from 'crypto'

export function signWebhookPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export function verifyWebhookSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = signWebhookPayload(payload, secret)
  const sig = signature.replace(/^sha256=/, '')
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  } catch {
    return false
  }
}
