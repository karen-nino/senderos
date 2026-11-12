'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { preload } from 'react-dom'
import { WhatsAppIcon } from '../WhatsAppIcon'
import { whatsappHref } from '@/lib/contact'
import { cloudinaryResize } from '@/lib/cloudinary'
import {
  HERO_AUTOPLAY_MS,
  getHeroImageAlt,
  getHeroImageUrl,
  getHeroText,
  padIndex,
  useHeroCarousel,
  type HeroVariantProps,
} from './heroShared'

// El fondo topográfico del hero es el elemento LCP y solo aparece en el CSS: se precarga desde el <head>
const FIELD_BACKGROUND = '/assets/images/hero/topografia-oscura.svg'

/** Duración de la animación de lanzar la postal (debe coincidir con el CSS); margen para limpiar el estado. */
const TOSS_MS = 900

// useLayoutEffect en el cliente (antes de pintar); en el servidor no aplica
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// La postal mide como mucho ~540px de ancho: 1080px cubre pantallas 2x
const CARD_IMAGE = 'f_auto,q_auto,w_1080'
const CARD_IMAGE_MOBILE = 'f_auto,q_auto,w_800'
// Miniatura para las estampillas decorativas
const STAMP_IMAGE = 'f_auto,q_auto,w_240,h_280,c_fill'

/** Hero — Pila de postales: cada slide es una postal; la de arriba se lanza para dejar ver la siguiente. */
export default function HeroPostales({ slides }: HeroVariantProps) {
  const total = slides.length
  const { active, paused, announce, goTo, pauseHandlers } = useHeroCarousel(total)
  const sectionRef = useRef<HTMLElement>(null)

  // El header del tema es absoluto: el panel empieza justo donde termina (su alto varía por breakpoint)
  useEffect(() => {
    const section = sectionRef.current
    const header = document.querySelector('.header-area')
    if (!section || !header) return
    const update = () => {
      if (getComputedStyle(header).position !== 'absolute') return
      // Con scroll, la navegación pasa a fija y el contenedor se colapsa: esa medida no sirve
      if (header.querySelector('.header-navigation.sticky')) return
      const bottom = header.getBoundingClientRect().bottom + window.scrollY
      section.style.setProperty('--postal-header', `${Math.round(bottom)}px`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  // La postal que acaba de salir se anima por encima antes de volver al fondo de la pila.
  // Se calcula antes de pintar para que no haya un frame con la postal ya movida al fondo.
  const lastRef = useRef(active)
  // Dirección pedida por el usuario: con 2 postales "siguiente" y "anterior" llevan al mismo índice
  const navDirRef = useRef<'next' | 'prev' | null>(null)
  const [leaving, setLeaving] = useState<{ index: number; dir: 'next' | 'prev' } | null>(null)
  useIsoLayoutEffect(() => {
    const last = lastRef.current
    if (last === active) return
    lastRef.current = active
    const requested = navDirRef.current
    navDirRef.current = null
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Sin dirección pedida es el autoplay, que siempre avanza
    const dir = requested ?? ((last + 1) % total === active ? 'next' : 'prev')
    setLeaving({ index: dir === 'next' ? last : active, dir })
  }, [active, total])

  // Al terminar el lanzamiento, Safari retoma una transición pendiente y la postal da un brinco atrás:
  // se apaga la transición de esa postal un par de frames mientras se quita la animación
  const [settling, setSettling] = useState<number | null>(null)
  const endToss = () => {
    if (!leaving) return
    setSettling(leaving.index)
    setLeaving(null)
  }
  useEffect(() => {
    if (settling === null) return
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setSettling(null))
    })
    return () => cancelAnimationFrame(id)
  }, [settling])

  // Respaldo por si animationend no llega (pestaña en segundo plano, cambio rápido de postal)
  useEffect(() => {
    if (!leaving) return
    const id = window.setTimeout(() => {
      setSettling(leaving.index)
      setLeaving(null)
    }, TOSS_MS + 150)
    return () => clearTimeout(id)
  }, [leaving])

  // Mientras una postal está en el aire se ignoran nuevos clics (si no, salta de golpe al fondo)
  const navigate = (dir: 'next' | 'prev') => {
    if (leaving) return
    navDirRef.current = dir
    goTo(dir === 'next' ? active + 1 : active - 1)
  }

  // Arrastre de la postal de arriba (mouse o dedo): a la izquierda la lanza (siguiente), a la derecha trae la anterior
  const [dragX, setDragX] = useState<number | null>(null)
  // Posición desde la que arranca el lanzamiento al soltar, para que no regrese al centro antes de salir
  const [tossFrom, setTossFrom] = useState<string | null>(null)
  // Al arrastrar a la derecha, la anterior entra directo desde la izquierda, en el sentido del gesto
  const [pulled, setPulled] = useState(false)
  const dragRef = useRef<{ id: number; startX: number; startY: number; x: number; width: number; lifted: boolean } | null>(null)
  // Tras arrastrar, el navegador dispara un click al soltar: no debe contar como "siguiente"
  const draggedRef = useRef(false)

  useEffect(() => {
    if (leaving) return
    setTossFrom(null)
    setPulled(false)
  }, [leaving])

  // Si el autoplay cambia de postal a media arrastrada, se suelta la anterior
  useEffect(() => {
    dragRef.current = null
    setDragX(null)
  }, [active])

  // Con mouse la postal está levantada por el hover: el arrastre parte de ahí para que no dé un brinco
  const dragTransform = (x: number, lifted: boolean) =>
    lifted
      ? `translate(${x}px, -8px) rotate(${x * 0.04}deg)`
      : `translateX(${x}px) rotate(${1.5 + x * 0.04}deg)`

  const dragHandlers = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (leaving || (e.pointerType === 'mouse' && e.button !== 0)) return
      draggedRef.current = false
      dragRef.current = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        x: 0,
        width: e.currentTarget.offsetWidth,
        lifted: window.matchMedia('(hover: hover) and (pointer: fine)').matches && e.currentTarget.matches(':hover'),
      }
    },
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current
      if (!drag || drag.id !== e.pointerId) return
      const x = e.clientX - drag.startX
      if (!draggedRef.current) {
        // Umbral para no confundir un clic o toque con un arrastre
        if (Math.abs(x) < 6) return
        // Gesto vertical: se deja al scroll de la página
        if (Math.abs(e.clientY - drag.startY) > Math.abs(x)) {
          dragRef.current = null
          return
        }
        draggedRef.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
      }
      drag.x = x
      setDragX(x)
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current
      if (!drag || drag.id !== e.pointerId) return
      dragRef.current = null
      if (!draggedRef.current) return
      const threshold = Math.min(80, drag.width * 0.2)
      if (drag.x < -threshold) {
        setTossFrom(dragTransform(drag.x, drag.lifted))
        navigate('next')
      } else if (drag.x > threshold) {
        setPulled(true)
        navigate('prev')
      }
      setDragX(null)
    },
    onPointerCancel: () => {
      dragRef.current = null
      setDragX(null)
    },
  }

  preload(FIELD_BACKGROUND, { as: 'image', fetchPriority: 'high' })

  const slide = slides[active] ?? slides[0]
  const { text, ctaText, ctaLink } = getHeroText(slide)
  const quoteHref = whatsappHref(`Hola, quiero cotizar: ${slide.title}`)

  return (
    <section
      ref={sectionRef}
      className="hero-postal"
      aria-roledescription="carrusel"
      aria-label="Destacados"
      {...pauseHandlers}
    >
      <div className="hero-postal__field">
        <div className="hero-postal__trail" aria-hidden>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 44 104 C 46 96, 50 92, 50 84 C 50 70, 42 60, 44 46 C 45 34, 47 26, 48 20 C 49 14, 53 14, 55 24" />
          </svg>
          <span className="hero-postal__trail-end" />
        </div>

        {total > 1 && (
          <div className="hero-postal__stamps" aria-hidden>
            {[1, 2].filter((offset) => offset < total).map((offset) => {
              const s = slides[(active + offset) % total]
              return (
                <span key={offset} className={`hero-postal__stamp-deco hero-postal__stamp-deco--${offset}`}>
                  <span className="hero-postal__stamp-paper">
                    <img src={cloudinaryResize(getHeroImageUrl(s.image), STAMP_IMAGE)} alt="" loading="lazy" />
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

        {/* Solo se anuncia cuando el usuario cambia de postal, no con cada paso del autoplay */}
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">
          {announce ? `Postal ${active + 1} de ${total}: ${slide.title}` : ''}
        </p>

        <div className="hero-postal__copy" key={`copy-${active}`}>
          <h1>{slide.title}</h1>
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
            <a href={quoteHref} className="hero-postal__wa" target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="hero-postal__wa-icon" aria-hidden />
              Cotizar por WhatsApp
            </a>
          </div>
        </div>

        {total > 1 && (
          <div className="hero-postal__nav">
            <button type="button" onClick={() => navigate('prev')} aria-label="Postal anterior">
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
            <button type="button" onClick={() => navigate('next')} aria-label="Postal siguiente">
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
                  isTop && total > 1 ? 'is-clickable' : '',
                  isLeaving ? `is-tossed-${leaving?.dir}` : '',
                  isLeaving && leaving?.dir === 'prev' && pulled ? 'is-pulled' : '',
                  isLeaving && leaving?.dir === 'next' && tossFrom ? 'is-flung' : '',
                  settling === index ? 'is-settling' : '',
                  isTop && dragX !== null ? 'is-dragging' : '',
                ].join(' ')}
                style={{
                  zIndex: total - depth,
                  ...(isTop && dragX !== null && { ['--postal-drag' as string]: dragTransform(dragX, dragRef.current?.lifted ?? false) }),
                  ...(isLeaving && leaving?.dir === 'next' && tossFrom && { ['--postal-drag' as string]: tossFrom }),
                }}
                {...(isTop && total > 1 ? dragHandlers : {})}
                onClick={() => {
                  if (draggedRef.current) {
                    draggedRef.current = false
                    return
                  }
                  if (isTop && total > 1) navigate('next')
                }}
                onAnimationEnd={(e) => isLeaving && e.target === e.currentTarget && endToss()}
                aria-hidden={!isTop}
                tabIndex={isTop && total > 1 ? 0 : -1}
              >
                {/* Sin aria-label: el nombre accesible debe incluir el texto visible de la postal */}
                {isTop && total > 1 && <span className="visually-hidden">Ver siguiente postal. </span>}
                <picture className="hero-postal__photo">
                  {s.mobileImage && (
                    <source media="(max-width: 767px)" srcSet={cloudinaryResize(getHeroImageUrl(s.mobileImage), CARD_IMAGE_MOBILE)} />
                  )}
                  <img
                    src={cloudinaryResize(getHeroImageUrl(s.image), CARD_IMAGE)}
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
                    <strong>{s.polaroidTitle?.trim() || s.title}</strong>
                    {/* Bajo el título va la duración; sin duración capturada en Strapi queda el subtítulo */}
                    {(s.duration?.trim() || sText) && <small>{s.duration?.trim() || sText}</small>}
                  </span>
                  {/* Con fechas capturadas en Strapi el sello las muestra; si no, queda el número de postal */}
                  {s.dates?.trim() ? (
                    <span className="hero-postal__stamp hero-postal__stamp--dates">{s.dates.trim()}</span>
                  ) : (
                    <span className="hero-postal__stamp" aria-hidden>{padIndex(index + 1)}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
