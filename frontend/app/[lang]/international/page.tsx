import type { Metadata } from 'next'
import { localizePath, pageAlternates, type Lang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InternationalItem from '@/components/InternationalItem'
import FilteredCardsList from '@/components/FilteredCardsList'
import Link from 'next/link'
import { fetchInternationalPageData, STRAPI_REVALIDATE_SECONDS, type AdaptedDestination } from '@/lib/strapi'
import { cloudinaryWidth } from '@/lib/cloudinary'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const t = getDictionary(params.lang).internationalPage
  return { title: t.metaTitle, description: t.metaDescription, alternates: pageAlternates(params.lang, '/internacional') }
}

export default async function InternationalPage({ params }: { params: { lang: Lang } }) {
  const { lang } = params
  const to = (path: string) => localizePath(lang, path)
  const dict = getDictionary(lang)
  const t = dict.internationalPage
  const c = dict.common
  let destinations: AdaptedDestination[] = []
  let imageBannerUrl: string | null = null

  try {
    const data = await fetchInternationalPageData(lang)
    destinations = data.destinations
    imageBannerUrl = data.imageBannerUrl
  } catch (error) {
    console.error('Error fetching international from Strapi:', error)
  }

  const displayDestinations = destinations.filter(
    (d) => (d.badge || '') !== 'oculto'
  )
  const hasDataFromStrapi = displayDestinations.length > 0
  const bannerBg = imageBannerUrl || '/assets/images/bg/page-bg.jpg'

  return (
    <React.Fragment>
      <Header />
      <main>

        {hasDataFromStrapi && (
          <section className="page-banner overlay pt-220 pb-220 bg_cover" style={{ backgroundImage: `url(${cloudinaryWidth(bannerBg, 1920)})` }}>
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-10 mx-auto text-center">
                  <div className="page-banner-content text-center text-white">
                    <h1 className="page-title">{t.title}</h1>
                    <ul className="breadcrumb-link text-white d-flex justify-content-center flex-wrap list-unstyled mb-0">
                      <li><Link href={to('/')}>{c.home}</Link></li>
                      <li className="active">{t.breadcrumb}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {hasDataFromStrapi ? (
          <section className="places-section pt-80 pb-180">
            <div className="places-section__container">
              <FilteredCardsList
                items={displayDestinations.map((destination, i) => ({
                  title: destination.title,
                  key: String(destination.slug || destination.title || i),
                  content: (
                    <InternationalItem
                      lang={lang}
                      title={destination.title}
                      description={destination.subtitle ?? destination.description}
                      image={destination.image}
                      departureDate={destination.departureDate}
                      duration={destination.duration}
                      price={destination.price}
                      badge={destination.badge === 'oculto' ? undefined : destination.badge}
                      route={destination.route}
                      includes={destination.includes}
                    />
                  ),
                }))}
                searchPlaceholder={t.search}
                emptyMessage={t.empty}
              />
            </div>
            <div className="container text-center mt-50">
              <Link
                href={to('/')}
                className="main-btn wow fadeInUp"
                style={{ padding: '16px 45px', backgroundColor: 'rgba(99, 171, 69, 0.2)', color: '#63ab45' }}
              >
                {c.backHome}
              </Link>
            </div>
          </section>
        ) : (
          <section className="contact-section pt-220 pb-220">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                  <div className="section-title mb-70 wow fadeInDown">
                    <i className="fas fa-globe-americas mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                    <span className="sub-title">{c.unavailable}</span>
                    <h2>{c.noInfo}</h2>
                    <p className="mt-40">
                      {c.noInternationalText}
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
    </React.Fragment>
  )
}
