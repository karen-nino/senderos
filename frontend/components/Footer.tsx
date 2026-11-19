'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PHONE_DISPLAY, PHONE_TEL_HREF } from '@/lib/contact'
import { useDict, useLocalizePath } from './LangProvider'

export default function Footer() {
  const pathname = usePathname()
  const isHomePage = pathname === '/' || pathname === '/en'
  const t = useDict().footer
  const to = useLocalizePath()

  return (
    <>
      <footer className={`main-footer black-bg ${isHomePage ? 'pt-230' : 'pt-80'}`}>

        <div className="container">
          {/* Footer Top */}
          <div className="footer-top pt-40 wow fadeInUp">
            <div className="row">
              <div className="col-lg-3 col-sm-6">
                <div className="single-info-item mb-40">
                  <div className="icon">
                    <i className="far fa-map-marker-alt"></i>
                  </div>
                  <div className="info">
                    <span className="title">{t.office}</span>
                    <p>Calle 2a. Ote. Sur 182, San Marcos. Tuxtla Gutiérrez, Chiapas.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6">
                <div className="single-info-item mb-40">
                  <div className="icon">
                    <i className="far fa-phone"></i>
                  </div>
                  <div className="info">
                    <span className="title">{t.phone}</span>
                    <p><a href={PHONE_TEL_HREF}>{PHONE_DISPLAY}</a></p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6">
                <div className="single-info-item mb-40">
                  <div className="icon">
                    <i className="far fa-envelope-open"></i>
                  </div>
                  <div className="info">
                    <span className="title">{t.email}</span>
                    <p><a href="mailto:reservas@senderosdechiapas.com.mx">reservas@senderosdechiapas.com.mx</a></p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6">
                <div className="social-box mb-40 float-lg-end">
                  <ul className="social-link">
                    <li><a href="https://www.facebook.com/senderos.chiapas.3" aria-label={t.facebookAria}><i className="fab fa-facebook-f" aria-hidden="true"></i></a></li>
                    <li style={{ marginLeft: '5px' }}><a href="https://www.instagram.com/senderos_dechiapas" aria-label={t.instagramAria}><i className="fab fa-instagram" aria-hidden="true"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Widget */}
          <div className="footer-widget-area pt-75 pb-30">
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="footer-widget about-company-widget mb-40 wow fadeInUp">
                  <h4 className="widget-title">{t.aboutTitle}</h4>
                  <div className="footer-content">
                    <p>{t.aboutText}</p>
                    <a href="#" className="footer-logo">
                      <img src="/assets/images/logo/logo-senderos.svg" alt="Site Logo" width={150} height={52} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-lg-5 col-md-6">
                <div className="footer-widget service-nav-widget mb-40 pl-lg-70 wow fadeInDown">
                  <h4 className="widget-title">{t.servicesTitle}</h4>
                  <div className="footer-content">
                    <ul className="footer-widget-nav">
                      <li><a href={to('/tours')}>{t.tours}</a></li>
                      <li><a href={to('/paquetes')}>{t.packages}</a></li>
                      <li><a href={to('/internacional')}>{t.international}</a></li>
                      <li><Link href={to('/nosotros')}>{t.about}</Link></li>
                    </ul>
                    <ul className="footer-widget-nav">
                      <li><a href={to('/preguntas-frecuentes')}>{t.faq}</a></li>
                      <li><a href={to('/contacto')}>{t.contact}</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* <div className="col-lg-4 col-md-6">
                <div className="footer-widget footer-newsletter-widget mb-40 pl-lg-100 wow fadeInUp">
                  <h4 className="widget-title">Newsletter</h4>
                  <div className="footer-content">
                    <p>Which of us ever undertake laborious
                      physical exercise except obtain</p>
                    <form>
                      <div className="form_group">
                        <label><i className="far fa-paper-plane"></i></label>
                        <input type="email" className="form_control" placeholder="Email Address" name="email" required />
                      </div>
                    </form>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="footer-copyright">
            <div className="row">
              <div className="col-lg-6">
                <div className="footer-text">
                  <p>@2026 <span style={{ color: '#F7921E' }}>Senderos de Chiapas</span>, {t.rights}</p>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="footer-nav float-lg-end">
                  <ul>
                    <li><Link href={to('/politica-de-privacidad')}>{t.privacy}</Link></li>
                    {/* <li><Link href="/preguntas-frecuentes">Preguntas Frecuentes</Link></li>
                    <li><Link href="/contacto">Contacto</Link></li> */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back To Top */}
      <a href="#" className="back-to-top"><i className="far fa-angle-up"></i></a>
    </>
  )
}

