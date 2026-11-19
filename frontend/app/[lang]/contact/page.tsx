import type { Metadata } from 'next'
import { pageAlternates, type Lang } from '@/lib/i18n'
import { getDictionary } from '@/lib/dictionaries'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import { PHONE_DISPLAY_INTL, PHONE_TEL_HREF } from '@/lib/contact'

export function generateMetadata({ params }: { params: { lang: Lang } }): Metadata {
  const t = getDictionary(params.lang).contactPage
  return { title: t.metaTitle, description: t.metaDescription, alternates: pageAlternates(params.lang, '/contacto') }
}

export default function Contact({ params }: { params: { lang: Lang } }) {
  const { lang } = params
  const t = getDictionary(lang).contactPage
  return (
    <>
      <Header />
      <main>

        {/* Contact Section */}
        <section className="contact-section pt-100 pb-100">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="contact-form-wrapper mb-180">
                  <div className="section-title mb-40">
                    <span className="sub-title">{t.formSub}</span>
                    <h2>{t.formTitle}</h2>
                  </div>
                  <ContactForm />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="contact-info-wrapper mb-50">
                  <div className="section-title mb-40">
                    <span className="sub-title">{t.infoSub}</span>
                    <h2>{t.infoTitle}</h2>
                  </div>
                  <div className="contact-info-item mb-30">
                    <div className="icon">
                      <i className="far fa-map-marker-alt"></i>
                    </div>
                    <div className="info">
                      <span className="title">{t.address}</span>
                      <p>Calle 2a. Ote. Sur 182, San Marcos. <br />Tuxtla Gutiérrez, Chiapas.</p>
                    </div>
                  </div>
                  <div className="contact-info-item mb-30">
                    <div className="icon">
                      <i className="far fa-envelope-open"></i>
                    </div>
                    <div className="info">
                      <span className="title">{t.email}</span>
                      <p><a href="mailto:reservas@senderosdechiapas.com.mx">reservas@senderosdechiapas.com.mx</a></p>
                    </div>
                  </div>
                  <div className="contact-info-item mb-30">
                    <div className="icon">
                      <i className="far fa-phone-plus"></i>
                    </div>
                    <div className="info">
                      <span className="title">{t.phone}</span>
                      <p><a href={PHONE_TEL_HREF}>{PHONE_DISPLAY_INTL}</a></p>
                    </div>
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

