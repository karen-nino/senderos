'use client'

import { useEffect, useRef } from 'react'

interface PlaceSliderProps {
  images: string[]
  alt: string
}

const sizeFeatured = { width: 950, height: 300 }
const sizeSlide = { width: 465, height: 300 }

export default function PlaceSlider({ images, alt }: PlaceSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return

    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout>

    function initSlick() {
      if (cancelled) return
      const $ = (window as any).jQuery
      if (!$ || typeof $.fn.slick !== 'function') {
        // Slick not loaded yet — retry
        retryTimer = setTimeout(initSlick, 200)
        return
      }

      const $el = $(el)
      if ($el.hasClass('slick-initialized')) return

      $el.slick({
        dots: false,
        arrows: true,
        infinite: true,
        speed: 800,
        autoplay: true,
        autoplaySpeed: 4500,
        variableWidth: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        prevArrow:
          '<button type="button" class="prev slick-arrow" aria-label="Anterior"><i class="far fa-angle-left"></i></button>',
        nextArrow:
          '<button type="button" class="next slick-arrow" aria-label="Siguiente"><i class="far fa-angle-right"></i></button>',
        responsive: [{ breakpoint: 991, settings: { arrows: false } }],
      })
      try {
        $el.slick('setPosition')
      } catch (_) {
        /* ignore */
      }
    }

    // Small delay to ensure DOM is painted
    retryTimer = setTimeout(initSlick, 60)

    return () => {
      cancelled = true
      clearTimeout(retryTimer)
      const $ = (window as any).jQuery
      if ($ && $(el).hasClass('slick-initialized')) {
        try {
          $(el).slick('unslick')
        } catch (_) {
          /* ignore */
        }
      }
    }
  }, [])

  return (
    <div className="place-slider-area overflow-hidden wow fadeInUp">
      <div className="place-slider" ref={sliderRef}>
        {images.map((img, i) => {
          const isFeatured = i === 1 || i === 3
          const size = isFeatured ? sizeFeatured : sizeSlide
          return (
            <div key={`${img}-${i}`} className={isFeatured ? 'place-item' : 'place-slider-item'}>
              <div
                className="place-img"
                style={{
                  width: size.width,
                  height: size.height,
                  overflow: 'hidden',
                  borderRadius: 15,
                }}
              >
                <img
                  src={img}
                  alt={`${alt} - Imagen ${i + 1}`}
                  width={size.width}
                  height={size.height}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
