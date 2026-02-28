/**
 * Inyecta JSON-LD en la página para SEO (Product, Organization, etc.).
 * Next.js recomienda script con dangerouslySetInnerHTML para ld+json.
 */
export function JsonLd<T extends Record<string, unknown>>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

const SITE_URL = 'https://senderosdechiapas.com.mx'

/** Parsea un string de precio a número (ej. "$1,500" o "Consultar" -> 1500 o null) */
function parsePrice(value: string | undefined): number | null {
  if (!value || typeof value !== 'string') return null
  const cleaned = value.replace(/\s/g, '').replace(/[$,]/g, '')
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : null
}

/** Construye JSON-LD tipo Product para un tour o paquete (reservable, con oferta). */
export function buildProductJsonLd(options: {
  name: string
  description: string
  image: string | string[]
  url: string
  price?: string
  duration?: string
  providerName?: string
}): Record<string, unknown> {
  const images = Array.isArray(options.image) ? options.image : [options.image]
  const imageUrls = images
    .filter(Boolean)
    .map((img) => (img.startsWith('http') ? img : `${SITE_URL}${img.startsWith('/') ? img : `/${img}`}`))

  const priceNumber = parsePrice(options.price)
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: options.url,
    availability: priceNumber != null ? 'https://schema.org/InStock' : 'https://schema.org/ContactForPrice',
  }
  if (priceNumber != null) {
    offer.price = priceNumber
    offer.priceCurrency = 'MXN'
  }

  const product: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.name,
    description: options.description.replace(/\s+/g, ' ').trim().slice(0, 500) || options.name,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    url: options.url,
    offers: offer,
  }
  if (options.providerName) {
    product.brand = {
      '@type': 'Organization',
      name: options.providerName,
      url: SITE_URL,
    }
  }
  if (options.duration) {
    product.additionalProperty = [
      { '@type': 'PropertyValue', name: 'Duración', value: options.duration },
    ]
  }
  return product
}

/** JSON-LD Organization para el sitio (usar en layout). */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Senderos de Chiapas',
    url: SITE_URL,
    description: 'Agencia de viajes y turismo en Chiapas, México. Tours, paquetes y experiencias.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MX',
      addressRegion: 'Chiapas',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  }
}
