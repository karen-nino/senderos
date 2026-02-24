'use client'

import Link from 'next/link'
import { useEffect } from 'react'

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
  buttonText?: string
  buttonLink?: string
  ctaText?: string
  ctaLink?: string
}

interface HeroSliderProps {
  slides: HeroSlide[]
}

const HERO_FALLBACK_IMAGE = '/assets/images/hero/hero-one_img-1.jpg'

export default function HeroSlider({ slides }: HeroSliderProps) {
  // Las URLs vienen del servidor como string (proxy /strapi-uploads o fallback)
  const getImageUrl = (image: HeroSlide['image']): string => {
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

  const getImageAlt = (image: HeroSlide['image'], title: string): string => {
    if (typeof image === 'string') return title
    return (image as { alternativeText?: string })?.alternativeText || title
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initSlider = () => {
      const $ = (window as any).jQuery
      if (!$ || !$('.hero-slider-one').length || typeof $.fn.slick === 'undefined') return false
      if ($('.hero-slider-one').hasClass('slick-initialized')) {
        try { $('.hero-slider-one').slick('unslick') } catch (_) { /* ignore */ }
      }
      $('.hero-slider-one').slick({
        dots: false,
        arrows: true,
        infinite: true,
        speed: 800,
        fade: true,
        autoplay: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: '<div class="prev"><i class="fal fa-arrow-left"></i></div>',
        nextArrow: '<div class="next"><i class="fal fa-arrow-right"></i></div>',
        responsive: [{ breakpoint: 1200, settings: { arrows: false } }],
      })
      return true
    }

    if (initSlider()) {
      return () => {
        const $ = (window as any).jQuery
        if ($ && $('.hero-slider-one').hasClass('slick-initialized')) {
          try { $('.hero-slider-one').slick('unslick') } catch (_) { /* ignore */ }
        }
      }
    }

    const maxAttempts = 25
    let attempts = 0
    const id = setInterval(() => {
      attempts++
      if (initSlider() || attempts >= maxAttempts) clearInterval(id)
    }, 200)

    return () => {
      clearInterval(id)
      const $ = (window as any).jQuery
      if ($ && $('.hero-slider-one').hasClass('slick-initialized')) {
        try { $('.hero-slider-one').slick('unslick') } catch (_) { /* ignore */ }
      }
    }
  }, [slides])

  // Si no hay slides, mostrar un mensaje o retornar null
  if (!slides || slides.length === 0) {
    return (
      <section className="hero-section">
        <div className="hero-wrapper bg-light">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-12">
                <p>No hay slides disponibles. Por favor, configura los slides en Strapi.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="hero-section">
      <div className="hero-wrapper bg-light">
        <div className="hero-slider-one">
          {slides.map((slide, index) => (
            <div key={slide.id || index} className="single-slider">
              <div className="container-fluid">
                <div className="row align-items-center">
                  <div className="col-xl-6">
                    <div className="hero-content">
                      <h1 data-animation="fadeInDown" data-delay=".4s">
                        {slide.title}
                      </h1>
                      <div className="text-button d-flex align-items-center">
                        <p data-animation="fadeInLeft" data-delay=".5s">
                          {slide.subtitle || slide.description || ''}
                        </p>
                        {(slide.buttonText || slide.ctaText) && (slide.buttonLink || slide.ctaLink) && (
                          <div className="hero-button" data-animation="fadeInRight" data-delay=".6s">
                            <Link href={slide.buttonLink || slide.ctaLink || '#'} className="main-btn primary-btn">
                              {slide.buttonText || slide.ctaText}<i className="fas fa-paper-plane"></i>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-6">
                    <div className="hero-image" data-animation="fadeInRight">
                      <img
                        src={getImageUrl(slide.image)}
                        alt={getImageAlt(slide.image, slide.title)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
