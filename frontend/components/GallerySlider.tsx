'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cloudinaryWidth } from '@/lib/cloudinary'
import GalleryLightbox from '@/components/GalleryLightbox'

interface GallerySliderProps {
  images: string[]
  embed?: boolean
}

export default function GallerySlider({ images, embed = false }: GallerySliderProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const list = images || []

  const openLightbox = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = sliderRef.current
    if (!el) return

    const settings = embed
      ? {
          dots: false,
          arrows: true,
          infinite: true,
          speed: 600,
          autoplay: false,
          slidesToShow: 1,
          slidesToScroll: 1,
          prevArrow: '<button type="button" class="prev slick-arrow gallery-embed-arrow" aria-label="Anterior"><i class="far fa-angle-left"></i></button>',
          nextArrow: '<button type="button" class="next slick-arrow gallery-embed-arrow" aria-label="Siguiente"><i class="far fa-angle-right"></i></button>',
        }
      : {
          dots: false,
          arrows: false,
          infinite: true,
          speed: 800,
          autoplay: true,
          slidesToShow: 5,
          slidesToScroll: 1,
          prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
          nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
          responsive: [
            { breakpoint: 1400, settings: { slidesToShow: 4 } },
            { breakpoint: 1199, settings: { slidesToShow: 3 } },
            { breakpoint: 991, settings: { slidesToShow: 2 } },
            { breakpoint: 575, settings: { slidesToShow: 1 } },
          ],
        }

    const initSlider = () => {
      const $ = (window as any).jQuery
      if (!$ || typeof $.fn.slick === 'undefined') return false
      const $el = $(el)
      if ($el.hasClass('slick-initialized')) {
        try { $el.slick('unslick') } catch (_) { /* ignore */ }
      }
      $el.slick(settings)
      return true
    }

    if (initSlider()) {
      return () => {
        const $ = (window as any).jQuery
        if ($ && $(el).hasClass('slick-initialized')) {
          try { $(el).slick('unslick') } catch (_) { /* ignore */ }
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
      if ($ && $(el).hasClass('slick-initialized')) {
        try { $(el).slick('unslick') } catch (_) { /* ignore */ }
      }
    }
  }, [images, embed])

  const sliderMarkup = (
    <div
      ref={sliderRef}
      className={`slider-active-5-item wow fadeInUp${embed ? ' gallery-embed-slider' : ''}`}
    >
      {list.map((src, i) => (
        <div key={i} className="single-gallery-item">
          <div className="gallery-img" onClick={() => setLightboxIndex(i)}>
            <img src={cloudinaryWidth(src, 600)} alt={`Gallery Image ${i + 1}`} loading="lazy" decoding="async" />
            <div className="hover-overlay">
              <a
                href={cloudinaryWidth(src, 1600)}
                className="icon-btn"
                onClick={(e) => openLightbox(e, i)}
                aria-label="Ver imagen ampliada"
              >
                <i className="far fa-eye"></i>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {embed ? (
        sliderMarkup
      ) : (
        <section className="gallery-section pt-200 mbm-150">
          <div className="container-fluid">{sliderMarkup}</div>
        </section>
      )}

      <GalleryLightbox
        images={list}
        index={lightboxIndex}
        onChange={setLightboxIndex}
        onClose={closeLightbox}
      />
    </>
  )
}
