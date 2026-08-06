import type { Metadata } from 'next'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PackageItem from '@/components/PackageItem'
import SeasonPackageItem from '@/components/SeasonPackageItem'
import FilteredCardsList from '@/components/FilteredCardsList'
import Link from 'next/link'
import { fetchPackagesPageData, fetchSeasonsForPackagesPage, fetchAdventuresForPackagesPage, STRAPI_REVALIDATE_SECONDS, type AdaptedDestination, type AdaptedSeason } from '@/lib/strapi'

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
  let imageBannerUrl: string | null = null

  try {
    const [data, seasonsData, adventuresData] = await Promise.all([
      fetchPackagesPageData(),
      fetchSeasonsForPackagesPage(),
      fetchAdventuresForPackagesPage(),
    ])
    packagesList = data.packages
    imageBannerUrl = data.imageBannerUrl
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
                  Paquetes por temporada
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
                          description={season.description}
                          duration={season.duration}
                          price={season.price}
                          badge={season.badge}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grupo 2: Paquetes de aventura — solo se muestra si hay datos (no mostrar sección vacía) */}
            {adventures.length > 0 && (
              <div className="packages-group packages-group--adventure pb-80">
                <h2 className="packages-group__title">
                  Paquetes de Aventura
                </h2>
                <p className="packages-group__subtitle pb-60">
                  Rutas llenas de adrenalina para los más aventureros
                </p>
                <div className="places-section__grid places-section__grid--seasonal">
                  {adventures.map((adventure, index) => (
                    <div key={adventure.link || index} className="places-section__item">
                      <div className="wow fadeInUp">
                        <SeasonPackageItem
                          variant="card"
                          title={adventure.title}
                          image={adventure.image}
                          link={adventure.link}
                          category={adventure.category}
                          dateFormatted={adventure.dateFormatted}
                          description={adventure.description}
                          duration={adventure.duration}
                          price={adventure.price}
                          badge={adventure.badge}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grupo 3: Todos los paquetes — título y subtítulo solo si hay otra sección arriba */}
            {displayPackages.length > 0 && (
              <div className="packages-group packages-group--all">
                {(seasons.length > 0 || adventures.length > 0) && (
                  <>
                    <h2 className="packages-group__title">
                      Todos los paquetes
                    </h2>
                    <p className="packages-group__subtitle pb-60">
                      Explora todas nuestras opciones disponibles
                    </p>
                  </>
                )}
                <FilteredCardsList
                  items={displayPackages.map((pkg, i) => ({
                    title: pkg.title,
                    key: String(pkg.slug || pkg.title || i),
                    content: (
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
                    ),
                  }))}
                  searchPlaceholder="Buscar paquete por nombre"
                  emptyMessage="No encontramos paquetes que coincidan con tu búsqueda."
                />
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
