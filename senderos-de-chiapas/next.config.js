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
      { source: '/destinos', destination: '/tours' },
      { source: '/tour-detalles/:path*', destination: '/tour-details/:path*' },
      { source: '/destino-detalles/:path*', destination: '/tour-details/:path*' },
      { source: '/nosotros', destination: '/about' },
      { source: '/experiencias', destination: '/gallery' },
      { source: '/internacional', destination: '/international' },
      { source: '/contacto', destination: '/contact' },
      { source: '/preguntas-frecuentes', destination: '/faq' },
      { source: '/politica-de-privacidad', destination: '/privacy-policy' },
      { source: '/paquetes', destination: '/packages' },
      { source: '/paquetes/:path*', destination: '/packages/:path*' },
      { source: '/paquete-detalles/:path*', destination: '/package-details/:path*' },
      { source: '/internacional-detalles/:path*', destination: '/package-details/:path*' },
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

