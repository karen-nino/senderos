import type { Metadata } from 'next'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CardsExplorer, { type CardsGroup } from '@/components/CardsExplorer'
import PageIntro from '@/components/PageIntro'
import Link from 'next/link'
import { fetchTourPageData, STRAPI_REVALIDATE_SECONDS, getTourDetailHref, tourCardSubtitle, type AdaptedDestination } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: 'Tours en Chiapas - Rutas y experiencias',
  description: 'Explora nuestros tours y rutas en Chiapas: cascadas, zonas arqueológicas, ecoturismo y más. Precios, duración e itinerarios para planear tu viaje.',
}

export default async function ToursPage() {
  let destinations: AdaptedDestination[] = []

  try {
    const data = await fetchTourPageData()
    destinations = data.destinations
  } catch (error) {
    console.error('Error fetching tours from Strapi:', error)
  }

  const displayDestinations = destinations.filter(
    (d) => (d.badge || '') !== 'oculto'
  )
  const hasDataFromStrapi = displayDestinations.length > 0

  // Una categoría por punto de salida, en el orden en que llegan de Strapi
  const departureGroups: CardsGroup[] = []
  displayDestinations.forEach((d, i) => {
    const departure = d.departure?.trim()
    const id = departure ? `salida-${departure}` : 'salida-otros'
    let group = departureGroups.find((g) => g.id === id)
    if (!group) {
      group = {
        id,
        tone: 'salida',
        icon: 'far fa-map-marker-alt',
        label: departure || 'Otros',
        title: departure ? `Saliendo de ${departure}` : 'Otros tours',
        items: [],
      }
      departureGroups.push(group)
    }
    group.items.push({
      key: String(d.link || d.title || i),
      href: getTourDetailHref(d),
      tag: 'Tour',
      noPriceText: 'Más información',
      title: d.title,
      image: d.image,
      badge: d.badge,
      description: tourCardSubtitle(d),
      departureDate: d.departureDate,
      duration: d.duration,
      price: d.price,
    })
  })

  return (
    <React.Fragment>
      <Header />
      <main>


        {hasDataFromStrapi ? (
          <section className="listing-page pb-160">
            <PageIntro
              title="Tours"
              intro="Elige el punto de salida que te quede mejor y descubre cascadas, zonas arqueológicas, pueblos y selva de Chiapas."
            />
            <div className="container">
              <CardsExplorer
                noun="tours"
                searchPlaceholder="Buscar por nombre o lugar"
                filterLabel="Filtrar por punto de salida"
                groups={departureGroups}
              />
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

      </main>
      <Footer />
    </React.Fragment>
  )
}
