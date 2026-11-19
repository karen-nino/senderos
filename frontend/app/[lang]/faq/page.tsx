import type { Metadata } from 'next'
import Header from '@/components/Header'
import { localizePath, pageAlternates, type Lang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { fetchFaqPageData, STRAPI_REVALIDATE_SECONDS, type FaqItem } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const t = getDictionary(params.lang).faqPage
  return { title: t.metaTitle, description: t.metaDescription, alternates: pageAlternates(params.lang, '/preguntas-frecuentes') }
}

export default async function FAQ({ params }: { params: { lang: Lang } }) {
  const { lang } = params
  const to = (path: string) => localizePath(lang, path)
  const t = getDictionary(lang).faqPage
  const items: FaqItem[] = await fetchFaqPageData(lang)
  return (
    <>
      <Header />
      <main>

        <section className="contact-section pt-100 pb-100">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="section-title mb-50 wow fadeInDown">
                  <span className="sub-title">{t.sub}</span>
                  <h2>{t.title}</h2>
                  <p className="mt-20">{t.intro}</p>
                </div>

                <div className="accordion faq-accordion wow fadeInUp" id="faqAccordion">
                  {items.map((item, index) => (
                    <div key={item.id} className="accordion-item">
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#${item.id}`}
                          aria-expanded={index === 0}
                          aria-controls={item.id}
                        >
                          {item.question}
                        </button>
                      </h2>
                      <div
                        id={item.id}
                        className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                        data-bs-parent="#faqAccordion"
                      >
                        <div className="accordion-body">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="faq-cta mt-50 text-center wow fadeInUp">
                  <p className="mb-25">{t.notFound}</p>
                  <Link href={to('/contacto')} className="main-btn primary-btn">
                    {getDictionary(lang).common.contactUs}<i className="far fa-paper-plane"></i>
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
