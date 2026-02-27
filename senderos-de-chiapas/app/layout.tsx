import type { Metadata } from 'next'
import Scripts from '@/components/Scripts'
import ThemeReinitOnRoute from '@/components/ThemeReinitOnRoute'
import './globals.scss'

const SITE_URL = 'https://senderosdechiapas.com.mx'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Senderos de Chiapas - Tours and Travel',
  description: 'Adventure, Tours, Travel',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: SITE_URL,
    siteName: 'Senderos de Chiapas',
    title: 'Senderos de Chiapas - Tours and Travel',
    description: 'Adventure, Tours, Travel',
    images: [
      {
        url: '/assets/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Senderos de Chiapas - Tours and Travel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Senderos de Chiapas - Tours and Travel',
    description: 'Adventure, Tours, Travel',
    images: ['/assets/images/og-image.jpg'],
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
        <link rel="shortcut icon" href="/assets/images/favicon.ico" type="image/png" />
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
        {children}
        <Scripts />
        <ThemeReinitOnRoute />
      </body>
    </html>
  )
}

