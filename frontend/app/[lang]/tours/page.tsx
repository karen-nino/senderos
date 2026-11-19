import type { Metadata } from 'next'
import { localizePath, pageAlternates, type Lang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CardsExplorer, { type CardsGroup } from '@/components/CardsExplorer'
import PageIntro from '@/components/PageIntro'
import Link from 'next/link'
import { fetchTourPageData, STRAPI_REVALIDATE_SECONDS, getTourDetailHref, tourCardSubtitle, type AdaptedDestination } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const t = getDictionary(params.lang).toursPage
  return { title: t.metaTitle, description: t.metaDescription, alternates: pageAlternates(params.lang, '/tours') }
}

export default async function ToursPage({ params }: { params: { lang: Lang } }) {
  const { lang } = params
  const to = (path: string) => localizePath(lang, path)
  const dict = getDictionary(lang)
  const t = dict.toursPage
  const c = dict.common
  const cards = dict.cards
  let destinations: AdaptedDestination[] = []

  try {
    const data = await fetchTourPageData(lang)
    destinations = data.destinations
  } catch (error) {
    console.error('Error fetching tours from Strapi:', error)
  }

  const displayDestinations = destinations.filter(
    (d) => (d.badge || '') !== 'oculto'
  )
  const hasDataFromStrapi = displayDestinations.length > 0

  // Una categoría por punto de salida, en el orden en que llegan de Strapi
  const departureGroups: CardsGroup[] = []
  displayDestinations.forEach((d, i) => {
    const departure = d.departure?.trim()
    const id = departure ? `salida-${departure}` : 'salida-otros'
    let group = departureGroups.find((g) => g.id === id)
    if (!group) {
      group = {
        id,
        tone: 'salida',
        icon: 'far fa-map-marker-alt',
        label: departure || t.others,
        title: departure ? t.leavingFrom(departure) : t.otherTours,
        items: [],
      }
      departureGroups.push(group)
    }
    group.items.push({
      key: String(d.link || d.title || i),
      href: to(getTourDetailHref(d)),
      tag: cards.tagTour,
      noPriceText: cards.moreInfo,
      title: d.title,
      image: d.image,
      badge: d.badge,
      description: tourCardSubtitle(d),
      departureDate: d.departureDate,
      duration: d.duration,
      price: d.price,
    })
  })

  return (
    <React.Fragment>
      <Header />
      <main>


        {hasDataFromStrapi ? (
          <section className="listing-page pb-160">
            <PageIntro
              art="tours"
              title={t.title}
              intro={t.intro}
            />
            <div className="container">
              <CardsExplorer
                noun={dict.explorer.nounTours}
                searchPlaceholder={t.search}
                filterLabel={t.filter}
                groups={departureGroups}
              />
            </div>
          </section>
        ) : (
          <section className="contact-section pt-220 pb-220">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                  <div className="section-title mb-70 wow fadeInDown">
                    <i className="fas fa-map-marked-alt mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                    <span className="sub-title">{c.unavailable}</span>
                    <h2>{c.noTours}</h2>
                    <p className="mt-40">
                      {c.noToursText}
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
