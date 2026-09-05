/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // IMPORTANTE: Revisar todos los errores TypeScript
    // El compilador es strict en Next.js 16
    tsconfigPath: './tsconfig.json',
  },
  images: {
    unoptimized: true,
  },
  // Habilitar strict mode en desarrollo
  reactStrictMode: true,
  // Optimizaciones de producción
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  // NOTA: swcMinify fue removido en Next.js 16 (minificación es automática)
  // Antes: swcMinify: true,

  // NOTA: output: 'standalone' se removió — no lo usa el Dockerfile (no
  // referencia .next/standalone) y en Next.js 16.3.4 rompe el build en
  // Vercel (ENOENT en next-server.js.nft.json durante el tracing). Vercel
  // no lo necesita: genera su propio output optimizado para funciones serverless.

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
