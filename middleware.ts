// middleware.ts - CSP para todas las rutas + headers de seguridad y CORS para /api
// (X-Frame-Options, X-Content-Type-Options, Referrer-Policy y Permissions-Policy
// para todas las rutas se configuran en next.config.mjs)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Nota: Next.js App Router inyecta scripts inline propios para hidratar
// React (el payload de RSC). No aplican un nonce automáticamente en esta
// versión (verificado), así que script-src necesita 'unsafe-inline' para
// no romper la hidratación. Sigue bloqueando scripts externos no
// autorizados (la vía más común de XSS con payloads de terceros) y el
// resto de directivas (frame-ancestors, object-src, form-action) quedan
// estrictas.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com https://*.vercel-scripts.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', CSP)

  // CORS solo aplica a rutas de API
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return response
  }

  // CORS headers (ajusta según tus necesidades)
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  const origin = request.headers.get('origin')

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 horas
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
