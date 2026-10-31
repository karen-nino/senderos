'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
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

// Siluetas de sierra (ilustrativas), de la más lejana a la más cercana. viewBox 0 0 1440 600.
const RIDGES = [
  {
    name: 'back',
    depth: 0.35,
    d: 'M-80 163 C-62 167 -7 172 30 183 C67 193 103 217 140 225 C177 233 213 231 250 231 C287 231 323 225 360 224 C397 223 433 230 470 224 C507 217 543 205 580 186 C617 167 653 119 690 108 C727 96 763 114 800 116 C837 119 873 123 910 122 C947 121 983 101 1020 110 C1057 118 1093 159 1130 171 C1167 184 1203 176 1240 183 C1277 190 1313 211 1350 213 C1387 214 1423 197 1460 192 C1497 187 1552 184 1570 183 L1600 600 L-80 600Z',
  },
  {
    name: 'mid',
    depth: 0.7,
    d: 'M-80 275 C-58 271 7 260 50 252 C93 244 137 222 180 225 C223 228 267 259 310 269 C353 279 397 277 440 286 C483 296 527 315 570 325 C613 335 657 349 700 347 C743 344 787 319 830 311 C873 302 917 305 960 294 C1003 284 1047 253 1090 245 C1133 238 1177 245 1220 248 C1263 250 1307 256 1350 262 C1393 268 1458 279 1480 283 L1600 600 L-80 600Z',
  },
  {
    name: 'front',
    depth: 1,
    d: 'M-80 323 C-55 317 20 294 70 288 C120 282 170 283 220 286 C270 290 320 294 370 308 C420 322 470 354 520 370 C570 385 620 393 670 399 C720 405 770 409 820 407 C870 404 920 395 970 385 C1020 374 1070 349 1120 345 C1170 341 1220 356 1270 360 C1320 364 1370 360 1420 371 C1470 381 1545 413 1570 421 L1600 600 L-80 600Z',
  },
]

/** Opción 5 — Cordilleras en capas: foto a sangre con siluetas de sierra en verdes de marca y paralaje. */
export default function HeroOpcion5({ slides }: HeroVariantProps) {
  const total = slides.length
  const { active, paused, goTo, pauseHandlers } = useHeroCarousel(total)
  const sectionRef = useRef<HTMLElement>(null)

  // Paralaje con el puntero: cada capa se desplaza según su profundidad (variables CSS, sin re-render)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--ridge-x', x.toFixed(3))
        el.style.setProperty('--ridge-y', y.toFixed(3))
      })
    }
    const onLeave = () => {
      el.style.setProperty('--ridge-x', '0')
      el.style.setProperty('--ridge-y', '0')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const slide = slides[active] ?? slides[0]
  const { text, ctaText, ctaLink } = getHeroText(slide)
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero cotizar: ${slide.title}`)}`

  return (
    <section
      ref={sectionRef}
      className="hero-ridge"
      aria-roledescription="carrusel"
      aria-label="Destacados"
      {...pauseHandlers}
    >
      <div className="hero-ridge__band">
        {slides.map((s, index) => (
          <picture
            key={s.id || index}
            className={`hero-ridge__photo ${index === active ? 'is-active' : ''}`}
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

        {RIDGES.map((r) => (
          <svg
            key={r.name}
            className={`hero-ridge__layer hero-ridge__layer--${r.name}`}
            style={{ ['--depth' as string]: r.depth }}
            viewBox="0 0 1440 600"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={r.d} />
          </svg>
        ))}

        <div className="hero-ridge__copy" key={`copy-${active}`} aria-live="polite">
          {active === 0 ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
          {text && <p className="hero-ridge__place">{text}</p>}
          <div className="hero-ridge__ctas">
            {ctaText && ctaLink && (
              <Link href={ctaLink} className="hero-ridge__cta">
                {ctaText}
                <span className="hero-ridge__cta-icon" aria-hidden>
                  <i className="fas fa-arrow-right"></i>
                </span>
              </Link>
            )}
            <a href={whatsappHref} className="hero-ridge__wa" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="hero-ridge__wa-icon" aria-hidden />
              Cotizar por WhatsApp
            </a>
          </div>
        </div>

        {total > 1 && (
          <div className="hero-ridge__nav">
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Destino anterior">
              <i className="fal fa-arrow-left" aria-hidden />
            </button>
            <div className="hero-ridge__count">
              <span>{padIndex(active + 1)} / {padIndex(total)}</span>
              <span className="hero-ridge__progress" aria-hidden>
                <span
                  key={`p-${active}`}
                  className={paused ? 'is-paused' : ''}
                  style={{ ['--hero-autoplay' as string]: `${HERO_AUTOPLAY_MS}ms` }}
                />
              </span>
            </div>
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Destino siguiente">
              <i className="fal fa-arrow-right" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
