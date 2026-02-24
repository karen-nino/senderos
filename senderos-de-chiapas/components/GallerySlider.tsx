'use client'

import { useEffect, useState, useCallback } from 'react'

interface GallerySliderProps {
  images: string[]
}

export default function GallerySlider({ images }: GallerySliderProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const list = images || []

  const openLightbox = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex <= 0 ? list.length - 1 : lightboxIndex - 1)
  }, [lightboxIndex, list.length])

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex >= list.length - 1 ? 0 : lightboxIndex + 1)
  }, [lightboxIndex, list.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, closeLightbox, goPrev, goNext])

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
        setTimeout(() => {
          $('.slider-active-5-item .img-popup').magnificPopup({ type: 'image', gallery: { enabled: true } })
        }, 100)
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
    <>
      <section className="gallery-section pt-200 mbm-150">
        <div className="container-fluid">
          <div className="slider-active-5-item wow fadeInUp">
            {list.map((src, i) => (
              <div key={i} className="single-gallery-item">
                <div className="gallery-img">
                  <img src={src} alt={`Gallery Image ${i + 1}`} />
                  <div className="hover-overlay">
                    <a
                      href={src}
                      className="icon-btn img-popup"
                      onClick={(e) => openLightbox(e, i)}
                      aria-label="Ver imagen ampliada"
                    >
                      <i className="far fa-plus"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de imagen"
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 48,
              height: 48,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.5rem',
              zIndex: 1,
            }}
          >
            ×
          </button>
          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                aria-label="Anterior"
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  zIndex: 1,
                }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext() }}
                aria-label="Siguiente"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 48,
                  height: 48,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  zIndex: 1,
                }}
              >
                ›
              </button>
            </>
          )}
          <img
            src={list[lightboxIndex]}
            alt={`Galería ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  )
}
