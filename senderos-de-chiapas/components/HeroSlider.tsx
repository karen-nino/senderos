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
    // Reinicializar el slider después de que el componente se monte
    if (typeof window !== 'undefined' && (window as any).jQuery) {
      const $ = (window as any).jQuery

      // Esperar a que los scripts se carguen
      const initSlider = () => {
        if ($('.hero-slider-one').length && typeof $.fn.slick !== 'undefined') {
          // Destruir el slider existente si ya está inicializado
          if ($('.hero-slider-one').hasClass('slick-initialized')) {
            $('.hero-slider-one').slick('unslick')
          }

          // Inicializar el slider
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
            responsive: [
              {
                breakpoint: 1200,
                settings: {
                  arrows: false
                }
              },
            ]
          })
        }
      }

      // Intentar inicializar inmediatamente
      initSlider()

      // Si no está listo, esperar un poco más
      const timer = setTimeout(() => {
        initSlider()
      }, 500)

      return () => {
        clearTimeout(timer)
        if ($('.hero-slider-one').hasClass('slick-initialized')) {
          $('.hero-slider-one').slick('unslick')
        }
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
