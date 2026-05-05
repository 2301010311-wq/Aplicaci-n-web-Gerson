// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Configuración básica de rate limiting
// Para producción necesitarías Redis (Upstash, Redis Cloud, etc.)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests por minuto por IP
})

export async function checkRateLimit(identifier: string): Promise<boolean> {
  try {
    const { success } = await ratelimit.limit(identifier)
    return success
  } catch (error) {
    // En desarrollo, sin Redis, permitir todas las requests
    console.warn('Rate limiting no disponible:', error)
    return true
  }
}

// Rate limiting simple sin Redis (para desarrollo)
export class SimpleRateLimit {
  private attempts = new Map<string, { count: number; resetTime: number }>()

  check(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      // Primera attempt o ventana expirada
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= maxAttempts) {
      return false // Rate limit exceeded
    }

    record.count++
    return true
  }
}

export const simpleRateLimit = new SimpleRateLimit()