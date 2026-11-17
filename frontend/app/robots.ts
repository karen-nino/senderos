import type { MetadataRoute } from 'next'

const SITE_URL = 'https://senderosdechiapas.com.mx'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/strapi-uploads/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
