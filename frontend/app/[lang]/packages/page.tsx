import type { Metadata } from 'next'
import { localizePath, pageAlternates, type Lang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CardsExplorer from '@/components/CardsExplorer'
import PageIntro from '@/components/PageIntro'
import Link from 'next/link'
import { fetchPackagesPageData, fetchSeasonsForPackagesPage, fetchAdventuresForPackagesPage, STRAPI_REVALIDATE_SECONDS, getPackageDetailHref, type AdaptedDestination, type AdaptedSeason } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const t = getDictionary(params.lang).packagesPage
  return { title: t.metaTitle, description: t.metaDescription, alternates: pageAlternates(params.lang, '/paquetes') }
}

const DEFAULT_IMAGE = '/assets/images/place/single-place-1.jpg'

export default async function PackagesPage({ params }: { params: { lang: Lang } }) {
  const { lang } = params
  const to = (path: string) => localizePath(lang, path)
  const dict = getDictionary(lang)
  const t = dict.packagesPage
  const c = dict.common
  const cards = dict.cards
  let packagesList: AdaptedDestination[] = []
  let seasons: AdaptedSeason[] = []
  let adventures: AdaptedSeason[] = []

  try {
    const [data, seasonsData, adventuresData] = await Promise.all([
      fetchPackagesPageData(lang),
      fetchSeasonsForPackagesPage(lang),
      fetchAdventuresForPackagesPage(lang),
    ])
    packagesList = data.packages
    seasons = seasonsData
    adventures = adventuresData
  } catch (error) {
    console.error('Error fetching packages from Strapi:', error)
  }

  const displayPackages = packagesList.filter(
    (pkg) => (pkg.badge || '') !== 'oculto'
  )
  const hasDataFromStrapi =
    displayPackages.length > 0 || seasons.length > 0 || adventures.length > 0

  return (
    <React.Fragment>
      <Header />
      <main>


        {hasDataFromStrapi ? (
          <section className="listing-page pb-160">
            <PageIntro
              art="paquetes"
              title={t.title}
              intro={t.intro}
            />
            <div className="container">
              <CardsExplorer
                groups={[
                  {
                    id: 'temporada',
                    icon: 'far fa-calendar-alt',
                    label: t.seasonLabel,
                    title: t.seasonTitle,
                    subtitle: t.seasonSubtitle,
                    emptyText: t.seasonEmpty,
                    items: seasons.map((season, index) => ({
                      key: season.link || String(index),
                      href: to(getPackageDetailHref(season.link)),
                      tag: cards.tagSeason,
                      title: season.title,
                      image: season.image,
                      badge: season.badge,
                      description: season.category || season.description,
                      departureDate: season.dateFormatted,
                      duration: season.duration,
                      price: season.price,
                    })),
                  },
                  {
                    id: 'aventura',
                    icon: 'fas fa-mountain',
                    label: t.adventureLabel,
                    title: t.adventureTitle,
                    subtitle: t.adventureSubtitle,
                    items: adventures.map((adventure, index) => ({
                      key: adventure.link || String(index),
                      href: to(getPackageDetailHref(adventure.link)),
                      tag: cards.tagAdventure,
                      title: adventure.title,
                      image: adventure.image,
                      badge: adventure.badge,
                      description: adventure.category || adventure.description,
                      departureDate: adventure.dateFormatted,
                      duration: adventure.duration,
                      accommodation: adventure.accommodation,
                      price: adventure.price,
                    })),
                  },
                  {
                    id: 'paquetes',
                    icon: 'fas fa-suitcase-rolling',
                    label: t.classicLabel,
                    title: t.classicTitle,
                    subtitle: t.classicSubtitle,
                    items: displayPackages.map((pkg, i) => ({
                      key: String(pkg.slug || pkg.title || i),
                      href: to(pkg.slug ? `/paquete-detalles/${pkg.slug}` : (pkg.link || '/paquetes')),
                      tag: cards.tagClassic,
                      title: pkg.title,
                      image: pkg.image && !pkg.image.includes('las-tres-tzimoleras') ? pkg.image : DEFAULT_IMAGE,
                      badge: pkg.badge,
                      description: pkg.route ? undefined : pkg.description,
                      departureDate: pkg.departureDate,
                      duration: pkg.duration,
                      route: pkg.route,
                      price: pkg.price,
                    })),
                  },
                ]}
              />
            </div>
          </section>
        ) : (
          <section className="contact-section pt-220 pb-220">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                  <div className="section-title mb-70 wow fadeInDown">
                    <i className="fas fa-suitcase mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                    <span className="sub-title">{c.unavailable}</span>
                    <h2>{c.noPackages}</h2>
                    <p className="mt-40">
                      {c.noPackagesText}
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
