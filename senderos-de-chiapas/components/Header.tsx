'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Preloader from './Preloader'
import { WhatsAppIcon } from './WhatsAppIcon'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])
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
      <header className={`header-area header-one ${isHome ? 'transparent-header' : 'header-static'}`}>
        <div className="header-navigation navigation-white">
          <div
            className={`nav-overlay ${menuOpen ? 'active' : ''}`}
            onClick={closeMenu}
            onKeyDown={(e) => e.key === 'Enter' && closeMenu()}
            role="button"
            tabIndex={0}
            aria-label="Cerrar menú"
          />
          <div className="container-fluid">
            <div className="primary-menu">
              {/* Site Branding */}
              <div className="site-branding">
                <Link href="/" className="brand-logo">
                  <img src="/assets/images/logo/logo-senderos.svg" alt="Site Logo" />
                </Link>
              </div>

              {/* Nav Menu */}
              <div className={`nav-menu ${menuOpen ? 'menu-on' : ''}`}>
                <div className="mobile-logo mb-30 d-block d-xl-none">
                  <Link href="/" className="brand-logo">
                    <img src="/assets/images/logo/logo-senderos.svg" alt="Site Logo" />
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
                      <Link href="/tours" onClick={closeMenu}>Tours</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/paquetes" onClick={closeMenu}>Paquetes</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/internacional" onClick={closeMenu}>Internacional</Link>
                    </li>
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
                      <Link href="/experiencias" onClick={closeMenu}>Experiencias</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/nosotros" onClick={closeMenu}>Nosotros</Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/contacto" onClick={closeMenu}>Contáctanos</Link>
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

                {/* Menu Button */}
                <div className="menu-button mt-40 d-xl-none">
                  <a
                    href={`https://wa.me/529613629724?text=${encodeURIComponent('¿Hola, en qué podemos ayudarte?')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="main-btn secondary-btn"
                    onClick={closeMenu}
                  >
                    Contáctanos<WhatsAppIcon className="whatsapp-icon" />
                  </a>
                </div>
              </div>

              {/* Nav Right Item */}
              <div className="nav-right-item">
                <div className="menu-button d-xl-block d-none">
                  <a
                    href={`https://wa.me/529613629724?text=${encodeURIComponent('¿Hola, en qué podemos ayudarte?')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="main-btn primary-btn"
                  >
                    Contáctanos<WhatsAppIcon className="whatsapp-icon" />
                  </a>
                </div>
                <button
                  type="button"
                  className={`navbar-toggler ${menuOpen ? 'active' : ''}`}
                  onClick={toggleMenu}
                  aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
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

