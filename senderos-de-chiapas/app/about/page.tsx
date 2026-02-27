import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { fetchAboutPageData, STRAPI_REVALIDATE_SECONDS } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

const DEFAULT_FEATURES = [
  { icon: 'flaticon-gps', title: 'Experiencias y Tours', description: 'En zonas naturales y culturales.' },
  { icon: 'flaticon-biking-mountain', title: 'Actividades Turísticas', description: 'Rutas, regiones y actividades' },
  { icon: 'flaticon-award', title: 'Certificados y Reconocimientos', description: 'Contamos con certificados y reconocimientos de calidad de servicio.' },
  { icon: 'flaticon-best-price', title: 'Promociones Variadas y Flexibles', description: 'Buscamos adaptarnos a distintos intereses de viaje.' },
]

const ICON_MAP: Record<string, string> = {
  camping: 'flaticon-camping',
  hiking: 'flaticon-hiking',
  journey: 'flaticon-journey',
  biking: 'flaticon-biking-mountain',
  fishing: 'flaticon-fishing-2',
  caravan: 'flaticon-caravan',
  helmet: 'flaticon-helmet',
  'best-price': 'flaticon-best-price',
  travel: 'flaticon-travel',
  gps: 'flaticon-gps',
  world: 'flaticon-world',
  award: 'flaticon-award',
}

function resolveIcon(icon?: string): string {
  if (!icon) return 'flaticon-camping'
  const key = icon.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^flaticon-/, '')
  return ICON_MAP[key] ?? (icon.startsWith('flaticon-') ? icon : `flaticon-${icon}`)
}

export default async function About() {
  let aboutData: Awaited<ReturnType<typeof fetchAboutPageData>> | null = null
  try {
    aboutData = await fetchAboutPageData()
  } catch (error) {
    console.error('Error fetching about from Strapi:', error)
  }

  if (aboutData == null) {
    return (
      <>
        <Header />
        <section className="contact-section pt-220 pb-220">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="section-title mb-70 wow fadeInDown">
                  <i className="fas fa-users mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                  <span className="sub-title">En mantenimiento</span>
                  <h2>Esta página está en mantenimiento</h2>
                  <p className="mt-40">
                    Estamos trabajando para actualizar esta página. Si gustas conocer más sobre nosotros, contáctanos y con gusto te atendemos.
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
        <Footer />
      </>
    )
  }

  const data = aboutData!
  const featuresSubTitle = data.featuresSubTitle ?? 'Únete a nuestra comunidad'
  const featuresTitle = data.featuresTitle ?? data.title ?? 'Explora con nosotros y disfruta de las mejores experiencias'
  const featuresDescription = data.description ?? data.featuresDescription ?? 'Descubre viajes únicos dentro y fuera de Chiapas con nosotros. Experiencias diseñadas a tu medida, atención personalizada y destinos inolvidables que se adaptan a tus intereses y presupuesto.'

  const features = (data.features && data.features.length > 0)
    ? data.features.map((f) => ({
      icon: resolveIcon(f.icon),
      title: f.title || 'Feature',
      description: f.description || '',
    }))
    : DEFAULT_FEATURES

  const whoWeSubTitle = data.whoWeAre?.subtitle ?? 'Quiénes Somos'
  const whoWeTitle = data.whoWeAre?.title ?? data.whoWeAreTitle ?? 'Somos un equipo de expertos en turismo que te ofrece las mejores experiencias'
  const whoWeDescription = data.whoWeAre?.description ?? data.whoWeAreDescription ?? 'Con más de 10 años de experiencia en el sector turístico, en Senderos de Chiapas nos especializamos en diseñar viajes únicos y personalizados que se adaptan a tus intereses, estilo de viaje y presupuesto. Gracias a nuestro conocimiento profundo de los destinos y al trato cercano con cada viajero, transformamos cada itinerario en una experiencia inolvidable, ya sea explorando la belleza natural y cultural de Chiapas o descubriendo destinos fuera del estado.'
  const whoWeImage = data.whoWeAre?.imageUrl || '/assets/images/gallery/we-1.jpg'

  const whatWeSubTitle = data.whatWeSubTitle ?? 'Beneficios'
  const whatWeTitle = data.whatWeTitle ?? 'Razones para viajar con nosotros'

  const ctaTitle = data.cta?.title ?? data.ctaTitle ?? 'Listo para una auténtica aventura en cualquier rincón del mundo'
  const ctaButtonText = data.cta?.buttonText ?? data.ctaButtonText ?? 'Explora Destinos'
  const ctaButtonLink = data.cta?.buttonLink ?? data.ctaButtonLink ?? '/tours'

  const ctaBg = data.imageBannerUrl || '/assets/images/bg/cta-bg.jpg'

  const DEFAULT_GALLERY = ['/assets/images/gallery/we-3.jpg', '/assets/images/gallery/we-4.jpg', '/assets/images/gallery/we-5.jpg']
  const galleryImages = (data.galleryImages && data.galleryImages.length > 0)
    ? data.galleryImages
    : DEFAULT_GALLERY

  return (
    <>
      <Header />

      {/* Features Section */}
      <section className="features-section pt-160 pb-160">
        <div className="container">
          <div className="row align-items-xl-center">
            <div className="col-xl-5">
              <div className="features-content-box pr-lg-70 mb-50 wow fadeInLeft">
                <div className="section-title mb-30">
                  <span className="sub-title">{featuresSubTitle}</span>
                  <h2>{featuresTitle.replace(/\n/g, ' ')}</h2>
                </div>
                <p className="mb-30">{featuresDescription}</p>
              </div>
            </div>
            <div className="col-xl-7">
              <div className="features-item-area mb-20 pl-lg-70">
                <div className="row">
                  {features.map((feat, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="fancy-icon-box-two mb-30 wow fadeInUp">
                        <div className="icon text-center">
                          <i className={feat.icon}></i>
                        </div>
                        <div className="text">
                          <h3 className="title">{feat.title}</h3>
                          <p>{feat.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="who-we-section">
        <div className="container">
          <div className="row align-items-xl-center">
            <div className="col-lg-6 order-2 order-lg-1">
              <div className="we-image-box text-center text-lg-left wow fadeInDown">
                <div className="gallery-img">
                  <img src={whoWeImage} className="radius-top-left-right-288 who-we-are-img" alt="Quiénes somos" width={577} height={721} style={{ objectFit: 'cover' }} />
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2">
              <div className="we-one_content-box">
                <div className="section-title mb-30 wow fadeInUp">
                  <span className="sub-title">{whoWeSubTitle}</span>
                  <h2>{whoWeTitle.replace(/\n/g, ' ')}</h2>
                </div>
                <p className="wow fadeInDown">{whoWeDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Section */}
      <section className="we-section pt-160 pb-160 gray-bg">
        <div className="container">
          <div className="row align-items-xl-center">
            <div className="col-xl-6">
              <div className="we-content-box mb-10 wow fadeInLeft">
                <div className="section-title mb-30">
                  <span className="sub-title">{whatWeSubTitle}</span>
                  <h2>{whatWeTitle.replace(/\n/g, ' ')}</h2>
                </div>
                <div className="features-list_one">
                  <div className="single-features-list mb-40">
                    <div className="icon-inner d-flex align-items-center">
                      <div className="icon-check">
                        <i className="fas fa-badge-check"></i>
                      </div>
                      <div className="icon">
                        <i className="flaticon-paper-plane"></i>
                      </div>
                    </div>
                    <div className="content">
                      <h4>Planeación Segura</h4>
                      <p>Paquetes y viajes organizados con itinerarios planificados.</p>
                    </div>
                  </div>
                  <div className="single-features-list mb-40">
                    <div className="icon-inner d-flex align-items-center">
                      <div className="icon-check">
                        <i className="fas fa-badge-check"></i>
                      </div>
                      <div className="icon">
                        <i className="flaticon-reviews"></i>
                      </div>
                    </div>
                    <div className="content">
                      <h4>Atención Personalizada</h4>
                      <p>Adaptamos itinerarios y recomendaciones según los intereses y presupuesto de cada cliente.</p>
                    </div>
                  </div>
                  <div className="single-features-list mb-40">
                    <div className="icon-inner d-flex align-items-center">
                      <div className="icon-check">
                        <i className="fas fa-badge-check"></i>
                      </div>
                      <div className="icon">
                        <i className="flaticon-hiking"></i>
                      </div>
                    </div>
                    <div className="content">
                      <h4>Profesionales locales</h4>
                      <p>Conocimiento local profundo del estado de Chiapas</p>
                    </div>
                  </div>
                  <div className="single-features-list mb-40">
                    <div className="icon-inner d-flex align-items-center">
                      <div className="icon-check">
                        <i className="fas fa-badge-check"></i>
                      </div>
                      <div className="icon">
                        <i className="flaticon-best-price"></i>
                      </div>
                    </div>
                    <div className="content">
                      <h4>Buenos Precios</h4>
                      <p>Ofrecemos diferentes tipos de experiencias, buscando adaptarnos a distintos intereses de viaje.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6">
              <div className="we-two_image-box mb-20">
                <div className="row align-items-end">
                  {galleryImages[0] && (
                    <div className="col-md-6">
                      <div className="we-image mb-30 wow fadeInLeft">
                        <div className="gallery-img">
                          <img src={galleryImages[0]} alt="Senderos de Chiapas" width={300} height={300} style={{ objectFit: 'cover' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  {galleryImages[1] && (
                    <div className="col-md-6">
                      <div className="we-image mb-30 wow fadeInRight">
                        <div className="gallery-img">
                          <img src={galleryImages[1]} alt="Senderos de Chiapas" width={300} height={355} style={{ objectFit: 'cover' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  {galleryImages[2] && (
                    <div className="col-md-12">
                      <div className="we-image mb-30 pr-lg-30 text-md-end wow fadeInDown">
                        <div className="gallery-img">
                          <img src={galleryImages[2]} alt="Senderos de Chiapas" width={520} height={255} style={{ objectFit: 'cover' }} />
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

      {/* CTA Section */}
      <section className="cta-bg overlay bg_cover pt-150 pb-150" style={{ backgroundImage: `url(${ctaBg})` }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8">
              <div className="cta-content-box text-center text-white wow fadeInDown">
                <h2 className="mb-35">{ctaTitle.replace(/\n/g, ' ')}</h2>
                <Link href={ctaButtonLink} className="main-btn primary-btn">{ctaButtonText}<i className="far fa-paper-plane"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
