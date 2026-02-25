import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { fetchFaqPageData, STRAPI_REVALIDATE_SECONDS, type FaqItem } from '@/lib/strapi'

export const revalidate = STRAPI_REVALIDATE_SECONDS

export const metadata = {
  title: 'Preguntas Frecuentes - Senderos de Chiapas',
  description: 'Respuestas a las preguntas más comunes sobre nuestros tours, paquetes y servicios turísticos en Chiapas.',
}

const FALLBACK_FAQ_ITEMS: FaqItem[] = [
  { id: 'faq1', question: '¿Cómo puedo reservar un tour o paquete?', answer: 'Puedes reservar a través de nuestro sitio web, por teléfono al 961 362 9724, por WhatsApp o enviando un correo a reservas@senderosdechiapas.com.mx. Te responderemos a la brevedad con toda la información y opciones de pago.' },
  { id: 'faq2', question: '¿Qué formas de pago aceptan?', answer: 'Aceptamos transferencia bancaria, depósito en efectivo y en algunas rutas pago con tarjeta. Al confirmar tu reserva te indicaremos las opciones disponibles para tu paquete específico.' },
  { id: 'faq3', question: '¿Cuál es la política de cancelación?', answer: 'Las condiciones varían según el tipo de tour o paquete. Por lo general, las cancelaciones con más de 48 horas de anticipación pueden aplicar a reprogramación o reembolso parcial. Para detalles específicos, consulta al reservar o contacta a nuestro equipo.' },
  { id: 'faq4', question: '¿Incluyen transporte en los tours?', answer: 'Sí, la mayoría de nuestros tours incluyen transporte desde puntos de encuentro establecidos. Te indicaremos el lugar y hora de salida al confirmar tu reserva. Algunos paquetes pueden incluir traslados desde tu alojamiento según la ruta.' },
  { id: 'faq5', question: '¿Puedo modificar mi reserva?', answer: 'Sí, siempre que exista disponibilidad. Te pedimos que nos contactes lo antes posible para hacer los cambios necesarios. Pueden aplicar condiciones según la fecha del viaje y el tipo de modificación.' },
  { id: 'faq6', question: '¿Qué debo llevar para un tour?', answer: 'Te recomendamos ropa cómoda, calzado adecuado para caminata, protector solar, repelente de insectos, y en temporada de lluvias una chamarra ligera. Para rutas específicas (como cascadas o zonas arqueológicas) te daremos recomendaciones detalladas.' },
  { id: 'faq7', question: '¿Ofrecen tours privados o personalizados?', answer: 'Sí, podemos diseñar experiencias a tu medida según tus intereses, fechas y presupuesto. Contáctanos para platicar sobre tu idea de viaje y te proponemos opciones personalizadas.' },
  { id: 'faq8', question: '¿Tienen paquetes internacionales?', answer: 'Sí, además de los destinos en Chiapas y México, ofrecemos paquetes a destinos internacionales. Revisa nuestra sección de Viajes Internacionales o escríbenos para conocer las rutas disponibles.' },
]

export default async function FAQ() {
  let items: FaqItem[] = await fetchFaqPageData()
  if (items.length === 0) items = FALLBACK_FAQ_ITEMS
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
