// middleware.ts - Headers de seguridad globales
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Solo aplicar a rutas de API
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // Headers de seguridad básicos
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

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
  matcher: '/api/:path*'
}