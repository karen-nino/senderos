import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { fetchFaqPageData, STRAPI_REVALIDATE_SECONDS, type FaqItem } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export const metadata = {
  title: 'Preguntas Frecuentes - Senderos de Chiapas',
  description: 'Respuestas a las preguntas más comunes sobre nuestros tours, paquetes y servicios turísticos en Chiapas.',
}

export default async function FAQ() {
  const items: FaqItem[] = await fetchFaqPageData()
  return (
    <>
      <Header />

      <section className="contact-section pt-100 pb-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="section-title mb-50 wow fadeInDown">
                <span className="sub-title">Información</span>
                <h2>Preguntas Frecuentes</h2>
                <p className="mt-20">Encuentra respuestas a las dudas más comunes sobre nuestros tours y servicios en Chiapas.</p>
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
                <p className="mb-25">¿No encontraste lo que buscabas?</p>
                <Link href="/contacto" className="main-btn primary-btn">
                  Contáctanos<i className="far fa-paper-plane"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
