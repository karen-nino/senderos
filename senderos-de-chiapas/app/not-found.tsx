import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Header />
      <section className="contact-section pt-220 pb-220">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="section-title mb-70 wow fadeInDown">
                <i className="fas fa-route mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                <span className="sub-title">Error 404</span>
                <h2>Página no encontrada</h2>
                <p className="mt-40">
                  La ruta que buscas no existe o ha sido movida. Puedes regresar al inicio o contactarnos si necesitas ayuda.
                </p>
              </div>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link
                  href="/"
                  className="main-btn wow fadeInUp"
                  style={{ padding: '16px 45px', backgroundColor: 'rgba(99, 171, 69, 0.2)', color: '#63ab45' }}
                >
                  Regresar a Home
                </Link>
                <Link href="/contacto" className="main-btn primary-btn wow fadeInUp" style={{ padding: '16px 45px' }}>
                  Contáctanos
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
