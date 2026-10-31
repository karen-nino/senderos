'use client'

import { useCallback, useEffect, useState } from 'react'

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

export function getHeroImageAlt(image: HeroSlide['image'], title: string): string {
  if (typeof image === 'string') return title
  return (image as { alternativeText?: string })?.alternativeText || title
}

export function getHeroText(slide: HeroSlide) {
  return {
    text: slide.subtitle || slide.description || '',
    ctaText: slide.buttonText || slide.ctaText,
    ctaLink: slide.buttonLink || slide.ctaLink,
  }
}

export const padIndex = (n: number) => String(n).padStart(2, '0')

/** Estado del carrusel: slide activo, navegación y autoplay (pausable, respeta reduced-motion). */
export function useHeroCarousel(total: number) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((index: number) => {
    if (total === 0) return
    setActive((index + total) % total)
  }, [total])

  useEffect(() => {
    if (active >= total) setActive(0)
  }, [active, total])

  useEffect(() => {
    if (total < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => goTo(active + 1), HERO_AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [active, paused, total, goTo])

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  }

  return { active, paused, goTo, pauseHandlers }
}
