/**
 * Sanitize a user-provided URL to prevent XSS and other injection attacks.
 * Only allows https:// and http:// URLs. Returns null if invalid.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    // Only allow http(s) protocols
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null
    }
    // Block javascript: and data: schemes that might bypass URL constructor
    if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
      return null
    }
    return trimmed.slice(0, 2048) // Max URL length
  } catch {
    return null
  }
}

/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP per window.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  identifier: string,
  { maxRequests = 30, windowMs = 60_000 }: { maxRequests?: number; windowMs?: number } = {}
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: maxRequests - entry.count }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    rateLimitMap.forEach((val, key) => {
      if (now > val.resetAt) rateLimitMap.delete(key)
    })
  }, 5 * 60_000)
}
