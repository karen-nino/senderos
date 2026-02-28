import type { Metadata } from 'next'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InternationalItem from '@/components/InternationalItem'
import Link from 'next/link'
import { fetchInternationalPageData, STRAPI_REVALIDATE_SECONDS, type AdaptedDestination } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: 'Viajes internacionales - Senderos de Chiapas',
  description: 'Paquetes y destinos internacionales con Senderos de Chiapas. Experiencias de viaje fuera de México con la misma calidad y atención.',
}

export default async function InternationalPage() {
  let destinations: AdaptedDestination[] = []
  let imageBannerUrl: string | null = null

  try {
    const data = await fetchInternationalPageData()
    destinations = data.destinations
    imageBannerUrl = data.imageBannerUrl
  } catch (error) {
    console.error('Error fetching international from Strapi:', error)
  }

  const displayDestinations = destinations.filter(
    (d) => (d.badge || '') !== 'oculto'
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
                  <h1 className="page-title">Destinos Internacionales</h1>
                  <ul className="breadcrumb-link text-white d-flex justify-content-center flex-wrap list-unstyled mb-0">
                    <li><Link href="/">Home</Link></li>
                    <li className="active">Internacional</li>
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
                <div key={destination.slug || destination.title || index} className="places-section__item">
                  <div className="wow fadeInUp">
                    <InternationalItem
                      title={destination.title}
                      description={destination.subtitle ?? destination.description}
                      image={destination.image}
                      departureDate={destination.departureDate}
                      duration={destination.duration}
                      price={destination.price}
                      badge={destination.badge === 'oculto' ? undefined : destination.badge}
                      route={destination.route}
                      includes={destination.includes}
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
                  <i className="fas fa-globe-americas mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                  <span className="sub-title">Información no disponible</span>
                  <h2>Por el momento no hay información</h2>
                  <p className="mt-40">
                    Estamos trabajando para actualizar nuestros destinos internacionales. Si gustas conocer más sobre nuestros servicios y opciones disponibles, contáctanos y con gusto te atendemos.
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
