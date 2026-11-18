import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import GalleryGrid from '@/components/GalleryGrid'
import GalleryIntro, { galleryGroupId } from '@/components/GalleryIntro'
import { fetchGalleryPageData, STRAPI_REVALIDATE_SECONDS } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export const metadata: Metadata = {
  title: 'Experiencias - Galería | Senderos de Chiapas',
  description: 'Galería de experiencias y momentos de nuestros tours y paquetes en Chiapas. Descubre destinos, cascadas, cultura y naturaleza.',
}

export default async function Gallery() {
  let galleryGroups: { title: string; images: string[] }[] = []

  try {
    const data = await fetchGalleryPageData()
    galleryGroups = data.galleryGroups
  } catch (error) {
    console.error('Error fetching gallery from Strapi:', error)
  }

  const hasGalleryGroups = galleryGroups.length > 0

  return (
    <>
      <Header />
      <main>


        {hasGalleryGroups ? (
          <section className="gallery-area pt-0 pb-350">
            <GalleryIntro groups={galleryGroups} />
            <div className="container">
              {galleryGroups.map((group, groupIdx) => (
                <div key={groupIdx} id={galleryGroupId(group.title, groupIdx)} className="gallery-group mb-120">
                  {group.title && (
                    <div className="section-title text-center mt-50 mb-50 wow fadeInUp">
                      <h2 className="gallery-group-title">{group.title}</h2>
                    </div>
                  )}
                  <GalleryGrid title={group.title} images={group.images} />
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

      </main>
      <Footer />
    </>
  )
}
