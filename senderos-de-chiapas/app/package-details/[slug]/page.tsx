import type { Metadata } from 'next'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import PlaceSlider from '@/components/PlaceSlider'
import { JsonLd, buildProductJsonLd } from '@/components/JsonLd'
import { fetchPackageBySlug, fetchHolidayBySlug, fetchPackages, STRAPI_REVALIDATE_SECONDS } from '@/lib/strapi'

const SITE_URL = 'https://senderosdechiapas.com.mx'

/** Extrae la URL del src de un iframe o devuelve la URL apropiada para el mapa */
function getMapUrl(
  map: string | undefined | Record<string, unknown>,
  location: string,
): string {
  const mapStr =
    typeof map === 'string'
      ? map
      : map && typeof map === 'object' && typeof (map as { map?: string }).map === 'string'
        ? (map as { map: string }).map
        : undefined;
  if (!mapStr) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }
  const srcMatch = mapStr.match(/src=["']([^"']+)["']/);
  if (srcMatch) return srcMatch[1];
  if (mapStr.startsWith('http')) return mapStr;
  return `https://maps.google.com/maps?q=${encodeURIComponent(mapStr)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
}

const FALLBACK = {
  title: 'Ruta',
  description: '',
  image: '/assets/images/place/single-place-1.jpg',
  imagesDetails: [] as string[],
  price: '$$$',
  duration: 'Consultar',
  route: undefined as string | undefined,
  routeList: undefined as string[] | undefined,
  includes: undefined as string[] | undefined,
  itinerary: undefined as Array<{ dayTitle: string; time?: string; activity: string; routeItinerary?: string; accommodation?: string }> | undefined,
  calendarStart: undefined as string | undefined,
  calendarEnd: undefined as string | undefined,
  mapItem: undefined as Array<{ map?: string; title?: string }> | undefined,
  accommodation: undefined as string | undefined,
  departure: undefined as string | undefined,
  transport: undefined as string | undefined,
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = STRAPI_REVALIDATE_SECONDS

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [packageData, holidayData] = await Promise.all([
    fetchPackageBySlug(slug),
    fetchHolidayBySlug(slug),
  ])
  const pkg = packageData ?? holidayData
  const title = pkg?.title ?? 'Paquete'
  const description =
    pkg?.description?.replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `Paquete ${title} en Chiapas. Precio: ${pkg?.price ?? 'Consultar'}. Reserva con Senderos de Chiapas.`
  const canonical = `${SITE_URL}/paquete-detalles/${slug}`
  const image = pkg?.imagesDetails?.[0] ?? pkg?.image
  const ogImage = image ? (image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`) : undefined
  return {
    title: `${title} - Senderos de Chiapas`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} - Senderos de Chiapas`,
      description,
      url: canonical,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Senderos de Chiapas`,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function PaqueteDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [packageData, holidayData, allPackages] = await Promise.all([
    fetchPackageBySlug(slug),
    fetchHolidayBySlug(slug),
    fetchPackages(),
  ])
  // Mostrar paquete normal o paquete de temporada (Holiday) según el slug
  const pkg = packageData ?? holidayData ?? FALLBACK
  const locationLabel = pkg.route ?? pkg.title ?? 'Chiapas, México'

  // Hasta 3 paquetes aleatorios (distintos al actual) para "Más paquetes"
  const otherPackages = allPackages.filter((p) => p.slug && p.slug !== slug)
  const shuffled = [...otherPackages].sort(() => Math.random() - 0.5)
  const otherPackagesList = shuffled.slice(0, 3)
  // Cada viñeta de route en Strapi = una línea; si no hay routeList, fallback por comas o un solo ítem
  const fallbackRouteItems = (pkg.route ?? locationLabel).split(',').map((s) => s.trim()).filter(Boolean)
  const displayRouteItems =
    pkg.routeList && pkg.routeList.length > 0
      ? pkg.routeList
      : fallbackRouteItems.length > 0
        ? fallbackRouteItems
        : [locationLabel]

  // Para el slider: igual que tour-details, usar imagesDetails y fallback a image
  const defaultImage = FALLBACK.image
  const img1 = pkg.imagesDetails?.[0] ?? pkg.image ?? defaultImage
  const img2 = pkg.imagesDetails?.[1] ?? pkg.image ?? defaultImage
  const images = [img1, img2, img1, img2]

  // Mensaje de WhatsApp con todos los detalles del paquete
  const whatsappLines = [
    `Hola, me gustaría cotizar el siguiente paquete:`,
    ``,
    ``,
    `*${pkg.title}*`,
    ``,
    `*Detalles:*`,
    `• Precio: ${pkg.price}`,
    `• Duración: ${pkg.duration || 'Variable'}`,
    pkg.accommodation ? `• Alojamiento: ${pkg.accommodation}` : null,
    pkg.departure ? `• Salida: ${pkg.departure}` : null,
    pkg.transport ? `• Transporte: ${pkg.transport}` : null,
    displayRouteItems.length > 0 ? `• Ruta: ${displayRouteItems.join(' → ')}` : null,
    pkg.itinerary && pkg.itinerary.length > 0
      ? `\n📅 *Itinerario:*\n${pkg.itinerary.map((item) => `• ${item.dayTitle}${item.time ? ` (${item.time})` : ''}: ${item.activity}`).join('\n')}`
      : null,
  ].filter(Boolean) as string[]
  const whatsappMessage = whatsappLines.join('\n')

  const packageJsonLd = buildProductJsonLd({
    name: pkg.title,
    description: (pkg.description ?? '').toString().replace(/\s+/g, ' ').trim() || `Paquete ${pkg.title} en Chiapas. ${pkg.price}.`,
    image: pkg.imagesDetails?.length ? pkg.imagesDetails : [pkg.image],
    url: `${SITE_URL}/paquete-detalles/${slug}`,
    price: pkg.price,
    duration: pkg.duration,
    providerName: 'Senderos de Chiapas',
  })

  return (
    <>
      <JsonLd data={packageJsonLd} />
      <Header />

      {/* ====== Start Place Details Section (basado en destination-details) ====== */}
      <section className="place-details-section">
        {/* Place Slider - mosaico horizontal */}
        {(() => {
          const gallery = (() => {
            const raw = (pkg.imagesDetails?.filter(Boolean) ?? []) as string[]
            const base = (pkg.image ? [pkg.image] : []) as string[]
            const list = raw.length > 0 ? raw : base.length > 0 ? base : [FALLBACK.image]
            const seen = new Set<string>()
            return list.filter((u) => (seen.has(u) ? false : (seen.add(u), true)))
          })()
          const images = (() => {
            const list = gallery.length > 0 ? gallery : [FALLBACK.image]
            return [0, 1, 2, 3].map((i) => list[i % list.length])
          })()

          return <PlaceSlider images={images} alt={pkg.title} />
        })()}

        <div className="container">
          <div className="tour-details-wrapper pt-80">
            {/* Tour Title Wrapper */}
            <div className="tour-title-wrapper pb-30 wow fadeInUp">
              <div className="row">
                <div className="col-xl-6">
                  <div className="tour-title mb-20">
                    <span className="tour-label">PAQUETE</span>
                    <h1 className="title">{pkg.title}</h1>
                  </div>
                </div>
                <div className="col-xl-6 d-none d-xl-block">
                  <div className="tour-widget-info">
                    <div className="info-box mb-20">
                      <div className="icon"><i className="fal fa-box-usd"></i></div>
                      <div className="info"><h4><span>Desde</span>{pkg.price}</h4></div>
                    </div>
                    <div className="info-box mb-20">
                      <div className="icon"><i className="fal fa-clock"></i></div>
                      <div className="info"><h4><span>Duración</span>{pkg.duration || 'Variable'}</h4></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Info + Calendar - Visible only on mobile/tablet */}
            <div className="sidebar-widget-area d-block d-xl-none pb-30">
              <div className="sidebar-widget booking-info-widget wow fadeInUp mb-40">
                <h4 className="widget-title">Detalles del paquete</h4>
                <ul className="info-list info-list--stack">
                  <li><span><i className="fal fa-box-usd"></i>Precio<span>{pkg.price}</span></span></li>
                  <li><span><i className="fal fa-clock"></i>Duración<span>{pkg.duration || 'Variable'}</span></span></li>
                  {pkg.accommodation && <li><span><i className="far fa-bed"></i>Alojamiento<span>{pkg.accommodation}</span></span></li>}
                  {pkg.departure && <li><span><i className="far fa-map-marker-alt"></i>Salida<span>{pkg.departure}</span></span></li>}
                  {pkg.transport && <li><span><i className="fal fa-bus"></i>Transporte<span>{pkg.transport}</span></span></li>}
                  <li>
                    <div className="submit-button">
                      <a
                        href={`https://wa.me/529613629724?text=${encodeURIComponent(whatsappMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="main-btn primary-btn"
                      >
                        Cotizar por WhatsApp<WhatsAppIcon className="whatsapp-icon" />
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
              {(pkg.calendarStart || pkg.calendarEnd) && (
                <div className="calendar-wrapper wow fadeInUp mb-40">
                  <div
                    className="calendar-container"
                    data-calendar-date={pkg.calendarStart ?? ''}
                    data-calendar-end={pkg.calendarEnd ?? ''}
                  />
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-xl-8">

                {/* Bloque: descripción del paquete y lista de lugares de la ruta */}
                <div className="package-description-route pt-45 wow fadeInUp mb-100">
                  {pkg.description && (
                    <>
                      <h3 className="title">Descripción</h3>
                      <p>{pkg.description}</p>
                    </>
                  )}
                  <h4 className="title">Ruta</h4>
                  <p>Lugares que recorre este paquete:</p>
                  <div className="row align-items-lg-center">
                    <div className="col-lg-12">
                      <ul className="check-list">
                        {displayRouteItems.map((item: string, i: number) => (
                          <li key={i}><i className="fas fa-badge-check"></i>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bloque: servicios incluidos en el paquete */}
                <div className="package-includes pt-45 wow fadeInUp mb-100">
                  <h4>Incluye</h4>
                  <p>Este paquete incluye los siguientes servicios:</p>
                  <div className="row align-items-lg-center">
                    <div className="col-lg-12">
                      <ul className="check-list">
                        {pkg.includes && pkg.includes.length > 0
                          ? pkg.includes.map((item: string, i: number) => (
                            <li key={i}><i className="fas fa-badge-check"></i>{item}</li>
                          ))
                          : (
                            <>
                              <li><i className="fas fa-badge-check"></i>Incluye</li>
                            </>
                          )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Days Area - Itinerario (solo se muestra si hay datos) */}
                {pkg.itinerary && pkg.itinerary.length > 0 && (
                  <div className="days-area mb-100 wow fadeInUp">
                    <h4 className="title">Itinerario</h4>
                    <p className="pb-4">Cronograma de actividades del paquete:</p>
                    {(() => {
                      const daysMap = new Map<string, typeof pkg.itinerary>();
                      for (const item of pkg.itinerary!) {
                        const day = item.dayTitle || 'Día';
                        if (!daysMap.has(day)) daysMap.set(day, []);
                        daysMap.get(day)!.push(item);
                      }
                      const days = Array.from(daysMap.keys());
                      const dayIds = days.map((d, i) => `day${i + 1}`);
                      return (
                        <>
                          <ul className="nav nav-tabs mb-35">
                            {days.map((day, i) => (
                              <li key={day} className="nav-item">
                                <button
                                  className={`nav-link ${i === 0 ? 'active' : ''}`}
                                  data-bs-toggle="tab"
                                  data-bs-target={`#${dayIds[i]}`}
                                  type="button"
                                >
                                  {day}
                                </button>
                              </li>
                            ))}
                          </ul>
                          <div className="tab-content">
                            {days.map((day, i) => (
                              <div
                                key={day}
                                className={`tab-pane fade ${i === 0 ? 'show active' : ''}`}
                                id={dayIds[i]}
                              >
                                <div className="content-box">
                                  <ul className="check-list">
                                    {daysMap.get(day)!.map((item: { dayTitle: string; time?: string; activity: string; routeItinerary?: string; accommodation?: string }, j: number) => (
                                      <React.Fragment key={j}>
                                        <li>
                                          <i className="fas fa-clock"></i>
                                          {item.time ? `${item.time} - ` : ''}
                                          {item.activity}
                                        </li>
                                        {item.routeItinerary && (
                                          <li><i className="fas fa-route"></i> {item.routeItinerary}</li>
                                        )}
                                        {item.accommodation && (
                                          <li><i className="fas fa-bed"></i> {item.accommodation}</li>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Map Box(es) - solo se muestra si hay mapItem en Strapi */}
                {pkg.mapItem?.length
                  ? pkg.mapItem
                    .map((item) => ({
                      src: getMapUrl(item.map, locationLabel),
                      title: item.title?.trim() || 'Ubicación',
                    }))
                    .filter((e) => e.src)
                    .map((entry, i) => (
                      <div
                        key={i}
                        className="map-box mb-100 wow fadeInUp"
                      >
                        <h4 className="title pb-4">{entry.title}</h4>
                        <iframe
                          src={entry.src}
                          title={`Mapa - ${entry.title}`}
                        />
                      </div>
                    ))
                  : null}
              </div>

              {/* Sidebar */}
              <div className="col-xl-4">
                <div className="sidebar-widget-area pt-60 pl-lg-30">
                  {/* Booking Info Widget - Visible only on desktop (xl) */}
                  <div className="d-none d-xl-block">
                    <div className="sidebar-widget booking-info-widget wow fadeInUp mb-100">
                      <h4 className="widget-title">Detalles del paquete</h4>
                      <ul className="info-list">
                        <li><span><i className="fal fa-box-usd"></i>Precio<span>{pkg.price}</span></span></li>
                        <li><span><i className="fal fa-clock"></i>Duración<span>{pkg.duration || 'Variable'}</span></span></li>
                        {pkg.accommodation && <li><span><i className="far fa-bed"></i>Alojamiento<span>{pkg.accommodation}</span></span></li>}
                        {pkg.departure && <li><span><i className="far fa-map-marker-alt"></i>Salida<span>{pkg.departure}</span></span></li>}
                        {pkg.transport && <li><span><i className="fal fa-bus"></i>Transporte<span>{pkg.transport}</span></span></li>}
                        <li>
                          <div className="submit-button">
                            <a
                              href={`https://wa.me/529613629724?text=${encodeURIComponent(whatsappMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="main-btn primary-btn"
                            >
                              Cotizar por WhatsApp<WhatsAppIcon className="whatsapp-icon" />
                            </a>
                          </div>
                        </li>
                      </ul>
                    </div>
                    {(pkg.calendarStart || pkg.calendarEnd) && (
                      <div className="calendar-wrapper wow fadeInUp mb-100">
                        <div
                          className="calendar-container"
                          data-calendar-date={pkg.calendarStart ?? ''}
                          data-calendar-end={pkg.calendarEnd ?? ''}
                        />
                      </div>
                    )}
                  </div>
                  {/* Recent Place Widget - hasta 3 paquetes aleatorios */}
                  <div className="sidebar-widget recent-place-widget mb-160 wow fadeInUp">
                    <h4 className="widget-title">Más paquetes</h4>
                    <ul className="recent-place-list">
                      {otherPackagesList.length > 0 &&
                        otherPackagesList.map((p, i) => (
                          <li key={p.slug ?? `${p.title}-${i}`} className="place-thumbnail-content">
                            <img src={p.image && !p.image.includes('las-tres-tzimoleras') ? p.image : FALLBACK.image} alt={p.title} />
                            <div className="place-content">
                              <h5>
                                <Link href={p.slug ? `/paquete-detalles/${p.slug}` : (p.link || '/paquetes')} className="recent-place-title-link">{p.title}</Link>
                              </h5>
                              {(p.duration || p.price) && (
                                <ul className="place-meta recent-place-meta list-unstyled mt-1 mb-0 small">
                                  {p.duration && <li><i className="fal fa-clock me-1"></i>{p.duration}</li>}
                                  {p.price && <li><i className="fal fa-box-usd me-1"></i>{p.price}</li>}
                                </ul>
                              )}
                            </div>
                          </li>
                        ))
                      }
                    </ul>
                    <div className="place-content">
                      <h5><Link href="/paquetes" className="recent-place-title-link">Ver todos los paquetes</Link></h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
