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
      // URL pública en español; la ruta interna sigue siendo tour-details
      { source: '/tour-details', destination: '/tour-detalles', permanent: true },
      { source: '/tour-details/:path*', destination: '/tour-detalles/:path*', permanent: true },
      // URL pública en español; la ruta interna sigue siendo packages
      { source: '/packages', destination: '/paquetes', permanent: true },
      { source: '/packages/:path*', destination: '/paquetes/:path*', permanent: true },
      // URL pública en español; la ruta interna sigue siendo package-details
      { source: '/package-details', destination: '/paquete-detalles', permanent: true },
      { source: '/package-details/:path*', destination: '/paquete-detalles/:path*', permanent: true },
    ]
  },
  async rewrites() {
    return [
      // Las URLs públicas en español (/paquetes, /tour-detalles/...) y en inglés (/en/...) las traduce middleware.ts
      // a las páginas de app/[lang]/
      // Proxy de imágenes de Strapi (mismo origen). Pasa por la ruta de API, que valida el path
      { source: '/strapi-uploads/:path*', destination: '/api/strapi-uploads/:path*' },
    ]
  },
  // Cabeceras de seguridad para todo el sitio. Sin CSP por ahora: hay scripts y estilos inline del tema
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // El sitio no se debe mostrar dentro de iframes de otros dominios (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Sin includeSubDomains: no sabemos si todos los subdominios del dominio sirven HTTPS
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
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

