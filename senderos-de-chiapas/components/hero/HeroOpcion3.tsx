'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { WhatsAppIcon } from '../WhatsAppIcon'
import {
  HERO_AUTOPLAY_MS,
  getHeroImageAlt,
  getHeroImageUrl,
  getHeroText,
  padIndex,
  type HeroVariantProps,
} from './heroShared'

const WHATSAPP_NUMBER = '529613629724'

/** Posición de reposo de la diagonal (% del ancho) y su inclinación (± % entre arriba y abajo). */
const SPLIT_REST = 60
const TILT = 7
/** Si al soltar la diagonal quedó a la izquierda de este punto, se pasa al siguiente destino. */
const SPLIT_COMMIT = 32
const SWEEP_OUT_MS = 650
const SWEEP_IN_MS = 750

const clipA = (s: number) => `polygon(0 0, ${s + TILT}% 0, ${s - TILT}% 100%, 0 100%)`
const clipLine = (s: number) =>
  `polygon(${s + TILT - 0.18}% 0, ${s + TILT + 0.18}% 0, ${s - TILT + 0.18}% 100%, ${s - TILT - 0.18}% 100%)`

/** Opción 3 — Horizonte partido: dos destinos separados por una diagonal que se arrastra para pasar al siguiente. */
export default function HeroOpcion3({ slides }: HeroVariantProps) {
  const total = slides.length
  const [active, setActive] = useState(0)
  const [split, setSplit] = useState(SPLIT_REST)
  const [motion, setMotion] = useState<'none' | 'out' | 'in' | 'settle'>('none')
  const [dragging, setDragging] = useState(false)
  const [paused, setPaused] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const busyRef = useRef(false)
  const timers = useRef<number[]>([])

  const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Barrido: la diagonal sale por la izquierda (entra B), se intercambian y la nueva diagonal entra por la derecha
  const next = useCallback(() => {
    if (total < 2 || busyRef.current) return
    if (reducedMotion()) {
      setActive((a) => (a + 1) % total)
      setSplit(SPLIT_REST)
      return
    }
    busyRef.current = true
    setMotion('out')
    setSplit(-TILT)
    later(() => {
      setMotion('none')
      setActive((a) => (a + 1) % total)
      setSplit(100 + TILT)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setMotion('in')
          setSplit(SPLIT_REST)
          later(() => {
            setMotion('none')
            busyRef.current = false
          }, SWEEP_IN_MS)
        })
      )
    }, SWEEP_OUT_MS)
  }, [total])

  // Hacia atrás: el destino anterior entra desde la izquierda por encima del actual
  const prev = useCallback(() => {
    if (total < 2 || busyRef.current) return
    setActive((a) => (a - 1 + total) % total)
    if (reducedMotion()) {
      setSplit(SPLIT_REST)
      return
    }
    busyRef.current = true
    setMotion('none')
    setSplit(-TILT)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setMotion('in')
        setSplit(SPLIT_REST)
        later(() => {
          setMotion('none')
          busyRef.current = false
        }, SWEEP_IN_MS)
      })
    )
  }, [total])

  // Autoplay
  useEffect(() => {
    if (total < 2 || paused || dragging || reducedMotion()) return
    const id = window.setTimeout(next, HERO_AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [active, paused, dragging, total, next])

  // Arrastre de la diagonal
  const splitFromPointer = (clientX: number) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return SPLIT_REST
    return Math.max(-TILT, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (busyRef.current || total < 2) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    setMotion('none')
  }
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    setSplit(splitFromPointer(e.clientX))
  }
  const onPointerUp = () => {
    if (!dragging) return
    setDragging(false)
    if (split < SPLIT_COMMIT) {
      next()
    } else {
      setMotion('settle')
      setSplit(SPLIT_REST)
    }
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowLeft' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      next()
    }
  }

  const slide = slides[active] ?? slides[0]
  const nextIndex = (active + 1) % total
  const nextSlide = slides[nextIndex]
  const { text, ctaText, ctaLink } = getHeroText(slide)
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, quiero cotizar: ${slide.title}`)}`

  const motionClass = motion === 'none' ? '' : `is-${motion}`

  return (
    <section
      className="hero-split"
      aria-roledescription="carrusel"
      aria-label="Destacados"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={`hero-split__stage ${motionClass} ${dragging ? 'is-dragging' : ''}`} ref={stageRef}>
        {slides.map((s, index) => {
          const role = index === active ? 'a' : total > 1 && index === nextIndex ? 'b' : 'off'
          return (
            <picture
              key={s.id || index}
              className={`hero-split__layer is-${role}`}
              style={role === 'a' ? { clipPath: clipA(split) } : undefined}
              aria-hidden={role !== 'a'}
            >
              {s.mobileImage && <source media="(max-width: 767px)" srcSet={getHeroImageUrl(s.mobileImage)} />}
              <img
                src={getHeroImageUrl(s.image)}
                alt={getHeroImageAlt(s.image, s.title)}
                width={1600}
                height={900}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                draggable={false}
              />
            </picture>
          )
        })}

        {total > 1 && (
          <>
            <span className="hero-split__line" style={{ clipPath: clipLine(split) }} aria-hidden />
            <button
              type="button"
              className="hero-split__handle"
              style={{ left: `${split}%` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              aria-label={`Arrastra o pulsa para ver ${nextSlide.title}`}
            >
              <i className="fas fa-arrows-alt-h" aria-hidden />
            </button>

            <button type="button" className="hero-split__peek" onClick={next} key={`peek-${active}`}>
              <small>Arrastra para ver</small>
              <strong>{nextSlide.title}</strong>
            </button>
          </>
        )}

        <div className="hero-split__copy" key={`copy-${active}`} aria-live="polite">
          {active === 0 ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
          {text && <p className="hero-split__place">{text}</p>}
          <div className="hero-split__ctas">
            {ctaText && ctaLink && (
              <Link href={ctaLink} className="hero-split__cta">
                {ctaText}
                <span className="hero-split__cta-icon" aria-hidden>
                  <i className="fas fa-arrow-right"></i>
                </span>
              </Link>
            )}
            <a href={whatsappHref} className="hero-split__wa" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="hero-split__wa-icon" aria-hidden />
              Cotizar por WhatsApp
            </a>
          </div>
        </div>

        {total > 1 && (
          <div className="hero-split__nav">
            <button type="button" onClick={prev} aria-label="Destino anterior">
              <i className="fal fa-arrow-left" aria-hidden />
            </button>
            <span>{padIndex(active + 1)} / {padIndex(total)}</span>
            <button type="button" onClick={next} aria-label="Destino siguiente">
              <i className="fal fa-arrow-right" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
