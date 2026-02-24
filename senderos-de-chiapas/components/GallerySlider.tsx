'use client'

import { useEffect } from 'react'

interface GallerySliderProps {
  images: string[]
}

export default function GallerySlider({ images }: GallerySliderProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initSlider = () => {
      const $ = (window as any).jQuery
      if (!$ || !$('.slider-active-5-item').length || typeof $.fn.slick === 'undefined') return false
      if ($('.slider-active-5-item').hasClass('slick-initialized')) {
        try { $('.slider-active-5-item').slick('unslick') } catch (_) { /* ignore */ }
      }
      $('.slider-active-5-item').slick({
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
      })
      if (typeof $.fn.magnificPopup !== 'undefined') {
        $('.slider-active-5-item .img-popup').magnificPopup({ type: 'image', gallery: { enabled: true } })
      }
      return true
    }

    if (initSlider()) {
      return () => {
        const $ = (window as any).jQuery
        if ($ && $('.slider-active-5-item').hasClass('slick-initialized')) {
          try { $('.slider-active-5-item').slick('unslick') } catch (_) { /* ignore */ }
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
      if ($ && $('.slider-active-5-item').hasClass('slick-initialized')) {
        try { $('.slider-active-5-item').slick('unslick') } catch (_) { /* ignore */ }
      }
    }
  }, [images])

  return (
    <section className="gallery-section pt-200 mbm-150">
      <div className="container-fluid">
        <div className="slider-active-5-item wow fadeInUp">
          {(images || []).map((src, i) => (
            <div key={i} className="single-gallery-item">
              <div className="gallery-img">
                <img src={src} alt={`Gallery Image ${i + 1}`} />
                <div className="hover-overlay">
                  <a href={src} className="icon-btn img-popup">
                    <i className="far fa-plus"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
