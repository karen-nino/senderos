'use client'

import Link from 'next/link'
import {
  HERO_AUTOPLAY_MS,
  getHeroImageAlt,
  getHeroImageUrl,
  getHeroText,
  padIndex,
  useHeroCarousel,
  type HeroVariantProps,
} from './heroShared'

/** Opción 1 — Inmersivo: foto a sangre en marco redondeado, texto sobre degradado y pestañas con progreso. */
export default function HeroOpcion1({ slides }: HeroVariantProps) {
  const total = slides.length
  const { active, paused, goTo, pauseHandlers } = useHeroCarousel(total)

  return (
    <section
      className="hero-immersive"
      aria-roledescription="carrusel"
      aria-label="Destacados"
      {...pauseHandlers}
    >
      <div className="hero-immersive__frame">
        {slides.map((slide, index) => {
          const isActive = index === active
          const { text, ctaText, ctaLink } = getHeroText(slide)
          return (
            <div
              key={slide.id || index}
              className={`hero-immersive__slide ${isActive ? 'is-active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${total}`}
              aria-hidden={!isActive}
            >
              <picture className="hero-immersive__media">
                {slide.mobileImage && (
                  <source media="(max-width: 767px)" srcSet={getHeroImageUrl(slide.mobileImage)} />
                )}
                <img
                  src={getHeroImageUrl(slide.image)}
                  alt={getHeroImageAlt(slide.image, slide.title)}
                  width={1920}
                  height={1080}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              </picture>

              <div className="hero-immersive__content">
                {index === 0 ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
                {text && <p>{text}</p>}
                {ctaText && ctaLink && (
                  <Link href={ctaLink} className="hero-immersive__cta" tabIndex={isActive ? 0 : -1}>
                    {ctaText}
                    <span className="hero-immersive__cta-icon" aria-hidden>
                      <i className="fas fa-arrow-right"></i>
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )
        })}

        {total > 1 && (
          <div className="hero-immersive__controls">
            <div className="hero-immersive__counter" aria-live="polite">
              <strong>{padIndex(active + 1)}</strong>
              <span>/ {padIndex(total)}</span>
            </div>

            <div className="hero-immersive__tabs" role="tablist" aria-label="Seleccionar slide">
              {slides.map((slide, index) => (
                <button
                  key={slide.id || index}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={`hero-immersive__tab ${index === active ? 'is-active' : ''} ${paused ? 'is-paused' : ''}`}
                  onClick={() => goTo(index)}
                  style={{ ['--hero-autoplay' as string]: `${HERO_AUTOPLAY_MS}ms` }}
                >
                  <span className="hero-immersive__tab-bar"><span /></span>
                  <span className="hero-immersive__tab-label">{slide.title}</span>
                </button>
              ))}
            </div>

            <div className="hero-immersive__arrows">
              <button type="button" onClick={() => goTo(active - 1)} aria-label="Slide anterior">
                <i className="fal fa-arrow-left" aria-hidden />
              </button>
              <button type="button" onClick={() => goTo(active + 1)} aria-label="Slide siguiente">
                <i className="fal fa-arrow-right" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
