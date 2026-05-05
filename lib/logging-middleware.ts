import logger from './logger'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

/**
 * Middleware para auto-logging de requests
 * 
 * Ejemplo de uso:
 * ```typescript
 * export const middleware = (request: NextRequest) => {
 *   return withRequestLogging(request)
 * }
 * ```
 */
export async function withRequestLogging(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || randomUUID()
  const startTime = performance.now()
  
  const method = request.method
  const { pathname } = new URL(request.url)
  const userId = request.headers.get('x-user-id') || 'anonymous'
  
  // Log entrada
  logger.debug({
    requestId,
    userId,
    method,
    path: pathname,
    action: 'request_received'
  }, `📥 ${method} ${pathname}`)
  
  // Continuar con el flujo (agregar requestId a headers para que esté disponible en el handler)
  const response = new NextResponse(null, {
    status: 999,
    statusText: 'Processing'
  })
  
  // Guardar requestId para que esté disponible en el handler
  response.headers.set('x-request-id', requestId)
  
  return response
}

/**
 * Wrapper para handlers de API que agrega logging automático
 * 
 * Ejemplo de uso:
 * ```typescript
 * export const GET = withApiLogging(async (request) => {
 *   // handler code
 * })
 * ```
 */
export function withApiLogging(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const requestId = request.headers.get('x-request-id') || randomUUID()
    const startTime = performance.now()
    
    const method = request.method
    const { pathname } = new URL(request.url)
    const userId = request.headers.get('x-user-id') || 'anonymous'
    
    try {
      // Log entrada
      logger.info({
        requestId,
        userId,
        method,
        path: pathname,
        action: 'api_request_start'
      }, `🚀 ${method} ${pathname}`)
      
      // Ejecutar handler
      const response = await handler(request)
      const duration = performance.now() - startTime
      
      // Log salida exitosa
      logger.info({
        requestId,
        userId,
        method,
        path: pathname,
        statusCode: response.status,
        duration_ms: Math.round(duration),
        action: 'api_request_success'
      }, `✅ ${method} ${pathname} ${response.status} (${Math.round(duration)}ms)`)
      
      // Agregar requestId a la respuesta
      response.headers.set('x-request-id', requestId)
      return response
      
    } catch (error) {
      const duration = performance.now() - startTime
      
      logger.error({
        requestId,
        userId,
        method,
        path: pathname,
        duration_ms: Math.round(duration),
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        action: 'api_request_error'
      }, `❌ ${method} ${pathname} error (${Math.round(duration)}ms)`)
      
      // Re-lanzar el error para que sea manejado por Next.js
      throw error
    }
  }
}

/**
 * Extrae el requestId de un NextRequest
 */
export function getRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || randomUUID()
}

/**
 * Extrae el userId de un NextRequest
 */
export function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || 'anonymous'
}
