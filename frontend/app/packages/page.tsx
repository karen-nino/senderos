import type { Metadata } from 'next'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CardsExplorer from '@/components/CardsExplorer'
import PageIntro from '@/components/PageIntro'
import Link from 'next/link'
import { fetchPackagesPageData, fetchSeasonsForPackagesPage, fetchAdventuresForPackagesPage, STRAPI_REVALIDATE_SECONDS, getPackageDetailHref, type AdaptedDestination, type AdaptedSeason } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: 'Paquetes turísticos - Senderos de Chiapas',
  description: 'Paquetes y rutas turísticas en Chiapas por temporada. Incluyen itinerario, precios y opciones de pago.',
}

const DEFAULT_IMAGE = '/assets/images/place/single-place-1.jpg'

export default async function PackagesPage() {
  let packagesList: AdaptedDestination[] = []
  let seasons: AdaptedSeason[] = []
  let adventures: AdaptedSeason[] = []

  try {
    const [data, seasonsData, adventuresData] = await Promise.all([
      fetchPackagesPageData(),
      fetchSeasonsForPackagesPage(),
      fetchAdventuresForPackagesPage(),
    ])
    packagesList = data.packages
    seasons = seasonsData
    adventures = adventuresData
  } catch (error) {
    console.error('Error fetching packages from Strapi:', error)
  }

  const displayPackages = packagesList.filter(
    (pkg) => (pkg.badge || '') !== 'oculto'
  )
  const hasDataFromStrapi =
    displayPackages.length > 0 || seasons.length > 0 || adventures.length > 0

  return (
    <React.Fragment>
      <Header />
      <main>


        {hasDataFromStrapi ? (
          <section className="listing-page pb-160">
            <PageIntro
              title="Paquetes"
              intro="Recorre Chiapas con un paquete por temporada, de aventura o elige entre todos nuestros recorridos."
            />
            <div className="container">
              <CardsExplorer
                groups={[
                  {
                    id: 'temporada',
                    icon: 'far fa-calendar-alt',
                    label: 'Por temporada',
                    title: 'Paquetes por temporada',
                    subtitle: 'Aprovecha rutas y promociones por fechas especiales',
                    items: seasons.map((season, index) => ({
                      key: season.link || String(index),
                      href: getPackageDetailHref(season.link),
                      tag: 'Temporada',
                      title: season.title,
                      image: season.image,
                      badge: season.badge,
                      description: season.category || season.description,
                      departureDate: season.dateFormatted,
                      duration: season.duration,
                      price: season.price,
                    })),
                  },
                  {
                    id: 'aventura',
                    icon: 'fas fa-mountain',
                    label: 'De aventura',
                    title: 'Paquetes de Aventura',
                    subtitle: 'Rutas llenas de adrenalina para los más aventureros',
                    items: adventures.map((adventure, index) => ({
                      key: adventure.link || String(index),
                      href: getPackageDetailHref(adventure.link),
                      tag: 'Aventura',
                      title: adventure.title,
                      image: adventure.image,
                      badge: adventure.badge,
                      description: adventure.category || adventure.description,
                      departureDate: adventure.dateFormatted,
                      duration: adventure.duration,
                      price: adventure.price,
                    })),
                  },
                  {
                    id: 'paquetes',
                    icon: 'fas fa-suitcase-rolling',
                    label: 'Paquetes',
                    title: 'Paquetes',
                    subtitle: 'Explora todas nuestras opciones disponibles',
                    items: displayPackages.map((pkg, i) => ({
                      key: String(pkg.slug || pkg.title || i),
                      href: pkg.slug ? `/paquete-detalles/${pkg.slug}` : (pkg.link || '/paquetes'),
                      tag: 'Paquete',
                      title: pkg.title,
                      image: pkg.image && !pkg.image.includes('las-tres-tzimoleras') ? pkg.image : DEFAULT_IMAGE,
                      badge: pkg.badge,
                      description: pkg.route ? undefined : pkg.description,
                      departureDate: pkg.departureDate,
                      duration: pkg.duration,
                      route: pkg.route,
                      price: pkg.price,
                    })),
                  },
                ].filter((group) => group.items.length > 0)}
              />
            </div>
          </section>
        ) : (
          <section className="contact-section pt-220 pb-220">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                  <div className="section-title mb-70 wow fadeInDown">
                    <i className="fas fa-suitcase mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                    <span className="sub-title">Información no disponible</span>
                    <h2>Por el momento no hay paquetes disponibles</h2>
                    <p className="mt-40">
                      Estamos trabajando para actualizar nuestros paquetes. Si gustas conocer más sobre nuestros servicios y opciones disponibles, contáctanos y con gusto te atendemos.
                    </p>
                  </div>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    <Link
                      href="/"
                      className="main-btn wow fadeInUp"
                      style={{ padding: '16px 45px', backgroundColor: 'rgba(99, 171, 69, 0.2)', color: '#63ab45' }}
                    >
                      Regresar a Home
                    </Link>
                    <Link href="/contacto" className="main-btn primary-btn wow fadeInUp" style={{ padding: '16px 45px' }}>
                      Contáctanos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </React.Fragment>
  )
}
