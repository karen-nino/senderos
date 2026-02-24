/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/destination', destination: '/tours', permanent: true },
      { source: '/about', destination: '/nosotros', permanent: true },
      { source: '/gallery', destination: '/experiencias', permanent: true },
      { source: '/contact', destination: '/contacto', permanent: true },
      { source: '/faq', destination: '/preguntas-frecuentes', permanent: true },
      { source: '/privacy-policy', destination: '/politica-de-privacidad', permanent: true },
    ]
  },
  async rewrites() {
    // Usar STRAPI_URL primero para que el proxy de imágenes apunte al mismo Strapi que la API (local vs Fly).
    const strapiUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
    return [
      { source: '/destinos', destination: '/tours' },
      { source: '/destino-detalles/:path*', destination: '/tour-details/:path*' },
      { source: '/nosotros', destination: '/about' },
      { source: '/experiencias', destination: '/gallery' },
      { source: '/internacional', destination: '/international' },
      { source: '/contacto', destination: '/contact' },
      { source: '/preguntas-frecuentes', destination: '/faq' },
      { source: '/politica-de-privacidad', destination: '/privacy-policy' },
      { source: '/paquete-detalles/:path*', destination: '/package-details/:path*' },
      { source: '/internacional-detalles/:path*', destination: '/package-details/:path*' },
      // Proxy de imágenes de Strapi para evitar CORS y permitir carga desde mismo origen
      { source: '/strapi-uploads/:path*', destination: `${strapiUrl}/uploads/:path*` },
    ]
  },
  images: {
    domains: [],
    unoptimized: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}

module.exports = nextConfig

