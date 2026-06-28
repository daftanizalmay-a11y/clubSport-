import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const secret = process.env.FIXTURE_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'clubsports-dev-key'
  return createHash('sha256').update(secret).digest()
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptSecret(ciphertext: string): string {
  const [ivB64, tagB64, dataB64] = ciphertext.split(':')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Invalid encrypted value')
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()])
  return decrypted.toString('utf8')
}

export function generateWebhookSecret(): string {
  return randomBytes(32).toString('hex')
}

export function maskSecret(value: string): string {
  if (value.length <= 8) return '••••••••'
  return `${value.slice(0, 4)}${'•'.repeat(Math.min(12, value.length - 8))}${value.slice(-4)}`
}
