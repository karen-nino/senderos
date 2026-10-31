'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent, PointerEvent } from 'react'

export interface HeroSlide {
  id?: number
  title: string
  subtitle?: string
  description?: string
  image?: {
    data?: {
      attributes?: {
        url: string
        alternativeText?: string
      }
    }
    url?: string
  } | string
  mobileImage?: {
    data?: {
      attributes?: {
        url: string
        alternativeText?: string
      }
    }
    url?: string
  } | string
  buttonText?: string
  buttonLink?: string
  ctaText?: string
  ctaLink?: string
}

export interface HeroVariantProps {
  slides: HeroSlide[]
}

const HERO_FALLBACK_IMAGE = '/assets/images/hero/hero-one_img-1.jpg'
export const HERO_AUTOPLAY_MS = 7000

// Las URLs vienen del servidor como string (proxy /strapi-uploads o fallback)
export function getHeroImageUrl(image: HeroSlide['image']): string {
  if (typeof image === 'string') return image || HERO_FALLBACK_IMAGE
  const url =
    (image as { url?: string })?.url ??
    (image as { data?: { url?: string } })?.data?.url ??
    ''
  if (!url) return HERO_FALLBACK_IMAGE
  if (url.startsWith('/api/strapi-uploads') || url.startsWith('/strapi-uploads')) return url
  if (url.startsWith('http')) return url
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  return cleanUrl.startsWith('/uploads/') ? `/api/strapi-uploads/${cleanUrl.replace(/^\/uploads\//, '')}` : `${strapiUrl}${cleanUrl}`
}

/**
 * Pide a Cloudinary una versión optimizada (formato automático WebP/AVIF, calidad automática y
 * ancho máximo). Las URLs que no son de Cloudinary se devuelven tal cual.
 */
export function cloudinaryResize(url: string, transform: string): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}

export function getHeroImageAlt(image: HeroSlide['image'], title: string): string {
  if (typeof image === 'string') return title
  return (image as { alternativeText?: string })?.alternativeText || title
}

const SITE_HOSTS = ['senderosdechiapas.com.mx', 'www.senderosdechiapas.com.mx']

/**
 * Strapi guarda enlaces absolutos al dominio de producción. Si apuntan al propio sitio se convierten
 * en ruta relativa: navegación interna de Next y sin saltar a producción desde local o previews.
 */
export function toSiteHref(url: string | undefined): string | undefined {
  if (!url || !/^https?:\/\//i.test(url)) return url
  try {
    const parsed = new URL(url)
    if (!SITE_HOSTS.includes(parsed.hostname)) return url
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/'
  } catch {
    return url
  }
}

export function getHeroText(slide: HeroSlide) {
  return {
    text: slide.subtitle || slide.description || '',
    ctaText: slide.buttonText || slide.ctaText,
    ctaLink: toSiteHref(slide.buttonLink || slide.ctaLink),
  }
}

export const padIndex = (n: number) => String(n).padStart(2, '0')

/**
 * Estado del carrusel: slide activo, navegación y autoplay.
 * - Pausa solo con mouse encima o con foco de teclado (un toque en pantallas táctiles no lo detiene).
 * - Al reanudar, el autoplay continúa con el tiempo restante, igual que la barra de progreso.
 * - `announce` indica si el último cambio lo hizo el usuario (para anunciarlo a lectores de pantalla).
 */
export function useHeroCarousel(total: number) {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [announce, setAnnounce] = useState(false)
  const remainingRef = useRef(HERO_AUTOPLAY_MS)
  const paused = hovered || focused

  const advance = useCallback((index: number) => {
    if (total === 0) return
    setActive((index + total) % total)
  }, [total])

  const goTo = useCallback((index: number) => {
    setAnnounce(true)
    advance(index)
  }, [advance])

  useEffect(() => {
    if (active >= total) setActive(0)
  }, [active, total])

  // Cada slide nuevo arranca con el tiempo completo (debe correr antes del efecto del temporizador)
  useEffect(() => {
    remainingRef.current = HERO_AUTOPLAY_MS
  }, [active])

  useEffect(() => {
    if (total < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = performance.now()
    const id = setTimeout(() => {
      setAnnounce(false)
      advance(active + 1)
    }, remainingRef.current)
    return () => {
      clearTimeout(id)
      remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - start))
    }
  }, [active, paused, total, advance])

  const pauseHandlers = {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') setHovered(true)
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') setHovered(false)
    },
    onFocus: (e: FocusEvent) => {
      // :focus-visible no existe en Safari < 15.4 y matches() lanzaría un error
      try {
        if ((e.target as HTMLElement).matches(':focus-visible')) setFocused(true)
      } catch {
        // Sin soporte no se distingue teclado de clic: no se pausa
      }
    },
    onBlur: (e: FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
    },
  }

  return { active, paused, announce, goTo, pauseHandlers }
}
