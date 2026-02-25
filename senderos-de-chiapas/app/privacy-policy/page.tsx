import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidad - Senderos de Chiapas',
  description: 'Conoce cómo Senderos de Chiapas protege y utiliza tu información personal.',
}

export default function PrivacyPolicy() {
  return (
    <>
      <Header />

      {/* Page Content */}
      <section className="contact-section pt-100 pb-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="section-title mb-50 wow fadeInDown">
                <span className="sub-title">Legal</span>
                <h2>Política de Privacidad</h2>
              </div>

              <div className="privacy-content wow fadeInUp">
                <p className="mb-30">
                  Última actualización: Febrero 2026. En <strong>Senderos de Chiapas</strong> nos comprometemos a proteger tu privacidad. Esta política describe cómo recopilamos, utilizamos y resguardamos tu información personal.
                </p>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">1. Información que recopilamos</h3>
                  <p>
                    Podemos recopilar información que nos proporcionas directamente cuando:
                  </p>
                  <ul className="mb-20" style={{ paddingLeft: '24px', marginTop: '12px' }}>
                    <li className="mb-10">Te registras o te contactas a través de nuestro sitio web, correo o teléfono.</li>
                    <li className="mb-10">Reservas tours, paquetes o servicios turísticos.</li>
                    <li className="mb-10">Te suscribes a nuestro newsletter o promociones.</li>
                    <li className="mb-10">Participas en encuestas o comunicaciones con nosotros.</li>
                  </ul>
                  <p>
                    Esta información puede incluir: nombre, correo electrónico, teléfono, dirección, datos de pago (cuando aplique) e información sobre tus preferencias de viaje.
                  </p>
                </div>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">2. Uso de la información</h3>
                  <p>
                    Utilizamos tu información para:
                  </p>
                  <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                    <li className="mb-10">Procesar reservas y gestionar los servicios contratados.</li>
                    <li className="mb-10">Enviarte confirmaciones, itinerarios e información relevante de tus viajes.</li>
                    <li className="mb-10">Responder a tus consultas y brindarte atención al cliente.</li>
                    <li className="mb-10">Enviarte promociones y novedades (si has dado tu consentimiento).</li>
                    <li className="mb-10">Mejorar nuestros servicios y la experiencia en nuestro sitio web.</li>
                    <li className="mb-10">Cumplir obligaciones legales o regulatorias.</li>
                  </ul>
                </div>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">3. Protección de datos</h3>
                  <p>
                    Implementamos medidas técnicas y organizativas para proteger tu información contra acceso no autorizado, pérdida o alteración. Tus datos se almacenan de forma segura y solo el personal autorizado tiene acceso a ellos cuando es necesario para prestar nuestros servicios.
                  </p>
                </div>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">4. Cookies y tecnología similar</h3>
                  <p>
                    Nuestro sitio web puede utilizar cookies y tecnologías similares para mejorar la navegación, analizar el uso del sitio y personalizar el contenido. Puedes configurar tu navegador para rechazar cookies, aunque esto podría afectar algunas funcionalidades.
                  </p>
                </div>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">5. Compartir información</h3>
                  <p>
                    No vendemos tu información personal. Solo compartimos datos con terceros cuando es necesario para cumplir con los servicios contratados (por ejemplo, proveedores de transporte o hospedaje), o cuando la ley lo requiere. En estos casos, exigimos que mantengan la confidencialidad de la información.
                  </p>
                </div>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">6. Tus derechos</h3>
                  <p>
                    De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), tienes derecho a:
                  </p>
                  <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                    <li className="mb-10">Conocer qué datos tenemos de ti y cómo los utilizamos.</li>
                    <li className="mb-10">Acceder, rectificar o suprimir tu información cuando corresponda.</li>
                    <li className="mb-10">Oponerte al tratamiento de tus datos para fines específicos.</li>
                    <li className="mb-10">Revocar tu consentimiento en cualquier momento.</li>
                  </ul>
                  <p className="mt-20">
                    Para ejercer estos derechos, contáctanos a <a href="mailto:reservas@senderosdechiapas.com.mx" style={{ color: '#63ab45' }}>reservas@senderosdechiapas.com.mx</a> o al teléfono <a href="tel:+529613629724" style={{ color: '#63ab45' }}>961 362 9724</a>.
                  </p>
                </div>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">7. Retención de datos</h3>
                  <p>
                    Conservamos tu información durante el tiempo necesario para cumplir con los fines descritos en esta política y para atender obligaciones legales, fiscales o contables. Una vez finalizado ese periodo, los datos se eliminan o anonimizan de forma segura.
                  </p>
                </div>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">8. Menores de edad</h3>
                  <p>
                    Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información de menores. Si eres padre o tutor y consideras que tu hijo nos ha proporcionado datos personales, contáctanos para solicitar su eliminación.
                  </p>
                </div>

                <div className="privacy-block mb-45">
                  <h3 className="title mb-20">9. Cambios a esta política</h3>
                  <p>
                    Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Los cambios serán publicados en esta página con la fecha de última actualización. Te recomendamos revisarla periódicamente.
                  </p>
                </div>

                <div className="privacy-block">
                  <h3 className="title mb-20">10. Contacto</h3>
                  <p>
                    Para cualquier duda sobre esta política o el tratamiento de tus datos personales:
                  </p>
                  <p className="mt-15 mb-0">
                    <strong>Senderos de Chiapas</strong><br />
                    Calle 2a. Ote. Sur 182, San Marcos.<br />
                    Tuxtla Gutiérrez, Chiapas.<br />
                    Email: <a href="mailto:reservas@senderosdechiapas.com.mx" style={{ color: '#63ab45' }}>reservas@senderosdechiapas.com.mx</a><br />
                    Teléfono: <a href="tel:+529613629724" style={{ color: '#63ab45' }}>961 362 9724</a>
                  </p>
                </div>

                <div className="mt-50 text-center">
                  <Link href="/" className="main-btn primary-btn">
                    Volver al inicio<i className="far fa-paper-plane"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
