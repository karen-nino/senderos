import type { Metadata } from 'next'
import { localizePath, pageAlternates, type Lang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { fetchAboutPageData, STRAPI_REVALIDATE_SECONDS } from '@/lib/strapi'
import { cloudinaryWidth } from '@/lib/cloudinary'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const t = getDictionary(params.lang).aboutPage
  return { title: t.metaTitle, description: t.metaDescription, alternates: pageAlternates(params.lang, '/nosotros') }
}


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

export default async function About({ params }: { params: { lang: Lang } }) {
  const { lang } = params
  const to = (path: string) => localizePath(lang, path)
  const c = getDictionary(lang).common
  let aboutData: Awaited<ReturnType<typeof fetchAboutPageData>> | null = null
  try {
    aboutData = await fetchAboutPageData(lang)
  } catch (error) {
    console.error('Error fetching about from Strapi:', error)
  }

  if (aboutData == null) {
    return (
      <>
        <Header />
        <main>
          <section className="contact-section pt-220 pb-220">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                  <div className="section-title mb-70 wow fadeInDown">
                    <i className="fas fa-users mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                    <span className="sub-title">{c.maintenance}</span>
                    <h2>{c.maintenanceTitle}</h2>
                    <p className="mt-40">
                      {c.aboutMaintenanceText}
                    </p>
                  </div>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    <Link
                      href={to('/')}
                      className="main-btn wow fadeInUp"
                      style={{ padding: '16px 45px', backgroundColor: 'rgba(99, 171, 69, 0.2)', color: '#63ab45' }}
                    >
                      {c.backHome}
                    </Link>
                    <Link href={to('/contacto')} className="main-btn primary-btn wow fadeInUp" style={{ padding: '16px 45px' }}>
                      {c.contactUs}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const data = aboutData!
  const t = getDictionary(lang).aboutPage
  const featuresSubTitle = data.featuresSubTitle ?? t.featuresSub
  const featuresTitle = data.featuresTitle ?? data.title ?? t.featuresTitle
  const featuresDescription = data.description ?? data.featuresDescription ?? t.featuresDescription

  const features = (data.features && data.features.length > 0)
    ? data.features.map((f) => ({
      icon: resolveIcon(f.icon),
      title: f.title || '',
      description: f.description || '',
    }))
    : t.defaultFeatures

  const whoWeSubTitle = data.whoWeAre?.subtitle ?? t.whoSub
  const whoWeTitle = data.whoWeAre?.title ?? data.whoWeAreTitle ?? t.whoTitle
  const whoWeDescription = data.whoWeAre?.description ?? data.whoWeAreDescription ?? t.whoDescription
  const whoWeImage = data.whoWeAre?.imageUrl || '/assets/images/gallery/we-1.jpg'

  const whatWeSubTitle = data.whatWeSubTitle ?? t.whatSub
  const whatWeTitle = data.whatWeTitle ?? t.whatTitle

  const ctaTitle = data.cta?.title ?? data.ctaTitle ?? t.ctaTitle
  const ctaButtonText = data.cta?.buttonText ?? data.ctaButtonText ?? t.ctaButton
  const ctaButtonLink = data.cta?.buttonLink ?? data.ctaButtonLink ?? '/tours'

  const ctaBg = data.imageBannerUrl || '/assets/images/bg/cta-bg.jpg'

  const DEFAULT_GALLERY = ['/assets/images/gallery/we-3.jpg', '/assets/images/gallery/we-4.jpg', '/assets/images/gallery/we-5.jpg']
  const galleryImages = (data.galleryImages && data.galleryImages.length > 0)
    ? data.galleryImages
    : DEFAULT_GALLERY

  return (
    <>
      <Header />
      <main>

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
                    <img src={cloudinaryWidth(whoWeImage, 1200)} loading="lazy" decoding="async" className="radius-top-left-right-288 who-we-are-img" alt={t.whoAlt} width={577} height={721} style={{ objectFit: 'cover' }} />
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
                        <h4>{t.benefits[0].title}</h4>
                        <p>{t.benefits[0].text}</p>
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
                        <h4>{t.benefits[1].title}</h4>
                        <p>{t.benefits[1].text}</p>
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
                        <h4>{t.benefits[2].title}</h4>
                        <p>{t.benefits[2].text}</p>
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
                        <h4>{t.benefits[3].title}</h4>
                        <p>{t.benefits[3].text}</p>
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
                            <img src={cloudinaryWidth(galleryImages[0], 600)} loading="lazy" decoding="async" alt="Senderos de Chiapas" width={300} height={300} style={{ objectFit: 'cover' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {galleryImages[1] && (
                      <div className="col-md-6">
                        <div className="we-image mb-30 wow fadeInRight">
                          <div className="gallery-img">
                            <img src={cloudinaryWidth(galleryImages[1], 600)} loading="lazy" decoding="async" alt="Senderos de Chiapas" width={300} height={355} style={{ objectFit: 'cover' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    {galleryImages[2] && (
                      <div className="col-md-12">
                        <div className="we-image mb-30 pr-lg-30 text-md-end wow fadeInDown">
                          <div className="gallery-img">
                            <img src={cloudinaryWidth(galleryImages[2], 1040)} loading="lazy" decoding="async" alt="Senderos de Chiapas" width={520} height={255} style={{ objectFit: 'cover' }} />
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
        <section className="cta-bg overlay bg_cover pt-150 pb-150" style={{ backgroundImage: `url(${cloudinaryWidth(ctaBg, 1920)})` }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-8">
                <div className="cta-content-box text-center text-white wow fadeInDown">
                  <h2 className="mb-35">{ctaTitle.replace(/\n/g, ' ')}</h2>
                  <Link href={to(ctaButtonLink)} className="main-btn primary-btn">{ctaButtonText}<i className="far fa-paper-plane"></i></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
