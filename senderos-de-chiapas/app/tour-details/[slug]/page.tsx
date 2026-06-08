import type { Metadata } from 'next'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import PlaceSlider from '@/components/PlaceSlider'
import GallerySlider from '@/components/GallerySlider'
import { JsonLd, buildProductJsonLd } from '@/components/JsonLd'
import { fetchTourBySlug, fetchTourPageData, STRAPI_REVALIDATE_SECONDS } from '@/lib/strapi'

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

const FALLBACK_DESTINATION = {
  title: 'Tour en Chiapas',
  description: '',
  subtitle: undefined as string | undefined,
  image: '/assets/images/place/single-place-1.jpg',
  imagesDetails: [] as string[],
  location: 'Chiapas, México',
  departure: undefined as string | undefined,
  arrival: undefined as Array<{ value: string; arrivalNationalPrice?: string; arrivalInternationalPrice?: string; arrivalHour?: string; arrivalAccommodation?: string }> | undefined,
  minimumParticipants: undefined as string | undefined,
  transport: undefined as string | undefined,
  departures: undefined as Array<{ departure?: string; transport?: string; minimumParticipants?: string; arrival?: Array<{ value: string; arrivalNationalPrice?: string; arrivalInternationalPrice?: string; arrivalHour?: string; arrivalAccommodation?: string }> }> | undefined,
  map: undefined as string | undefined,
  mapItem: undefined as Array<{ map?: string; title?: string }> | undefined,
  includes: undefined as string[] | undefined,
  route: undefined as string | undefined,
  routeList: undefined as string[] | undefined,
  itinerary: undefined as Array<{ dayTitle: string; time?: string; activity: string; routeItinerary?: string; accommodation?: string; note?: string }> | undefined,
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = STRAPI_REVALIDATE_SECONDS

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const destination = await fetchTourBySlug(slug)
  const title = destination?.title ?? 'Tour en Chiapas'
  const description =
    destination?.description?.replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `Tour ${title} en Chiapas. Reserva con Senderos de Chiapas.`
  const canonical = `${SITE_URL}/tour-detalles/${slug}`
  const image = destination?.imagesDetails?.[0] ?? destination?.image
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

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [strapiDestination, tourPageData] = await Promise.all([
    fetchTourBySlug(slug),
    fetchTourPageData(),
  ])
  const destination = strapiDestination ?? FALLBACK_DESTINATION

  // Hasta 4 tours aleatorios (distintos al actual) para "Otros lugares para visitar"
  const otherTours = tourPageData.destinations.filter((d) => {
    const itemSlug = d.slug ?? (d.link ? d.link.split('/').filter(Boolean).pop() ?? '' : '')
    return itemSlug && itemSlug !== slug
  })
  const shuffled = [...otherTours].sort(() => Math.random() - 0.5)
  const randomTours = shuffled.slice(0, 4)

  // Mensaje de WhatsApp con todos los detalles del tour
  const routeList = destination.routeList ?? (destination.route ? [destination.route] : [])
  const whatsappLines = [
    `Hola, me gustaría cotizar el siguiente tour:`,
    ``,
    ``,
    `*${destination.title}*`,
    ``,
    `*Detalles:*`,
    destination.location ? `• Ubicación: ${destination.location}` : null,
    destination.departure ? `• Punto de salida: ${destination.departure}` : null,
    destination.arrival && destination.arrival.length > 0
      ? destination.arrival.length === 1
        ? `• Punto de regreso: ${destination.arrival[0].value}${destination.arrival[0].arrivalNationalPrice ? `\n• Precio regreso: ${destination.arrival[0].arrivalNationalPrice}` : ''}`
        : destination.arrival.map((a, i) => `• Punto de regreso (Opc. ${i + 1}): ${a.value}${a.arrivalNationalPrice ? `\n• Precio regreso (Opc. ${i + 1}): ${a.arrivalNationalPrice}` : ''}`).join('\n')
      : null,
    destination.transport ? `• Transporte: ${destination.transport}` : null,
    routeList.length > 0 ? `• Ruta: ${routeList.join(' → ')}` : null,
    destination.itinerary && destination.itinerary.length > 0
      ? `\n📅 *Itinerario:*\n${destination.itinerary.map((item) => `• ${item.dayTitle}${item.time ? ` (${item.time})` : ''}: ${item.activity}`).join('\n')}`
      : null,
  ].filter(Boolean) as string[]
  const whatsappMessage = whatsappLines.join('\n')

  const tourJsonLd = buildProductJsonLd({
    name: destination.title,
    description: destination.description?.replace(/\s+/g, ' ').trim() || `Tour ${destination.title} en Chiapas.`,
    image: destination.imagesDetails?.length ? destination.imagesDetails : [destination.image],
    url: `${SITE_URL}/tour-detalles/${slug}`,
    providerName: 'Senderos de Chiapas',
  })

  return (
    <>
      <JsonLd data={tourJsonLd} />
      <Header />

      {/* ====== Start Place Details Section (tour-details.html) ====== */}
      <section className="place-details-section">
        {/* Place Slider - mosaico horizontal */}
        {(() => {
          const gallery = (() => {
            const raw = destination.imagesDetails?.filter(Boolean) ?? [];
            if (raw.length === 0) return [destination.image];
            const seen = new Set<string>();
            return raw.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));
          })();
          const images = (() => {
            const list = gallery.length > 0 ? gallery : [destination.image];
            return [0, 1, 2, 3].map((i) => list[i % list.length]);
          })();
          return <PlaceSlider images={images} alt={destination.title} />;
        })()}

        <div className="container">
          <div className="tour-details-wrapper pt-80">
            {/* Tour Title Wrapper */}
            <div className="tour-title-wrapper pb-30 wow fadeInUp">
              <div className="row">
                <div className="col-xl-6">
                  <div className="tour-title mb-10">
                    <h1 className="title">{destination.title}</h1>
                    {destination.subtitle ? (
                      <p className="text-muted mb-0 mt-2">{destination.subtitle}</p>
                    ) : null}
                  </div>
                </div>
                <div className="col-xl-6 d-none d-xl-block">
                  <div className="tour-widget-info">
                    {/* <div className="info-box mb-20">
                      <div className="submit-button">
                        <button type="submit" className="main-btn primary-btn">Reservar<WhatsAppIcon className="whatsapp-icon" /></button>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Info + Calendar - Visible only on mobile/tablet, right after Tour Title (misma info que desktop) */}
            <div className="sidebar-widget-area d-block d-xl-none pb-30">
              {(destination.departures && destination.departures.length > 0
                ? destination.departures
                : [{ departure: destination.departure, transport: destination.transport, minimumParticipants: destination.minimumParticipants, arrival: destination.arrival }]
              ).map((dep, depIdx) => (
                <div key={`departure-mobile-${depIdx}`} className="sidebar-widget booking-info-widget wow fadeInUp mb-40">
                  <div className="pb-2 border-bottom">
                    <h4 className="">Detalles del Tour</h4>
                    <h5 className="fw-light">Salida {dep.departure}</h5>
                  </div>
                  <ul className="info-list pt-3">
                    {dep.minimumParticipants && <li><span><i className="fal fa-users"></i>Mínimo de participantes<span style={{ float: 'none' }}>{dep.minimumParticipants}</span></span></li>}
                    {dep.transport && <li><span><i className="fal fa-bus"></i>Transporte<span style={{ float: 'none' }}>{dep.transport}</span></span></li>}
                    {dep.departure && <li><span><i className="far fa-map-marker-alt"></i>Salida desde<span style={{ float: 'none', display: 'block' }}>{dep.departure}</span></span></li>}
                    {dep.arrival && dep.arrival.length > 0 && (
                      dep.arrival.length === 1 ? (
                        <React.Fragment>
                          <li><span><i className="far fa-map-marker-alt"></i>Regreso hacia<span style={{ float: 'none', display: 'block'}}>{dep.arrival[0].value}</span><span style={{ float: 'none', display: 'block' }}>{dep.arrival[0].arrivalHour}</span></span></li>
                          {dep.arrival[0].arrivalNationalPrice && (
                            <li><span><i className="fal fa-box-usd"></i>Precio Nacional desde<span style={{ float: 'none' }}>{dep.arrival[0].arrivalNationalPrice}</span></span></li>
                          )}
                          {dep.arrival[0].arrivalInternationalPrice && (
                            <li><span><i className="fal fa-box-usd"></i>Precio Internacional desde<span style={{ float: 'none' }}>{dep.arrival[0].arrivalInternationalPrice}</span></span></li>
                          )}
                        </React.Fragment>
                      ) : (
                        dep.arrival.map((a, i) => (
                          <React.Fragment key={`arrival-${depIdx}-${i}`}>
                            <li><span><i className="far fa-map-marker-alt pb-3"></i>{`Regreso hacia`}<span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.value}</span><span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.arrivalHour}</span><span className='pt-3' style={{ float: 'none', display: 'block'}}>Alojamiento</span><span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.arrivalAccommodation}</span><span className='pt-3' style={{ float: 'none', display: 'block'}}>Precio Nacional desde</span><span style={{ float: 'none', display: 'block', fontSize: '22px' }}>{a.arrivalNationalPrice}</span><span className='pt-3' style={{ float: 'none', display: 'block'}}>Precio Internacional desde</span><span style={{ float: 'none', display: 'block', fontSize: '22px' }}>{a.arrivalInternationalPrice}</span></span></li>
                          </React.Fragment>
                        ))
                      )
                    )}
                    <li className="tour-details-wa-cta-mobile">
                      <div className="submit-button">
                        <a
                          href={`https://wa.me/529613629724?text=${encodeURIComponent(whatsappMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="main-btn primary-btn"
                        >
                          Consulta disponibilidad<WhatsAppIcon className="whatsapp-icon" />
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              ))}
            </div>

            <div className="row">
              <div className="col-xl-8">
                {/* Galería */}
                {(() => {
                  const raw = destination.imagesDetails?.filter(Boolean) ?? []
                  const seen = new Set<string>()
                  const galleryImages = raw.length > 0
                    ? raw.filter((u) => (seen.has(u) ? false : (seen.add(u), true)))
                    : [destination.image]
                  if (galleryImages.length === 0) return null
                  return (
                    <div className="package-description pt-45 wow fadeInUp mb-40">
                      <h3 className="title">Galería</h3>
                      <GallerySlider images={galleryImages} embed />
                    </div>
                  )
                })()}
                {/* Descripción + Ruta: mismo patrón que package-details */}
                {destination.description?.trim() && (
                  <div className="package-description pt-45 wow fadeInUp mb-40">
                    <h3 className="title">Descripción</h3>
                    <div className="tour-description-text" style={{ lineHeight: 1.85 }}>
                      {destination.description.split(/\n\n+/).map((para, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-3' : ''} style={{ lineHeight: 'inherit' }}>
                          {para.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {routeList.length > 0 && (
                  <div className="package-route pt-45 wow fadeInUp mb-40">
                    <h4 className="title">Ruta</h4>
                    <p>Lugares que recorre este tour:</p>
                    <div className="row align-items-lg-center">
                      <div className="col-lg-12">
                        <ul className="check-list">
                          {routeList.map((item: string, i: number) => (
                            <li key={i}><i className="fas fa-route"></i>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className={`${(destination.description?.trim() || routeList.length > 0) ? 'package-includes' : 'place-content-wrap'} pt-45 wow fadeInUp mb-80`}
                >
                  <h4 className="title">Incluye</h4>
                  <p>Este tour incluye los siguientes servicios:</p>
                  <div className="row align-items-lg-center">
                    <div className="col-lg-12">
                      <ul className="check-list">
                        {destination.includes && destination.includes.length > 0
                          ? destination.includes.map((item: string, i: number) => (
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

                {/* Days Area - Itinerario desde Strapi (solo se muestra si hay datos) */}
                {destination.itinerary && destination.itinerary.length > 0 && (
                  <div className="days-area mb-140 wow fadeInUp">
                    <h4 className="title">Itinerario</h4>
                    <p className="pb-4">Cronograma de actividades del tour:</p>
                    {(() => {
                      const items = destination.itinerary!;
                      const daysMap = new Map<string, typeof items>();
                      const dayOrder: string[] = [];
                      for (const item of items) {
                        const day = (item.dayTitle || "Día").trim() || "Día";
                        if (!daysMap.has(day)) {
                          daysMap.set(day, []);
                          dayOrder.push(day);
                        }
                        daysMap.get(day)!.push(item);
                      }
                      const dayIds = dayOrder.map((_, i) => `itinerary-day-${i}`);
                      return (
                        <>
                          {dayOrder.length > 1 && (
                            <ul className="nav nav-tabs mb-35 flex-wrap" role="tablist">
                              {dayOrder.map((day, i) => (
                                <li key={dayIds[i]} className="nav-item" role="presentation">
                                  <button
                                    className={`nav-link ${i === 0 ? "active" : ""}`}
                                    id={`${dayIds[i]}-tab`}
                                    data-bs-toggle="tab"
                                    data-bs-target={`#${dayIds[i]}`}
                                    type="button"
                                    role="tab"
                                    aria-controls={dayIds[i]}
                                    aria-selected={i === 0}
                                  >
                                    {day}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="tab-content">
                            {dayOrder.map((day, i) => (
                              <div
                                key={dayIds[i]}
                                className={`tab-pane fade ${i === 0 ? "show active" : ""}`}
                                id={dayIds[i]}
                                role="tabpanel"
                                aria-labelledby={`${dayIds[i]}-tab`}
                              >
                                <div className="content-box">
                                  <ul className="check-list pb-4">
                                    {daysMap.get(day)!.map(
                                      (
                                        item: {
                                          dayTitle: string;
                                          time?: string;
                                          activity: string;
                                          description?: string;
                                          routeItinerary?: string;
                                          accommodation?: string;
                                          note?: string;
                                        },
                                        j: number,
                                      ) => (
                                        <React.Fragment key={`${dayIds[i]}-act-${j}`}>
                                          <li>
                                            <i className="fas fa-clock"></i>
                                            {item.time ? `${item.time} - ` : ""}
                                            {item.activity}
                                          </li>
                                          {item.description ? (
                                            <li className="ps-4 text-muted" style={{ listStyle: 'none' }}>
                                              {item.description}
                                            </li>
                                          ) : null}
                                          {item.routeItinerary ? (
                                            <li>
                                              <i className="fas fa-route"></i> {item.routeItinerary}
                                            </li>
                                          ) : null}
                                          {item.accommodation ? (
                                            <li>
                                              <i className="fas fa-bed"></i> {item.accommodation}
                                            </li>
                                          ) : null}
                                        </React.Fragment>
                                      ),
                                    )}
                                  </ul>
                                  {daysMap.get(day)![0]?.note ? (
                                    <p className="mt-3 mb-0 text-muted fst-italic" style={{ paddingLeft: '2rem' }}>
                                      <i className="fas fa-info-circle me-2"></i>{daysMap.get(day)![0].note}
                                    </p>
                                  ) : null}
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
                {destination.mapItem?.length ? (
                  <>
                    <div className="tour-details-map-section">
                      {destination.mapItem
                        .map((item) => ({
                          src: getMapUrl(item.map, destination.location),
                          title: item.title?.trim() || "Ubicación",
                        }))
                        .filter((e) => e.src)
                        .map((entry, i) => (
                          <div
                            key={i}
                            className="map-box mb-0 tour-details-map-box wow fadeInUp"
                          >
                            <h4 className="title pb-4">{entry.title}</h4>
                            <iframe
                              src={entry.src}
                              title={`Mapa - ${entry.title}`}
                            />
                          </div>
                        ))}
                    </div>
                    {/* Altura fija: el margen bajo el último mapa se ve (evita colapso de márgenes) */}
                    <div className="tour-details-map-bottom-space" aria-hidden />
                  </>
                ) : null}
              </div>

              {/* Sidebar */}
              <div className="col-xl-4">
                <div className="sidebar-widget-area pt-60 pl-lg-30">
                  {/* Booking Info Widget - Visible only on desktop (xl) */}
                  <div className="d-none d-xl-block">
                    {(destination.departures && destination.departures.length > 0
                      ? destination.departures
                      : [{ departure: destination.departure, transport: destination.transport, minimumParticipants: destination.minimumParticipants, arrival: destination.arrival }]
                    ).map((dep, depIdx) => (
                      <div key={`departure-desktop-${depIdx}`} className="sidebar-widget booking-info-widget wow fadeInUp mb-100">
                        <div className="pb-2 border-bottom">
                          <h4 className="">Detalles del Tour</h4>
                          <h5 className="fw-light">Salida {dep.departure}</h5>
                        </div>
                        <ul className="info-list pt-3">
                          {dep.minimumParticipants && <li><span><i className="fal fa-users"></i>Mínimo de participantes<span style={{ float: 'none' }}>{dep.minimumParticipants}</span></span></li>}
                          {dep.transport && <li><span><i className="fal fa-bus"></i>Transporte<span style={{ float: 'none' }}>{dep.transport}</span></span></li>}
                          {dep.departure && <li><span><i className="far fa-map-marker-alt"></i>Salida desde<span style={{ float: 'none', display: 'block' }}>{dep.departure}</span></span></li>}
                          {dep.arrival && dep.arrival.length > 0 && (
                            dep.arrival.length === 1 ? (
                              <React.Fragment>
                                <li><span><i className="far fa-map-marker-alt"></i>Regreso hacia<span style={{ float: 'none', display: 'block'}}>{dep.arrival[0].value}</span><span style={{ float: 'none', display: 'block' }}>{dep.arrival[0].arrivalHour}</span></span></li>
                                {dep.arrival[0].arrivalNationalPrice && (
                                  <li><span><i className="fal fa-box-usd"></i>Precio Nacional desde<span style={{ float: 'none' }}>{dep.arrival[0].arrivalNationalPrice}</span></span></li>
                                )}
                                {dep.arrival[0].arrivalInternationalPrice && (
                                  <li><span><i className="fal fa-box-usd"></i>Precio Internacional desde<span style={{ float: 'none' }}>{dep.arrival[0].arrivalInternationalPrice}</span></span></li>
                                )}
                              </React.Fragment>
                            ) : (
                              dep.arrival.map((a, i) => (
                                <React.Fragment key={`arrival-${depIdx}-${i}`}>
                                  <li><span><i className="far fa-map-marker-alt pb-3"></i>{`Regreso hacia`}<span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.value}</span><span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.arrivalHour}</span><span className='pt-3' style={{ float: 'none', display: 'block'}}>Alojamiento</span><span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.arrivalAccommodation}</span><span className='pt-3' style={{ float: 'none', display: 'block'}}>Precio Nacional desde</span><span style={{ float: 'none', display: 'block', fontSize: '22px' }}>{a.arrivalNationalPrice}</span><span className='pt-3' style={{ float: 'none', display: 'block'}}>Precio Internacional desde</span><span style={{ float: 'none', display: 'block', fontSize: '22px' }}>{a.arrivalInternationalPrice}</span></span></li>
                                </React.Fragment>
                              ))
                            )
                          )}
                          <li>
                            <div className="submit-button">
                              <a
                                href={`https://wa.me/529612980999?text=${encodeURIComponent(whatsappMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="main-btn primary-btn"
                              >
                                Consulta disponibilidad<WhatsAppIcon className="whatsapp-icon" />
                              </a>
                            </div>
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                  {/* Recent Place Widget - hasta 4 tours aleatorios (TourItem) */}
                  <div className="sidebar-widget recent-place-widget mb-160 wow fadeInUp">
                    <h4 className="widget-title">Más Experiencias</h4>
                    <ul className="recent-place-list">
                      {randomTours.length > 0 ? (
                        randomTours.map((tour, i) => (
                          <li key={tour.slug ?? `${tour.title}-${i}`} className="place-thumbnail-content">
                            <img src={tour.image} alt={tour.title} width={100} height={74} />
                            <div className="place-content">
                              <h5><Link href={tour.slug ? `/tour-detalles/${tour.slug}` : (tour.link || '/tour-detalles/chiapas')} className="recent-place-title-link">{tour.title}</Link></h5>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="place-thumbnail-content">
                          <img src="/assets/images/place/thumb-1.jpg" alt="post thumb" width={100} height={74} />
                          <div className="place-content">
                            <h5><Link href="/tour-detalles/chiapas" className="recent-place-title-link">Tour en Chiapas</Link></h5>
                          </div>
                        </li>
                      )}
                    </ul>
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
