/**
 * Idiomas del sitio. El español vive en la raíz con rutas en español (/paquetes, /tour-detalles/...);
 * el inglés vive bajo /en con las rutas internas en inglés (/en/packages, /en/tour-details/...).
 * Internamente todas las páginas están en app/[lang]/<ruta en inglés>; middleware.ts traduce la URL pública.
 */

export const LANGS = ['es', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'es'

/**
 * El sitio en inglés ya funciona en /en, pero se mantiene oculto hasta completar las traducciones en Strapi.
 * En false: no se muestra el botón de idioma, /en no se anuncia en el sitemap ni en hreflang y lleva noindex.
 * Para publicarlo, cambiar a true.
 */
export const ENGLISH_PUBLIC = false

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
}

/** Código de idioma en Strapi (Settings → Internationalization). */
export const STRAPI_LOCALE: Record<Lang, string> = { es: 'es-MX', en: 'en' }

/** Para <html lang> y Open Graph. */
export const HTML_LANG: Record<Lang, string> = { es: 'es', en: 'en' }
export const OG_LOCALE: Record<Lang, string> = { es: 'es_MX', en: 'en_US' }

/** Primer segmento de la URL pública en español → ruta interna (que también es la URL pública en inglés). */
const ES_TO_INTERNAL: Record<string, string> = {
  paquetes: 'packages',
  'paquete-detalles': 'package-details',
  'tour-detalles': 'tour-details',
  'destino-detalles': 'tour-details',
  destinos: 'tours',
  tours: 'tours',
  nosotros: 'about',
  experiencias: 'gallery',
  internacional: 'international',
  'internacional-detalles': 'package-details',
  contacto: 'contact',
  'preguntas-frecuentes': 'faq',
  'politica-de-privacidad': 'privacy-policy',
}

/** Ruta interna → URL pública en español (la primera de cada par es la canónica). */
const INTERNAL_TO_ES: Record<string, string> = {
  packages: 'paquetes',
  'package-details': 'paquete-detalles',
  'tour-details': 'tour-detalles',
  tours: 'tours',
  about: 'nosotros',
  gallery: 'experiencias',
  international: 'internacional',
  contact: 'contacto',
  faq: 'preguntas-frecuentes',
  'privacy-policy': 'politica-de-privacidad',
}

function splitPath(path: string): { first: string; rest: string; suffix: string } {
  const m = path.match(/^([^?#]*)(.*)$/)
  const pathname = m?.[1] ?? path
  const suffix = m?.[2] ?? ''
  const [, first = '', ...rest] = pathname.split('/')
  return { first, rest: rest.length ? `/${rest.join('/')}` : '', suffix }
}

/** URL pública en español → ruta interna, o null si el primer segmento no es una página conocida. */
export function esPathToInternal(path: string): string | null {
  const { first, rest, suffix } = splitPath(path)
  if (first === '') return `/${suffix}`
  const internal = ES_TO_INTERNAL[first]
  return internal ? `/${internal}${rest}${suffix}` : null
}

/** Ruta interna → URL pública en español. */
function internalToEsPath(path: string): string {
  const { first, rest, suffix } = splitPath(path)
  if (first === '') return `/${suffix}`
  const es = INTERNAL_TO_ES[first]
  return es ? `/${es}${rest}${suffix}` : path
}

/**
 * Enlace interno en el idioma de la página. Acepta la URL en español que ya usa el sitio
 * ("/paquete-detalles/x", "/contacto#form") y devuelve "/en/package-details/x" en inglés.
 * Enlaces externos, anclas, tel: y mailto: pasan sin cambios.
 */
export function localizePath(lang: Lang, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  if (lang === 'es') return path
  const internal = esPathToInternal(path) ?? (splitPath(path).first in INTERNAL_TO_ES ? path : null)
  // Lo que no es una página del sitio (/assets/..., /api/...) no lleva prefijo de idioma
  if (internal === null) return path
  return internal.startsWith('/?') || internal.startsWith('/#') || internal === '/' ? `/en${internal.slice(1)}` : `/en${internal}`
}

/** URL pública de la página actual en el otro idioma (para el botón de idioma). Conserva el slug. */
export function switchLangPath(pathname: string, target: Lang): string {
  const isEn = pathname === '/en' || pathname.startsWith('/en/')
  const internal = isEn ? pathname.slice(3) || '/' : esPathToInternal(pathname) ?? pathname
  if (target === 'en') return internal === '/' ? '/en' : `/en${internal}`
  return internalToEsPath(internal)
}

export const SITE_URL = 'https://senderosdechiapas.com.mx'

/**
 * Canónica de la página en su idioma y su versión en el otro (hreflang), a partir de la URL en español.
 * Uso: `alternates: pageAlternates(lang, '/paquetes')` en generateMetadata.
 */
export function pageAlternates(lang: Lang, esPath: string) {
  const url = (l: Lang) => `${SITE_URL}${localizePath(l, esPath)}`.replace(/(\.mx)\/$/, '$1')
  return {
    canonical: url(lang),
    ...(ENGLISH_PUBLIC ? { languages: { es: url('es'), en: url('en'), 'x-default': url('es') } } : {}),
  }
}
