'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useDict, useLocalizePath } from '@/components/LangProvider'

// Cliente: not-found no recibe el idioma de la URL; lo toma del LangProvider del layout
export default function NotFound() {
  const to = useLocalizePath()
  const c = useDict().common
  return (
    <>
      <Header />
      <section className="contact-section pt-220 pb-220">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="section-title mb-70 wow fadeInDown">
                <i className="fas fa-tools mb-30 d-block" style={{ color: '#63ab45', fontSize: '3.5rem' }} aria-hidden />
                <span className="sub-title">{c.notFound}</span>
                <h2>{c.maintenanceTitle}</h2>
                <p className="mt-40">
                  {c.maintenanceBack}
                </p>
              </div>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link href={to('/contacto')} className="main-btn primary-btn wow fadeInUp" style={{ padding: '16px 45px' }}>
                  {c.contactUs}
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
