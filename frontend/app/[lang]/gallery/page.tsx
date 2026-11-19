import type { Metadata } from 'next'
import { localizePath, pageAlternates, type Lang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import GalleryGrid from '@/components/GalleryGrid'
import GalleryIntro, { galleryGroupId } from '@/components/GalleryIntro'
import { fetchGalleryPageData, STRAPI_REVALIDATE_SECONDS } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const t = getDictionary(params.lang).galleryPage
  return { title: t.metaTitle, description: t.metaDescription, alternates: pageAlternates(params.lang, '/experiencias') }
}

export default async function Gallery({ params }: { params: { lang: Lang } }) {
  const { lang } = params
  const to = (path: string) => localizePath(lang, path)
  const c = getDictionary(lang).common
  let galleryGroups: { title: string; images: string[] }[] = []

  try {
    const data = await fetchGalleryPageData(lang)
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
            <GalleryIntro groups={galleryGroups} lang={lang} />
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
                    <span className="sub-title">{c.maintenance}</span>
                    <h2>{c.maintenanceTitle}</h2>
                    <p className="mt-40">
                      {c.galleryMaintenanceText}
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
        )}

      </main>
      <Footer />
    </>
  )
}
