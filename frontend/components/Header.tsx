'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Preloader from './Preloader'
import { WhatsAppIcon } from './WhatsAppIcon'
import { whatsappHref } from '@/lib/contact'
import { switchLangPath } from '@/lib/i18n'
import { useDict, useLang, useLocalizePath } from './LangProvider'

export default function Header() {
  const pathname = usePathname()
  const lang = useLang()
  const t = useDict().nav
  const to = useLocalizePath()
  const isHome = pathname === '/' || pathname === '/en'
  // El botón lleva a esta misma página en el otro idioma
  const otherLang = lang === 'es' ? 'en' : 'es'
  const switchHref = switchLangPath(pathname, otherLang)
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  // Al pasar 100px de scroll el tema vuelve fijo el menú (.sticky) y el header deja de ocupar espacio:
  // la página brincaba hacia arriba. El header guarda la altura del menú para que el contenido no se mueva.
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const header = headerRef.current
    const nav = header?.querySelector<HTMLElement>('.header-navigation')
    if (!header || !nav || isHome) return
    const keepHeight = () => {
      if (nav.classList.contains('sticky')) return
      header.style.minHeight = `${nav.offsetHeight}px`
      // Altura del menú fijo, para que los saltos a una sección (#ancla) no queden debajo de él
      document.documentElement.style.setProperty('--header-h', `${nav.offsetHeight}px`)
    }
    keepHeight()
    const observer = new ResizeObserver(keepHeight)
    observer.observe(nav)
    return () => {
      observer.disconnect()
      header.style.minHeight = ''
    }
  }, [isHome])
  return (
    <>
      {/* Preloader */}
      <Preloader />

      {/* Search Modal */}
      {/* <div className="modal fade search-modal" id="search-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form>
              <div className="form_group">
                <input type="search" className="form_control" placeholder="Search here" name="search" />
                <label><i className="fa fa-search"></i></label>
              </div>
            </form>
          </div>
        </div>
      </div> */}

      {/* Header */}
      <header ref={headerRef} className={`header-area header-one ${isHome ? 'transparent-header' : 'header-static'}`}>
        <div className="header-navigation navigation-white">
          <div
            className={`nav-overlay ${menuOpen ? 'active' : ''}`}
            onClick={closeMenu}
            onKeyDown={(e) => e.key === 'Enter' && closeMenu()}
            role="button"
            tabIndex={0}
            aria-label={t.closeMenu}
          />
          <div className="container-fluid">
            <div className="primary-menu">
              {/* Site Branding */}
              <div className="site-branding">
                <Link href={to('/')} className="brand-logo">
                  <img src="/assets/images/logo/logo-senderos.svg" alt="Senderos de Chiapas" width={150} height={52} />
                </Link>
              </div>

              {/* Nav Menu */}
              <div className={`nav-menu ${menuOpen ? 'menu-on' : ''}`}>
                <div className="mobile-logo mb-30 d-block d-xl-none">
                  <Link href={to('/')} className="brand-logo">
                    <img src="/assets/images/logo/logo-senderos.svg" alt="Senderos de Chiapas" width={150} height={52} />
                  </Link>
                </div>

                {/* Nav Search */}
                {/* <div className="nav-search mb-30 d-block d-xl-none">
                  <form>
                    <div className="form_group">
                      <input type="email" className="form_control" placeholder="Search Here" name="email" required />
                      <button className="search-btn"><i className="fas fa-search"></i></button>
                    </div>
                  </form>
                </div> */}

                {/* Main Menu */}
                <nav className="main-menu">
                  <ul>
                    {/* <li className="menu-item has-children">
                      <a href="#">Home</a>
                      <ul className="sub-menu">
                        <li><Link href="/" onClick={closeMenu}>Home 01</Link></li>
                        <li><Link href="/index-2" onClick={closeMenu}>Home 02</Link></li>
                        <li><Link href="/index-3" onClick={closeMenu}>Home 03</Link></li>
                        <li><Link href="/index-4" onClick={closeMenu}>Home 04</Link></li>
                      </ul>
                    </li> */}
                    <li className="menu-item">
                      <Link href={to('/tours')} onClick={closeMenu}>{t.tours}</Link>
                    </li>
                    <li className="menu-item">
                      <Link href={to('/paquetes')} onClick={closeMenu}>{t.packages}</Link>
                    </li>
                    {/* <li className="menu-item">
                      <Link href="/internacional" onClick={closeMenu}>Internacional</Link>
                    </li> */}
                    {/* <li className="menu-item has-children">
                      <a href="#">Destinos Info</a>
                      <ul className="sub-menu">
                        <li><Link href="/destino-detalles/chiapas">Destinos Info</Link></li>
                        <li><Link href="/destino-detalles/chiapas">Detalles de Destino</Link></li>
                      </ul>
                    </li> */}
                    {/* <li className="menu-item has-children">
                      <a href="#">Destination</a>
                      <ul className="sub-menu">
                        <li><Link href="/tours">Destinos</Link></li>
                        <li><Link href="/tour-detalles">Tour Details</Link></li>
                      </ul>
                    </li> */}
                    <li className="menu-item">
                      <Link href={to('/experiencias')} onClick={closeMenu}>{t.gallery}</Link>
                    </li>
                    <li className="menu-item">
                      <Link href={to('/nosotros')} onClick={closeMenu}>{t.about}</Link>
                    </li>
                    <li className="menu-item">
                      <Link href={to('/contacto')} onClick={closeMenu}>{t.contact}</Link>
                    </li>
                    {/* <li className="menu-item has-children">
                      <a href="#">Blog</a>
                      <ul className="sub-menu">
                        <li><Link href="/blog-list">Blog List</Link></li>
                        <li><Link href="/blog-details">Blog Details</Link></li>
                      </ul>
                    </li> */}
                    {/* <li className="menu-item has-children">
                      <a href="#">Pages</a>
                      <ul className="sub-menu">
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/gallery">Our Gallery</Link></li>
                        <li><Link href="/events">Our Events</Link></li>
                        <li><Link href="/shop">Our Shop</Link></li>
                        <li><Link href="/product-details">Product Details</Link></li>
                        <li><Link href="/contacto">Contact</Link></li>
                      </ul>
                    </li> */}
                    {/* <li className="menu-item search-item">
                      <div className="search-btn" data-bs-toggle="modal" data-bs-target="#search-modal">
                        <i className="far fa-search"></i>
                      </div>
                    </li> */}
                  </ul>
                </nav>

                {/* Idioma (móvil, dentro del menú) */}
                <div className="lang-switch-mobile mt-30 d-xl-none">
                  <Link href={switchHref} hrefLang={otherLang} className="lang-switch" aria-label={t.switchAria} onClick={closeMenu}>
                    <GlobeIcon />{t.switchLabel}
                  </Link>
                </div>

                {/* Menu Button */}
                <div className="menu-button mt-40 d-xl-none">
                  <a
                    href={whatsappHref(t.whatsappGreeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="main-btn secondary-btn"
                    onClick={closeMenu}
                  >
                    WhatsApp<WhatsAppIcon className="whatsapp-icon" />
                  </a>
                </div>
              </div>

              {/* Nav Right Item */}
              <div className="nav-right-item">
                {/* Idioma (escritorio) */}
                <Link href={switchHref} hrefLang={otherLang} className="lang-switch d-none d-xl-inline-flex" aria-label={t.switchAria}>
                  <GlobeIcon />{t.switchShort}
                </Link>
                <div className="menu-button d-xl-block d-none">
                  <a
                    href={whatsappHref(t.whatsappGreeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="main-btn primary-btn"
                  >
                    WhatsApp<WhatsAppIcon className="whatsapp-icon" />
                  </a>
                </div>
                <button
                  type="button"
                  className={`navbar-toggler ${menuOpen ? 'active' : ''}`}
                  onClick={toggleMenu}
                  aria-label={menuOpen ? t.closeMenu : t.openMenu}
                  aria-expanded={menuOpen}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

/** Globo del botón de idioma (el subconjunto de Font Awesome del sitio no trae fa-globe). */
function GlobeIcon() {
  return (
    <svg className="lang-switch__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  )
}
