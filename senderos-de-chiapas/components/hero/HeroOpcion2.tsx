'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { WhatsAppIcon } from '../WhatsAppIcon'
import {
  HERO_AUTOPLAY_MS,
  getHeroImageAlt,
  getHeroImageUrl,
  getHeroText,
  padIndex,
  useHeroCarousel,
  type HeroVariantProps,
} from './heroShared'

const WHATSAPP_NUMBER = '529613629724'

// El fondo ambiental se desenfoca: en Cloudinary basta una versión pequeña de la imagen
const getAmbientUrl = (url: string) =>
  url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', '/upload/w_400,q_60/')
    : url

// Miniatura para los sellos postales de la variante "mesa"
const getThumbUrl = (url: string) =>
  url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', '/upload/w_240,h_280,c_fill,q_70/')
    : url

/**
 * Fondos del panel:
 * - ambiental: foto del destino activo desenfocada
 * - sendero: verde con curvas de nivel y un sendero punteado hacia las postales
 * - mesa: textil de rombos con sellos postales de los otros destinos
 * - sendero también lleva los sellos, unidos por el sendero punteado
 * - selva: verde selva profundo liso
 * - claro: igual que sendero pero sobre fondo claro #fffbf2 con texto oscuro
 */
export type HeroPostalFondo = 'ambiental' | 'sendero' | 'mesa' | 'selva' | 'claro'

interface HeroOpcion2Props extends HeroVariantProps {
  fondo?: HeroPostalFondo
}

/** Opción 2 — Pila de postales: cada slide es una postal; la de arriba se lanza para dejar ver la siguiente. */
const FONDOS: HeroPostalFondo[] = ['ambiental', 'sendero', 'mesa', 'selva', 'claro']

export default function HeroOpcion2({ slides, fondo: fondoProp = 'claro' }: HeroOpcion2Props) {
  // Solo en desarrollo: ?fondo=sendero|mesa|selva|ambiental para comparar fondos sin tocar código
  const [fondo, setFondo] = useState<HeroPostalFondo>(fondoProp)
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const param = new URLSearchParams(window.location.search).get('fondo') as HeroPostalFondo | null
    setFondo(param && FONDOS.includes(param) ? param : fondoProp)
  }, [fondoProp])

  const total = slides.length
  const { active, paused, goTo, pauseHandlers } = useHeroCarousel(total)

  // La postal que acaba de salir se anima por encima antes de volver al fondo de la pila
  const lastRef = useRef(active)
  const [leaving, setLeaving] = useState<{ index: number; dir: 'next' | 'prev' } | null>(null)
  useEffect(() => {
    const last = lastRef.current
    if (last === active) return
    const dir = (last + 1) % total === active ? 'next' : 'prev'
    setLeaving({ index: dir === 'next' ? last : active, dir })
    lastRef.current = active
  }, [active, total])

  const slide = slides[active] ?? slides[0]
  const { text, ctaText, ctaLink } = getHeroText(slide)
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero cotizar: ${slide.title}`)}`

  return (
    <section
      className={`hero-postal hero-postal--${fondo}`}
      aria-roledescription="carrusel"
      aria-label="Destacados"
      {...pauseHandlers}
    >
      <div className="hero-postal__field">
        {fondo === 'ambiental' && (
          <div className="hero-postal__ambient" aria-hidden>
            {slides.map((s, index) => (
              <img
                key={s.id || index}
                src={getAmbientUrl(getHeroImageUrl(s.image))}
                alt=""
                className={index === active ? 'is-active' : ''}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ))}
          </div>
        )}

        {(fondo === 'sendero' || fondo === 'claro') && (
          <div className="hero-postal__trail" aria-hidden>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 44 104 C 46 96, 50 92, 50 84 C 50 70, 42 60, 44 46 C 45 34, 47 26, 48 20 C 49 14, 53 14, 55 24" />
            </svg>
            <span className="hero-postal__trail-end" />
          </div>
        )}

        {(fondo === 'mesa' || fondo === 'sendero' || fondo === 'claro') && total > 1 && (
          <div className="hero-postal__stamps" aria-hidden>
            {[1, 2].filter((offset) => offset < total).map((offset) => {
              const s = slides[(active + offset) % total]
              return (
                <span key={offset} className={`hero-postal__stamp-deco hero-postal__stamp-deco--${offset}`}>
                  <span className="hero-postal__stamp-paper">
                    <img src={getThumbUrl(getHeroImageUrl(s.image))} alt="" loading="lazy" />
                  </span>
                </span>
              )
            })}
            <svg className="hero-postal__postmark" viewBox="0 0 160 80">
              <circle cx="40" cy="40" r="32" />
              <circle cx="40" cy="40" r="25" />
              <path d="M 80 22 q 10 -6 20 0 t 20 0 t 20 0 M 80 40 q 10 -6 20 0 t 20 0 t 20 0 M 80 58 q 10 -6 20 0 t 20 0 t 20 0" />
            </svg>
          </div>
        )}

        <div className="hero-postal__copy" key={`copy-${active}`} aria-live="polite">
          {active === 0 ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
          {text && <p className="hero-postal__place">{text}</p>}
          <div className="hero-postal__ctas">
            {ctaText && ctaLink && (
              <Link href={ctaLink} className="hero-postal__cta">
                {ctaText}
                <span className="hero-postal__cta-icon" aria-hidden>
                  <i className="fas fa-arrow-right"></i>
                </span>
              </Link>
            )}
            <a href={whatsappHref} className="hero-postal__wa" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="hero-postal__wa-icon" aria-hidden />
              Cotizar por WhatsApp
            </a>
          </div>
        </div>

        {total > 1 && (
          <div className="hero-postal__nav">
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Postal anterior">
              <i className="fal fa-arrow-left" aria-hidden />
            </button>
            <div className="hero-postal__count">
              <span>{padIndex(active + 1)} / {padIndex(total)}</span>
              <span className="hero-postal__progress" aria-hidden>
                <span
                  key={`p-${active}`}
                  className={paused ? 'is-paused' : ''}
                  style={{ ['--hero-autoplay' as string]: `${HERO_AUTOPLAY_MS}ms` }}
                />
              </span>
            </div>
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Postal siguiente">
              <i className="fal fa-arrow-right" aria-hidden />
            </button>
          </div>
        )}

        <div className="hero-postal__stack">
          {slides.map((s, index) => {
            const depth = (index - active + total) % total
            const isTop = depth === 0
            const isLeaving = leaving?.index === index
            const { text: sText } = getHeroText(s)
            return (
              <button
                key={s.id || index}
                type="button"
                className={[
                  'hero-postal__card',
                  `is-depth-${Math.min(depth, 3)}`,
                  isLeaving ? `is-tossed-${leaving?.dir}` : '',
                ].join(' ')}
                style={{ zIndex: total - depth }}
                onClick={() => isTop && total > 1 && goTo(active + 1)}
                onAnimationEnd={() => isLeaving && setLeaving(null)}
                aria-hidden={!isTop}
                tabIndex={isTop && total > 1 ? 0 : -1}
                aria-label={isTop && total > 1 ? `Ver siguiente postal: ${slides[(active + 1) % total].title}` : undefined}
              >
                <picture className="hero-postal__photo">
                  {s.mobileImage && (
                    <source media="(max-width: 767px)" srcSet={getHeroImageUrl(s.mobileImage)} />
                  )}
                  <img
                    src={getHeroImageUrl(s.image)}
                    alt={getHeroImageAlt(s.image, s.title)}
                    width={800}
                    height={700}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    draggable={false}
                  />
                </picture>
                <span className="hero-postal__foot">
                  <span className="hero-postal__foot-text">
                    <strong>{s.title}</strong>
                    {sText && <small>{sText}</small>}
                  </span>
                  <span className="hero-postal__stamp" aria-hidden>{padIndex(index + 1)}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
