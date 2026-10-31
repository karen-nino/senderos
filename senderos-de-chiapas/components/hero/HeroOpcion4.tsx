'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { WhatsAppIcon } from '../WhatsAppIcon'
import {
  getHeroImageAlt,
  getHeroImageUrl,
  getHeroText,
  padIndex,
  type HeroVariantProps,
} from './heroShared'

const WHATSAPP_NUMBER = '529613629724'

/** Opción 4 — Recorrido con scroll: el hero queda fijo y cada tramo de scroll muestra el siguiente destino. */
export default function HeroOpcion4({ slides }: HeroVariantProps) {
  const total = slides.length
  const trackRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  // Avance del recorrido (0 → 1) según cuánto se ha desplazado la pista
  const measure = () => {
    const track = trackRef.current
    const sticky = stickyRef.current
    if (!track || !sticky) return null
    const rect = track.getBoundingClientRect()
    const top = parseFloat(getComputedStyle(sticky).top) || 0
    const distance = rect.height - sticky.offsetHeight
    return { rect, top, distance }
  }

  useEffect(() => {
    if (total < 2) return
    let frame = 0
    const update = () => {
      // El header del tema es absoluto y pasa a fijo al hacer scroll: el bloque se pega justo debajo de él
      const nav = document.querySelector('.header-navigation')
      if (stickyRef.current && nav) {
        stickyRef.current.style.top = `${Math.max(0, nav.getBoundingClientRect().bottom)}px`
      }
      const m = measure()
      if (!m || m.distance <= 0) return
      const p = Math.min(1, Math.max(0, (m.top - m.rect.top) / m.distance))
      setProgress(p)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [total])

  const active = total < 2 ? 0 : Math.round(progress * (total - 1))

  const scrollToStop = (index: number) => {
    const m = measure()
    if (!m) return
    const target = window.scrollY + m.rect.top - m.top + (index / (total - 1)) * m.distance
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' })
  }

  const slide = slides[active] ?? slides[0]
  const { text, ctaText, ctaLink } = getHeroText(slide)
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero cotizar: ${slide.title}`)}`

  return (
    <section className="hero-scroll" aria-label="Destacados">
      <div
        className="hero-scroll__track"
        ref={trackRef}
        style={{ ['--stops' as string]: Math.max(total - 1, 0) }}
      >
        <div className="hero-scroll__sticky" ref={stickyRef}>
          {slides.map((s, index) => (
            <picture
              key={s.id || index}
              className={`hero-scroll__photo ${index === active ? 'is-active' : ''}`}
              aria-hidden={index !== active}
            >
              {s.mobileImage && <source media="(max-width: 767px)" srcSet={getHeroImageUrl(s.mobileImage)} />}
              <img
                src={getHeroImageUrl(s.image)}
                alt={getHeroImageAlt(s.image, s.title)}
                width={1600}
                height={900}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
            </picture>
          ))}

          {total > 1 && (
            <nav className="hero-scroll__rail" aria-label="Destinos del recorrido">
              <span className="hero-scroll__line" aria-hidden>
                <span style={{ transform: `scaleY(${progress})` }} />
              </span>
              <ol>
                {slides.map((s, index) => (
                  <li key={s.id || index}>
                    <button
                      type="button"
                      className={index === active ? 'is-active' : ''}
                      aria-current={index === active ? 'step' : undefined}
                      onClick={() => scrollToStop(index)}
                    >
                      <small>{padIndex(index + 1)}</small>
                      <span>{s.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="hero-scroll__copy" key={`copy-${active}`} aria-live="polite">
            {active === 0 ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
            {text && <p className="hero-scroll__place">{text}</p>}
            <div className="hero-scroll__ctas">
              {ctaText && ctaLink && (
                <Link href={ctaLink} className="hero-scroll__cta">
                  {ctaText}
                  <span className="hero-scroll__cta-icon" aria-hidden>
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </Link>
              )}
              <a href={whatsappHref} className="hero-scroll__wa" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="hero-scroll__wa-icon" aria-hidden />
                Cotizar por WhatsApp
              </a>
            </div>
          </div>

          {total > 1 && (
            <div className={`hero-scroll__hint ${active === total - 1 ? 'is-last' : ''}`} aria-hidden>
              <span className="hero-scroll__mouse" />
              {active === total - 1 ? 'Sigue bajando' : 'Desliza para recorrer'}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
