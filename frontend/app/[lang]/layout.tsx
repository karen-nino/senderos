import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Scripts from '@/components/Scripts'
import ThemeReinitOnRoute from '@/components/ThemeReinitOnRoute'
import { JsonLd, buildOrganizationJsonLd } from '@/components/JsonLd'
import { Prompt } from 'next/font/google'
import { notFound } from 'next/navigation'
import { LangProvider } from '@/components/LangProvider'
import { HTML_LANG, LANGS, OG_LOCALE, isLang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import '../globals.scss'

// Se sirve desde el propio sitio (sin la hoja de Google Fonts que bloqueaba el primer pintado)
const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-prompt',
})

const SITE_URL = 'https://senderosdechiapas.com.mx'
const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg`

/** Las dos versiones (es, en) se generan de antemano; cualquier otro valor de [lang] es 404. */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = isLang(params.lang) ? params.lang : 'es'
  const { meta } = getDictionary(lang)
  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[lang],
      url: lang === 'en' ? `${SITE_URL}/en` : SITE_URL,
      siteName: 'Senderos de Chiapas',
      title: meta.title,
      description: meta.description,
      images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.twitterDescription,
      images: [OG_IMAGE_URL],
    },
  }
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  if (!isLang(params.lang)) notFound()
  const lang = params.lang
  return (
    <html lang={HTML_LANG[lang]} className={prompt.variable}>
      <head>
        <link rel="icon" href="/assets/images/favicon.ico" type="image/x-icon" />
        <link rel="stylesheet" href="/assets/fonts/flaticon/flaticon_gowilds.css" />
        <link rel="stylesheet" href="/assets/fonts/fontawesome/css/subset.min.css" />
        <link rel="stylesheet" href="/assets/vendor/bootstrap/css/bootstrap.min.css" />
        {/* El CSS de slick, animate, magnific-popup y calendar lo carga <Scripts /> junto con sus plugins: no bloquea el primer pintado */}
        <link rel="stylesheet" href="/assets/css/default.css" />
        {/* CSS compilado comentado para permitir que SCSS tenga prioridad */}
        {/* <link rel="stylesheet" href="/assets/css/style.css" /> */}
      </head>
      <body>
        <JsonLd data={buildOrganizationJsonLd()} />
        <LangProvider lang={lang}>{children}</LangProvider>
        <Scripts />
        <ThemeReinitOnRoute />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

