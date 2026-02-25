import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { fetchGalleryPageData, STRAPI_REVALIDATE_SECONDS } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export default async function Gallery() {
  let imageBannerUrl: string | null = null
  let galleryGroups: { title: string; images: string[] }[] = []

  try {
    const data = await fetchGalleryPageData()
    imageBannerUrl = data.imageBannerUrl
    galleryGroups = data.galleryGroups
  } catch (error) {
    console.error('Error fetching gallery from Strapi:', error)
  }

  const bannerBg = imageBannerUrl || '/assets/images/bg/page-bg.jpg'
  const hasBannerFromStrapi = imageBannerUrl != null
  const hasGalleryGroups = galleryGroups.length > 0
  const hasDataFromStrapi = hasBannerFromStrapi || hasGalleryGroups

  return (
    <>
      <Header />

      {hasDataFromStrapi && (
        <section className="page-banner overlay pt-220 pb-220 bg_cover" style={{ backgroundImage: `url(${bannerBg})` }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 mx-auto text-center">
                <div className="page-banner-content text-center text-white">
                  <h1 className="page-title">Experiencias</h1>
                  <ul className="breadcrumb-link text-white d-flex justify-content-center flex-wrap list-unstyled mb-0">
                    <li><Link href="/">Home</Link></li>
                    <li className="active">Experiencias</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {hasGalleryGroups ? (
        <section className="gallery-area pt-180 pb-350">
          <div className="container">
            {galleryGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="gallery-group mb-120">
                {group.title && (
                  <div className="section-title text-center mt-50 mb-50 wow fadeInUp">
                    <h2 className="gallery-group-title">{group.title}</h2>
                  </div>
                )}
                <div className="row">
                  {group.images.map((imgUrl, idx) => (
                    <div key={`${groupIdx}-${idx}`} className="col-lg-4 col-md-6 col-sm-6 col-6">
                      <div className="single-gallery-item mb-30 wow fadeInUp">
                        <div className="gallery-img">
                          <img
                            src={imgUrl}
                            alt={`${group.title} ${idx + 1}`}
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="hover-overlay">
                            <a href={imgUrl} className="icon-btn img-popup"><i className="far fa-plus"></i></a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="contact-section pt-220 pb-220">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div className="section-title mb-70 wow fadeInDown">
                  <i className="fas fa-images mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                  <span className="sub-title">En mantenimiento</span>
                  <h2>Esta página está en mantenimiento</h2>
                  <p className="mt-40">
                    Estamos trabajando para actualizar la galería. Si gustas conocer más sobre nuestras experiencias, contáctanos y con gusto te atendemos.
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
    </>
  )
}
