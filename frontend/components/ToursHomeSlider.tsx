'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface ToursHomeSliderProps {
  children: ReactNode
}

export default function ToursHomeSlider({ children }: ToursHomeSliderProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout>

    function initSlick() {
      if (cancelled) return
      const $ = (window as any).jQuery
      if (!$ || typeof $.fn.slick !== 'function') {
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
        variableWidth: true,
        centerMode: true,
        centerPadding: '0px',
        slidesToScroll: 1,
        prevArrow:
          '<div class="prev slick-arrow"><i class="far fa-angle-left"></i></div>',
        nextArrow:
          '<div class="next slick-arrow"><i class="far fa-angle-right"></i></div>',
      })

      try {
        $el.slick('setPosition')
      } catch (_) {
        /* ignore */
      }
    }

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
    <div ref={ref} className="places-section__grid slider-destinations-grid">
      {children}
    </div>
  )
}
