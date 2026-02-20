import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export default function Contact() {
  return (
    <>
      <Header />

      {/* Contact Section */}
      <section className="contact-section pt-100 pb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="contact-form-wrapper mb-50">
                <div className="section-title mb-40">
                  <span className="sub-title">Contáctanos</span>
                  <h2>Mándanos un mensaje</h2>
                </div>
                <ContactForm />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="contact-info-wrapper mb-50">
                <div className="section-title mb-40">
                  <span className="sub-title">Información</span>
                  <h2>Datos de contacto</h2>
                </div>
                <div className="contact-info-item mb-30">
                  <div className="icon">
                    <i className="far fa-map-marker-alt"></i>
                  </div>
                  <div className="info">
                    <span className="title">Dirección</span>
                    <p>Calle 2a. Ote. Sur 182, San Marcos. <br />Tuxtla Gutiérrez, Chiapas.</p>
                  </div>
                </div>
                <div className="contact-info-item mb-30">
                  <div className="icon">
                    <i className="far fa-envelope-open"></i>
                  </div>
                  <div className="info">
                    <span className="title">Email</span>
                    <p><a href="mailto:reservas@senderosdechiapas.com.mx">reservas@senderosdechiapas.com.mx</a></p>
                  </div>
                </div>
                <div className="contact-info-item mb-30">
                  <div className="icon">
                    <i className="far fa-phone-plus"></i>
                  </div>
                  <div className="info">
                    <span className="title">Teléfono</span>
                    <p><a href="tel:+529613629724">+52 961 362 9724</a></p>
                  </div>
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

