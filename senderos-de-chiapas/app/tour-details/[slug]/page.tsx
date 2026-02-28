import type { Metadata } from 'next'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
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
  image: '/assets/images/place/single-place-1.jpg',
  imagesDetails: [] as string[],
  location: 'Chiapas, México',
  price: 'Consultar',
  duration: 'Consultar',
  accommodation: undefined as string | undefined,
  departureDate: undefined as string | undefined,
  map: undefined as string | undefined,
  mapItem: undefined as Array<{ map?: string; title?: string }> | undefined,
  includes: undefined as string[] | undefined,
  route: undefined as string | undefined,
  routeList: undefined as string[] | undefined,
  itinerary: undefined as Array<{ dayTitle: string; time?: string; activity: string; routeItinerary?: string; accommodation?: string }> | undefined,
  calendarStart: undefined as string | undefined,
  calendarEnd: undefined as string | undefined,
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
    `Tour ${title} en Chiapas. Precio: ${destination?.price ?? 'Consultar'}. Duración: ${destination?.duration ?? 'Consultar'}. Reserva con Senderos de Chiapas.`
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
    `• Precio: ${destination.price}`,
    `• Duración: ${destination.duration}`,
    destination.location ? `• Ubicación: ${destination.location}` : null,
    destination.accommodation ? `• Alojamiento: ${destination.accommodation}` : null,
    destination.departureDate ? `• Salida: ${destination.departureDate}` : null,
    routeList.length > 0 ? `• Ruta: ${routeList.join(' → ')}` : null,
    destination.itinerary && destination.itinerary.length > 0
      ? `\n📅 *Itinerario:*\n${destination.itinerary.map((item) => `• ${item.dayTitle}${item.time ? ` (${item.time})` : ''}: ${item.activity}`).join('\n')}`
      : null,
  ].filter(Boolean) as string[]
  const whatsappMessage = whatsappLines.join('\n')

  const tourJsonLd = buildProductJsonLd({
    name: destination.title,
    description: destination.description?.replace(/\s+/g, ' ').trim() || `Tour ${destination.title} en Chiapas. ${destination.price}. ${destination.duration}.`,
    image: destination.imagesDetails?.length ? destination.imagesDetails : [destination.image],
    url: `${SITE_URL}/tour-detalles/${slug}`,
    price: destination.price,
    duration: destination.duration,
    providerName: 'Senderos de Chiapas',
  })

  return (
    <>
      <JsonLd data={tourJsonLd} />
      <Header />

      {/* ====== Start Place Details Section (tour-details.html) ====== */}
      <section className="place-details-section">
        {/* Place Slider - desktop: slider; tablet/mobile: imagen 465x630 fija centrada */}
        {(() => {
          const img1 = destination.imagesDetails?.[0] ?? destination.image;
          const img2 = destination.imagesDetails?.[1] ?? destination.image;
          const sizeFeatured = { width: 950, height: 300 };
          const sizeSlide = { width: 465, height: 300 };
          const images = [img1, img2, img1, img2];
          return (
            <>
              {/* Desktop: slider con 4 imágenes */}
              <div className="place-slider-area overflow-hidden wow fadeInUp d-none d-lg-block">
                <div className="place-slider">
                  {images.map((img, i) => {
                    const isFeatured = i === 1 || i === 3; // orden: 465, 950, 465, 950
                    const size = isFeatured ? sizeFeatured : sizeSlide;
                    return (
                      <div key={i} className={isFeatured ? 'place-item' : 'place-slider-item'}>
                        <div
                          className="place-img"
                          style={{ width: size.width, height: size.height, overflow: 'hidden', borderRadius: 15 }}
                        >
                          <img
                            src={img}
                            alt={`${destination.title} - Imagen ${(i % 2) + 1}`}
                            width={size.width}
                            height={size.height}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Tablet y mobile: una sola imagen 465x630 centrada, sin slider */}
              <div className="place-slider-area overflow-hidden wow fadeInUp d-block d-lg-none">
                <div className="d-flex justify-content-center px-2">
                  <div
                    className="place-img"
                    style={{
                      width: '100%',
                      maxWidth: sizeSlide.width,
                      aspectRatio: '465/300',
                      overflow: 'hidden',
                      borderRadius: 15,
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img1}
                      alt={`${destination.title} - Imagen 1`}
                      width={sizeSlide.width}
                      height={sizeSlide.height}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        <div className="container">
          <div className="tour-details-wrapper pt-80">
            {/* Tour Title Wrapper */}
            <div className="tour-title-wrapper pb-30 wow fadeInUp">
              <div className="row">
                <div className="col-xl-6">
                  <div className="tour-title mb-10">
                    <h1 className="title">{destination.title}</h1>
                    {/* <p><i className="far fa-map-marker-alt"></i>{destination.location}</p> */}
                  </div>
                </div>
                <div className="col-xl-6 d-none d-xl-block">
                  <div className="tour-widget-info">
                    <div className="info-box mb-20">
                      <div className="icon"><i className="fal fa-box-usd"></i></div>
                      <div className="info"><h4><span>Desde</span>{destination.price}</h4></div>
                    </div>
                    <div className="info-box mb-20">
                      <div className="icon"><i className="fal fa-clock"></i></div>
                      <div className="info"><h4><span>Duración</span>{destination.duration}</h4></div>
                    </div>
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
              <div className="sidebar-widget booking-info-widget wow fadeInUp mb-40">
                <h4 className="widget-title">Detalles del tour</h4>
                <ul className="info-list">
                  {(destination.routeList?.length ?? (destination.route ? 1 : 0)) > 0 && (
                    <li>
                      <span>
                        <i className="far fa-route"></i>Ruta
                        <ul className="route-list mt-2">
                          {(destination.routeList ?? (destination.route ? [destination.route] : [])).map((point: string, i: number) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </span>
                    </li>
                  )}
                  <li><span><i className="fal fa-box-usd"></i>Precio<span>{destination.price}</span></span></li>
                  <li><span><i className="fal fa-clock"></i>Duración<span>{destination.duration}</span></span></li>
                  {destination.accommodation && <li><span><i className="far fa-bed"></i>Alojamiento<span>{destination.accommodation}</span></span></li>}
                  {destination.departureDate && <li><span><i className="far fa-calendar-alt"></i>Salida<span>{destination.departureDate}</span></span></li>}
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
              {(destination.calendarStart || destination.calendarEnd) && (
                <div className="calendar-wrapper wow fadeInUp mb-40">
                  <div
                    className="calendar-container"
                    data-calendar-date={destination.calendarStart ?? ''}
                    data-calendar-end={destination.calendarEnd ?? ''}
                  />
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-xl-8">
                {/* Place Content Wrap */}
                <div className="place-content-wrap pt-45 wow fadeInUp mb-100">
                  {/* <h3 className="title">Explorar Destinos</h3>
                  <p>{destination.description || 'Sed ut perspiciatis unde omniste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam, eaque ip quae abillo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor si amet consectetur adipisci velit sed quian numquam eius modi tempora incidunt ut labore dolore magnam aliquam quaerat voluptatem.'}</p> */}
                  <h4>Incluye</h4>
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
                  <div className="days-area mb-100 wow fadeInUp">
                    <h4 className="title">Itinerario</h4>
                    <p className="pb-4">Cronograma de actividades del tour:</p>
                    {(() => {
                      const daysMap = new Map<string, typeof destination.itinerary>();
                      for (const item of destination.itinerary!) {
                        const day = item.dayTitle || "Día";
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
                                  className={`nav-link ${i === 0 ? "active" : ""}`}
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
                                className={`tab-pane fade ${i === 0 ? "show active" : ""}`}
                                id={dayIds[i]}
                              >
                                <div className="content-box">
                                  <ul className="check-list">
                                    {daysMap.get(day)!.map((item: { dayTitle: string; time?: string; activity: string; routeItinerary?: string; accommodation?: string }, j: number) => (
                                      <React.Fragment key={j}>
                                        <li>
                                          <i className="fas fa-clock"></i>
                                          {item.time ? `${item.time} - ` : ""}
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
                {destination.mapItem?.length
                  ? destination.mapItem
                    .map((item) => ({
                      src: getMapUrl(item.map, destination.location),
                      title: item.title?.trim() || "Ubicación",
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
                      <h4 className="widget-title">Detalles del tour</h4>
                      <ul className="info-list">
                        {(destination.routeList?.length ?? (destination.route ? 1 : 0)) > 0 && (
                          <li>
                            <span>
                              <i className="far fa-route"></i>Ruta
                              <ul className="route-list mt-2">
                                {(destination.routeList ?? (destination.route ? [destination.route] : [])).map((point: string, i: number) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            </span>
                          </li>
                        )}
                        <li><span><i className="fal fa-box-usd"></i>Precio<span>{destination.price}</span></span></li>
                        <li><span><i className="fal fa-clock"></i>Duración<span>{destination.duration}</span></span></li>
                        {destination.accommodation && <li><span><i className="far fa-bed"></i>Alojamiento<span>{destination.accommodation}</span></span></li>}
                        {destination.departureDate && <li><span><i className="far fa-calendar-alt"></i>Salida<span>{destination.departureDate}</span></span></li>}
                        <li>
                          <div className="submit-button">
                            <a
                              href={`https://wa.me/529615791159?text=${encodeURIComponent(whatsappMessage)}`}
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
                    {(destination.calendarStart || destination.calendarEnd) && (
                      <div className="calendar-wrapper wow fadeInUp mb-100">
                        <div
                          className="calendar-container"
                          data-calendar-date={destination.calendarStart ?? ''}
                          data-calendar-end={destination.calendarEnd ?? ''}
                        />
                      </div>
                    )}
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
                              {(tour.duration || tour.price) && (
                                <ul className="place-meta recent-place-meta list-unstyled mt-1 mb-0 small">
                                  {tour.duration && <li><i className="fal fa-clock me-1"></i>{tour.duration}</li>}
                                  {tour.price && <li><i className="fal fa-box-usd me-1"></i>{tour.price}</li>}
                                </ul>
                              )}
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
