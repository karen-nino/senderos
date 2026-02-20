import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TourItem from '@/components/TourItem'
import SeasonPackageItem from '@/components/SeasonPackageItem'
import HeroSlider from '@/components/HeroSlider'
import Link from 'next/link'
import { fetchStrapi, fetchDestinationsForHome, fetchPackages, fetchSeasonsForHome, parseHomeServices, parseHomeTestimonial, parseHomeHeroSlides, parseHomeGallery, GALLERY_FALLBACK_IMAGES, type AdaptedDestination, type AdaptedHomeService, type AdaptedSeason } from '@/lib/strapi'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let heroSlides: Awaited<ReturnType<typeof parseHomeHeroSlides>> = []
  let destinations: AdaptedDestination[] = []
  let packages: AdaptedDestination[] = []
  let services: AdaptedHomeService[] = []
  let testimonial: Awaited<ReturnType<typeof parseHomeTestimonial>> = null
  let galleryImages: string[] = []
  let seasons: AdaptedSeason[] = []

  try {
    // Obtener heroSlides (Página Principal - Carrusel), services y testimonial desde home
    // Sintaxis Strapi v5: heroSlides, services, testimonial, gallery (Página Principal)
    let response = await fetchStrapi(
      '/api/home?populate[0]=heroSlides&populate[1]=heroSlides.image&populate[2]=services&populate[3]=services.image&populate[4]=testimonial&populate[5]=testimonial.profilePhoto&populate[6]=testimonial.photo&populate[7]=gallery'
    )
    if (response?.error) {
      // Fallback: populate=* o populate explícito de heroSlides
      response = await fetchStrapi('/api/home?populate[0]=heroSlides&populate[1]=heroSlides.image&populate[2]=services&populate[3]=testimonial&populate[4]=gallery')
    }
    const home = response?.data || {}
    // Strapi v4: single type usa data.attributes para los campos. HeroSlides con URLs resueltas vía proxy.
    heroSlides = parseHomeHeroSlides(home)
    // Fallback: si no hay slides en Strapi, usar imagen del HTML Template (hero-one_img-1.jpg)
    if (heroSlides.length === 0) {
      heroSlides = [
        {
          id: 0,
          title: 'Travel & Adventure Camping',
          subtitle: 'Nunc et dui nullam aliquam eget velit. Consectetur nulla convallis viverra quisque eleifend',
          image: '/assets/images/hero/hero-one_img-1.jpg',
          ctaText: 'Explorar más',
          ctaLink: '/nosotros',
        },
      ]
    }
    services = parseHomeServices(home)
    testimonial = parseHomeTestimonial(home)
    galleryImages = parseHomeGallery(home)

    // Obtener destinos con home: true desde /api/tour (Strapi)
    destinations = (await fetchDestinationsForHome()).filter(
      (d) => (d.badge || '').toLowerCase() !== 'hide'
    )

    // Obtener paquetes desde single type /api/package (Strapi)
    packages = (await fetchPackages()).filter(
      (pkg) => (pkg.badge || '').toLowerCase() !== 'hide'
    )

    // Obtener paquetes de temporada (seasons con home: true) desde /api/package (Strapi)
    seasons = await fetchSeasonsForHome()
  } catch (error) {
    console.error('Error fetching data from Strapi:', error)
  }

  return (
    <>
      <Header />

      <HeroSlider slides={heroSlides} />

      {/* Features Section - Paquetes desde Strapi single type package (layout index-2) */}
      {packages.length > 0 && (
        <section className="features-section pt-160">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8">
                <div className="section-title text-center mb-45 wow fadeInDown">
                  <span className="sub-title">Paquetes</span>
                  <h2>Recorre, disfruta y respira Chiapas</h2>
                </div>
              </div>
            </div>
            <div className="row g-2 g-md-3 justify-content-center">
              {packages.map((pkg: AdaptedDestination, index: number) => (
                <div key={index} className="col-6 col-md-6 col-xl-3">
                  <Link
                    href={pkg.link || '#'}
                    className={`single-features-item-two mb-30 mb-md-40 wow ${index % 2 === 0 ? 'fadeInUp' : 'fadeInDown'} d-block w-100`}
                  >
                    <div className="img-holder">
                      <span className="package-badge">Paquete</span>
                      <img src={pkg.image && !pkg.image.includes('las-tres-tzimoleras') ? pkg.image : '/assets/images/place/single-place-1.jpg'} alt={pkg.title} />
                      <div className="item-overlay">
                        <div className="content text-center">
                          <h3 className="title">{pkg.title}</h3>
                          {pkg.route && <p className="package-route"><i className="far fa-map-marked-alt"></i>{pkg.route}</p>}
                          <p className="package-price">{pkg.price || 'Consultar'}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tours Section */}
      {destinations.length > 0 && (
        <section className="services-seciton pt-160 pb-160">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8 col-lg-10">
                <div className="section-title text-center mb-60 wow fadeInDown">
                  <span className="sub-title">Tours</span>
                  <h2>Recorre, disfruta y respira Chiapas</h2>
                </div>
              </div>
            </div>
            <div className="places-section__container">
              <div className="places-section__grid slider-destinations-grid wow fadeInUp">
                {destinations.map((destination: AdaptedDestination, index: number) => (
                  <div key={index} className="places-section__item">
                    <TourItem
                      title={destination.title}
                      description={destination.description}
                      image={destination.image}
                      link={destination.slug ? `/tour-details/${destination.slug}` : (destination.link || '/tour-details/chiapas')}
                      departureDate={destination.departureDate}
                      duration={destination.duration}
                      price={destination.price}
                      badge={destination.badge}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Activity Section */}
      <section className="activity-section">
        <div className="activity-wrapper-bgc text-white black-bg">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-7">
                <div className="section-title text-center mb-50 wow fadeInDown">
                  <span className="sub-title">Nuestros Servicios</span>
                  <h2>Tu próxima aventura, empezando aquí y ahora</h2>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4">
                <div className="activity-nav-tab mb-50 wow fadeInLeft">
                  <ul className="nav nav-tabs">
                    {services.length > 0 ? (
                      services.map((svc, idx) => (
                        <li key={svc.title || idx}>
                          <a
                            href={`#tab${idx + 1}`}
                            className={`nav-link ${idx === 0 ? 'active' : ''}`}
                            data-bs-toggle="tab"
                            data-bs-target={`#tab${idx + 1}`}
                          >
                            {svc.subtitle || svc.title || `Servicio ${idx + 1}`}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li>
                        <a href="#tab1" className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab1">
                          Nuestros Servicios
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="tab-content mb-50 wow fadeInRight">
                  {services.length > 0 ? (
                    services.map((svc, idx) => (
                      <div
                        key={svc.title || idx}
                        className={`tab-pane fade ${idx === 0 ? 'show active' : ''}`}
                        id={`tab${idx + 1}`}
                      >
                        <div className="row align-items-center">
                          <div className="col-md-6">
                            <div className="activity-content-box pl-lg-40">
                              <div className="icon">
                                <i className={svc.icon || 'flaticon-camp'}></i>
                              </div>
                              <h3 className="title">{svc.title || svc.subtitle || 'Servicio'}</h3>
                              {svc.description && (
                                <p>{svc.description}</p>
                              )}
                              {svc.listItems.length > 0 && (
                                <ul className="check-list">
                                  {svc.listItems.map((item, i) => (
                                    <li key={i}>
                                      <i className="fas fa-badge-check"></i>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="activity-image-box">
                              <img
                                src={svc.imageUrl}
                                className="radius-12"
                                alt={svc.title || 'Imagen del servicio'}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="tab-pane fade show active" id="tab1">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <div className="activity-content-box pl-lg-40">
                            <div className="icon">
                              <i className="flaticon-camp"></i>
                            </div>
                            <h3 className="title">Tu próxima aventura, empezando aquí y ahora</h3>
                            <ul className="check-list">
                              <li><i className="fas fa-badge-check"></i>Tours Diarios</li>
                              <li><i className="fas fa-badge-check"></i>Paquetes</li>
                              <li><i className="fas fa-badge-check"></i>Experiencias únicas</li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="activity-image-box">
                            <img src="/assets/images/gallery/activity.webp" className="radius-12" alt="Nuestros Servicios" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      {testimonial && (
        <section className="testimonial-section pt-200">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8">
                <div className="section-title text-center mb-50 wow fadeInDown">
                  <span className="sub-title">Testimoniales</span>
                  <h2>Testimonios de nuestros viajeros</h2>
                </div>
              </div>
            </div>
            <div className="row align-items-xl-center">
              <div className="col-xl-5 col-lg-12 order-2 order-xl-1">
                <div className="testimonial-one_image-box mb-40 wow fadeInLeft">
                  <img
                    src={testimonial.photoUrl || '/assets/images/testimonial/testimonial-1.jpg'}
                    alt={testimonial.name ? `Testimonial de ${testimonial.name}` : 'Testimonial Image'}
                  />
                </div>
              </div>
              <div className="col-xl-7 col-lg-12 order-1 order-xl-2">
                <div className="testimonial-slider-one pl-lg-55 mb-40 wow fadeInRight">
                  <div className="gw-testimonial-item">
                    <div className="testimonial-inner-content">
                      <div className="quote-rating-box">
                        <div className="icon">
                          <img src="/assets/images/testimonial/quote.png" alt="quote icon" />
                        </div>
                        <div className="ratings-box">
                          <h4>Calidad de Servicio</h4>
                          <ul className="ratings">
                            <li><i className="fas fa-star"></i></li>
                            <li><i className="fas fa-star"></i></li>
                            <li><i className="fas fa-star"></i></li>
                            <li><i className="fas fa-star"></i></li>
                            <li><i className="fas fa-star"></i></li>
                          </ul>
                        </div>
                      </div>
                      <p>
                        {testimonial.testimonial || 'To take a trivial example which of usev undertakes laborious physical exercise excepto obtain advantage from has any right to find fault with man who chooses to enjoy'}
                      </p>
                      <div className="author-thumb-title">
                        <div className="author-thumb">
                          <img
                            src={testimonial.profilePhotoUrl || '/assets/images/testimonial/author-1.jpg'}
                            alt={testimonial.name || 'Author Image'}
                          />
                        </div>
                        <div className="author-title">
                          <h3 className="title">{testimonial.name || 'Douglas D. Hall'}</h3>
                          <p className="position">{testimonial.ocupation || 'CEO & Founder'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Packages Section - Datos desde Strapi (Package → season), fallback como Testimonial */}
      {seasons.length > 0 && (
        <section className="seasonal-packages-section pt-200">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-6">
                <div className="section-title text-center mb-45 wow fadeInDown">
                  <span className="sub-title">Paquetes de temporada</span>
                  <h2>Aprovecha nuestras mejores rutas y promociones por temporada</h2>
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              {seasons.map((season, i) => (
                <SeasonPackageItem
                  key={i}
                  title={season.title}
                  image={season.image}
                  link={season.link}
                  category={season.category}
                  dateFormatted={season.dateFormatted}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section - Imágenes desde Página Principal gallery (Strapi) */}
      <section className="gallery-section pt-200 mbm-150">
        <div className="container-fluid">
          <div className="slider-active-5-item wow fadeInUp">
            {(galleryImages.length > 0 ? galleryImages : GALLERY_FALLBACK_IMAGES).map((src, i) => (
              <div key={i} className="single-gallery-item">
                <div className="gallery-img">
                  <img src={src} alt={`Gallery Image ${i + 1}`} />
                  <div className="hover-overlay">
                    <a href={src} className="icon-btn img-popup">
                      <i className="far fa-plus"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

