import type { Metadata } from 'next'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PackageItem from '@/components/PackageItem'
import SeasonPackageItem from '@/components/SeasonPackageItem'
import Link from 'next/link'
import { fetchPackagesPageData, fetchSeasonsForPackagesPage, STRAPI_REVALIDATE_SECONDS, type AdaptedDestination, type AdaptedSeason } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: 'Paquetes turísticos - Senderos de Chiapas',
  description: 'Paquetes y rutas turísticas en Chiapas por temporada. Incluyen itinerario, precios y opciones de pago.',
}

const DEFAULT_IMAGE = '/assets/images/place/single-place-1.jpg'

export default async function PackagesPage() {
  let packagesList: AdaptedDestination[] = []
  let seasons: AdaptedSeason[] = []
  let imageBannerUrl: string | null = null

  try {
    const [data, seasonsData] = await Promise.all([
      fetchPackagesPageData(),
      fetchSeasonsForPackagesPage(),
    ])
    packagesList = data.packages
    imageBannerUrl = data.imageBannerUrl
    seasons = seasonsData
  } catch (error) {
    console.error('Error fetching packages from Strapi:', error)
  }

  const displayPackages = packagesList.filter(
    (pkg) => (pkg.badge || '') !== 'oculto'
  )
  const hasDataFromStrapi = displayPackages.length > 0 || seasons.length > 0
  const bannerBg = imageBannerUrl || '/assets/images/bg/page-bg.jpg'

  return (
    <React.Fragment>
      <Header />

      {hasDataFromStrapi && (
        <section className="page-banner overlay pt-220 pb-220 bg_cover" style={{ backgroundImage: `url(${bannerBg})` }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 mx-auto text-center">
                <div className="page-banner-content text-center text-white">
                  <h1 className="page-title">Paquetes</h1>
                  <ul className="breadcrumb-link text-white d-flex justify-content-center flex-wrap list-unstyled mb-0">
                    <li><Link href="/">Home</Link></li>
                    <li className="active">Paquetes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasDataFromStrapi ? (
        <section className="places-section pt-80 pb-180">
          <div className="places-section__container">
            {/* Grupo 1: Paquetes de temporada — solo se muestra si hay datos (no mostrar sección vacía) */}
            {seasons.length > 0 && (
              <div className="packages-group packages-group--seasonal pb-80">
                <h2 className="packages-group__title">
                  Paquetes de temporada
                </h2>
                <p className="packages-group__subtitle pb-60">
                  Aprovecha rutas y promociones por fechas especiales
                </p>
                <div className="places-section__grid places-section__grid--seasonal">
                  {seasons.map((season, index) => (
                    <div key={season.link || index} className="places-section__item">
                      <div className="wow fadeInUp">
                        <SeasonPackageItem
                          variant="card"
                          title={season.title}
                          image={season.image}
                          link={season.link}
                          category={season.category}
                          dateFormatted={season.dateFormatted}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grupo 2: Todos los paquetes — título y subtítulo solo si hay paquetes de temporada */}
            {displayPackages.length > 0 && (
              <div className="packages-group packages-group--all">
                {seasons.length > 0 && (
                  <>
                    <h2 className="packages-group__title">
                      Todos los paquetes
                    </h2>
                    <p className="packages-group__subtitle pb-60">
                      Explora todas nuestras opciones disponibles
                    </p>
                  </>
                )}
                <div className="places-section__grid">
                  {displayPackages.map((pkg, index) => (
                    <div key={pkg.slug || pkg.title || index} className="places-section__item">
                      <div className="wow fadeInUp">
                        <PackageItem
                          title={pkg.title}
                          description={pkg.description}
                          image={pkg.image && !pkg.image.includes('las-tres-tzimoleras') ? pkg.image : DEFAULT_IMAGE}
                          link={pkg.slug ? `/paquete-detalles/${pkg.slug}` : (pkg.link || '/paquetes')}
                          departureDate={pkg.departureDate}
                          duration={pkg.duration}
                          price={pkg.price}
                          badge={pkg.badge}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="container text-center mt-50">
            <Link
              href="/"
              className="main-btn wow fadeInUp"
              style={{ padding: '16px 45px', backgroundColor: 'rgba(99, 171, 69, 0.2)', color: '#63ab45' }}
            >
              Regresar a Home
            </Link>
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

      <Footer />
    </React.Fragment>
  )
}
