// lib/rate-limit.ts
// Rate limiting simple sin dependencias externas (para desarrollo)
// En producción, usar: npm install @upstash/ratelimit @upstash/redis

export class RateLimit {
  private attempts = new Map<string, { count: number; resetTime: number }>()

  /**
   * Verificar si una solicitud está dentro del límite de rate
   * @param identifier - ID único (IP, user ID, etc.)
   * @param maxAttempts - Número máximo de intentos
   * @param windowMs - Ventana de tiempo en milisegundos
   * @returns true si está dentro del límite, false si lo excede
   */
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

  /**
   * Resetear el contador para un identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Limpiar intentos expirados (ejecutar periódicamente)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.attempts.entries()) {
      if (now > value.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// Instancia global para rate limiting
export const rateLimit = new RateLimit()

// Para compatibilidad con código que usa checkRateLimit
export async function checkRateLimit(identifier: string): Promise<boolean> {
  return rateLimit.check(identifier, 5, 60000) // 5 requests por minuto
}

// Alias para compatibilidad
export const simpleRateLimit = rateLimit
