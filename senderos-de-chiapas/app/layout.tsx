import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Scripts from '@/components/Scripts'
import ThemeReinitOnRoute from '@/components/ThemeReinitOnRoute'
import { JsonLd, buildOrganizationJsonLd } from '@/components/JsonLd'
import './globals.scss'

const SITE_URL = 'https://senderosdechiapas.com.mx'
const OG_IMAGE_URL = `${SITE_URL}/assets/images/og-image.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Senderos de Chiapas - Rutas, regiones y actividades',
  description: 'Agencia de viajes y turismo en Chiapas, México. Tours, paquetes y experiencias: cascadas, zonas arqueológicas, ecoturismo. Reserva y cotiza en línea.',
  keywords: ['turismo Chiapas', 'tours Chiapas', 'paquetes turísticos', 'viajes Chiapas', 'agencias de viajes', 'cascadas', 'ecoturismo', 'Senderos de Chiapas'],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: SITE_URL,
    siteName: 'Senderos de Chiapas',
    title: 'Senderos de Chiapas - Rutas, regiones y actividades',
    description: 'Agencia de viajes y turismo en Chiapas, México. Tours, paquetes y experiencias: cascadas, zonas arqueológicas, ecoturismo. Reserva y cotiza en línea.',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: 'Senderos de Chiapas - Rutas, regiones y actividades',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Senderos de Chiapas - Rutas, regiones y actividades',
    description: 'Agencia de viajes y turismo en Chiapas, México. Tours, paquetes y experiencias. Reserva y cotiza en línea.',
    images: [OG_IMAGE_URL],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/assets/images/favicon.ico" type="image/x-icon" />
        <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/fonts/flaticon/flaticon_gowilds.css" />
        <link rel="stylesheet" href="/assets/fonts/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/assets/vendor/bootstrap/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/vendor/magnific-popup/dist/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/vendor/slick/slick.css" />
        <link rel="stylesheet" href="/assets/vendor/jquery-ui/jquery-ui.min.css" />
        <link rel="stylesheet" href="/assets/vendor/nice-select/css/nice-select.css" />
        <link rel="stylesheet" href="/assets/vendor/calendar/calendar.min.css" />
        <link rel="stylesheet" href="/assets/vendor/animate.css" />
        <link rel="stylesheet" href="/assets/css/default.css" />
        {/* CSS compilado comentado para permitir que SCSS tenga prioridad */}
        {/* <link rel="stylesheet" href="/assets/css/style.css" /> */}
      </head>
      <body>
        <JsonLd data={buildOrganizationJsonLd()} />
        {children}
        <Scripts />
        <ThemeReinitOnRoute />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

