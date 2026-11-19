import { NextResponse, type NextRequest } from 'next/server'
import { esPathToInternal, switchLangPath } from '@/lib/i18n'

/**
 * Las páginas viven en app/[lang]/<ruta en inglés>. Aquí se traduce la URL pública a esa ruta interna:
 * - Español (sin prefijo): /paquetes → /es/packages, /tour-detalles/x → /es/tour-details/x
 * - Inglés: /en/packages ya es la ruta interna, pasa tal cual
 * - /es/... no es pública (sería contenido duplicado): redirige a la URL en español
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname === '/en' || pathname.startsWith('/en/')) return NextResponse.next()

  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const internal = pathname.slice(3) || '/'
    const url = request.nextUrl.clone()
    url.pathname = switchLangPath(internal, 'es')
    return NextResponse.redirect(url, 308)
  }

  // Ruta desconocida: se manda igual bajo /es para que responda la página 404 del sitio
  const internal = esPathToInternal(pathname) ?? pathname
  const url = request.nextUrl.clone()
  url.pathname = `/es${internal === '/' ? '' : internal}`
  url.search = search
  return NextResponse.rewrite(url)
}

export const config = {
  // Fuera: archivos de Next, API, proxy de imágenes de Strapi y cualquier archivo con extensión (robots.txt, imágenes…)
  matcher: ['/((?!_next/|api/|strapi-uploads/|.*\\.[a-zA-Z0-9]+$).*)'],
}
