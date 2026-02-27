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
                <i className="fas fa-tools mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                <span className="sub-title">Error 404</span>
                <h2>Esta página está en mantenimiento</h2>
                <p className="mt-40">
                  Estaremos de vuelta pronto. Contáctanos si necesitas más información.
                </p>
              </div>
              <div className="d-flex flex-wrap justify-content-center gap-3">
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
