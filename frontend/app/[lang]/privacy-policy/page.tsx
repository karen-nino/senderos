import type { Metadata } from 'next'
import Header from '@/components/Header'
import { localizePath, pageAlternates, type Lang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { PHONE_DISPLAY, PHONE_TEL_HREF } from '@/lib/contact'

const EMAIL = 'reservas@senderosdechiapas.com.mx'

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const t = getDictionary(params.lang).privacyPage
  return { title: t.metaTitle, description: t.metaDescription, alternates: pageAlternates(params.lang, '/politica-de-privacidad') }
}

export default function PrivacyPolicy({ params }: { params: { lang: Lang } }) {
  const { lang } = params
  const to = (path: string) => localizePath(lang, path)
  const t = getDictionary(lang).privacyPage
  return (
    <>
      <Header />
      <main>

        {/* Page Content */}
        <section className="contact-section pt-100 pb-100">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="section-title mb-50 wow fadeInDown">
                  <span className="sub-title">{t.sub}</span>
                  <h2>{t.title}</h2>
                </div>

                <div className="privacy-content wow fadeInUp">
                  <p className="mb-30">
                    {t.introBefore}<strong>Senderos de Chiapas</strong>{t.introAfter}
                  </p>

                  {t.sections.map((section, i) => (
                    <div key={section.title} className={`privacy-block${i < t.sections.length - 1 ? ' mb-45' : ''}`}>
                      <h3 className="title mb-20">{section.title}</h3>
                      <p>{section.intro}</p>
                      {section.list && (
                        <ul className={section.outro ? 'mb-20' : undefined} style={{ paddingLeft: '24px', marginTop: '12px' }}>
                          {section.list.map((item) => <li key={item} className="mb-10">{item}</li>)}
                        </ul>
                      )}
                      {section.outro && <p>{section.outro}</p>}
                      {section.rightsContact && (
                        <p className="mt-20">
                          {t.rightsContactBefore}<a href={`mailto:${EMAIL}`} style={{ color: '#63ab45' }}>{EMAIL}</a>{t.rightsContactMiddle}<a href={PHONE_TEL_HREF} style={{ color: '#63ab45' }}>{PHONE_DISPLAY}</a>.
                        </p>
                      )}
                      {section.contactBlock && (
                        <p className="mt-15 mb-0">
                          <strong>Senderos de Chiapas</strong><br />
                          Calle 2a. Ote. Sur 182, San Marcos.<br />
                          Tuxtla Gutiérrez, Chiapas.<br />
                          {t.emailLabel}: <a href={`mailto:${EMAIL}`} style={{ color: '#63ab45' }}>{EMAIL}</a><br />
                          {t.phoneLabel}: <a href={PHONE_TEL_HREF} style={{ color: '#63ab45' }}>{PHONE_DISPLAY}</a>
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="mt-50 text-center">
                    <Link href={to('/')} className="main-btn primary-btn">
                      {t.back}<i className="far fa-paper-plane"></i>
                    </Link>
                  </div>
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
