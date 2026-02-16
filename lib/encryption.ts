import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

if (!process.env.ENCRYPTION_KEY && !process.env.NEXTAUTH_SECRET) {
  console.warn('[SECURITY] Neither ENCRYPTION_KEY nor NEXTAUTH_SECRET is set. Encryption will be insecure.')
}

const SECRET = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || ''
const SALT = process.env.ENCRYPTION_SALT || 'moltcompany-encryption-salt-v1'
const KEY = crypto.scryptSync(SECRET, SALT, 32)

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
