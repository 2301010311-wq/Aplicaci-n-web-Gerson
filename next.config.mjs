/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // CRÍTICO: Remover cuando se resuelvan todos los errores TypeScript
    // No ocultar errores de compilación en producción
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
  // Mejorar performance
  swcMinify: true,
  // Output optimizado para Next.js 16
  output: 'standalone',
}

export default nextConfig
