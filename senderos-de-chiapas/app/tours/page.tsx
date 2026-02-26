import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TourItem from '@/components/TourItem'
import Link from 'next/link'
import { fetchTourPageData, STRAPI_REVALIDATE_SECONDS, getTourDetailHref, type AdaptedDestination } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export default async function ToursPage() {
  let destinations: AdaptedDestination[] = []
  let imageBannerUrl: string | null = null

  try {
    const data = await fetchTourPageData()
    destinations = data.destinations
    imageBannerUrl = data.imageBannerUrl
  } catch (error) {
    console.error('Error fetching tours from Strapi:', error)
  }

  const displayDestinations = destinations.filter(
    (d) => (d.badge || '').toLowerCase() !== 'hide'
  )
  const hasDataFromStrapi = displayDestinations.length > 0
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
                  <h1 className="page-title">Explorar Tours</h1>
                  <ul className="breadcrumb-link text-white d-flex justify-content-center flex-wrap list-unstyled mb-0">
                    <li><Link href="/">Home</Link></li>
                    <li className="active">Tours</li>
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
            <div className="places-section__grid">
              {displayDestinations.map((destination, index) => (
                <div key={destination.link || destination.title || index} className="places-section__item">
                  <div className="wow fadeInUp">
                    <TourItem
                      title={destination.title}
                      description={destination.description}
                      image={destination.image}
                      link={getTourDetailHref(destination)}
                      departureDate={destination.departureDate}
                      duration={destination.duration}
                      price={destination.price}
                      badge={destination.badge}
                    />
                  </div>
                </div>
              ))}
            </div>
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
                  <i className="fas fa-map-marked-alt mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                  <span className="sub-title">Información no disponible</span>
                  <h2>Por el momento no hay rutas disponibles</h2>
                  <p className="mt-40">
                    Estamos trabajando para actualizar nuestros tours. Si gustas conocer más sobre nuestros servicios y opciones disponibles, contáctanos y con gusto te atendemos.
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
