'use client'

import { useDict } from '@/components/LangProvider'
import { useCallback, useEffect } from 'react'
import { cloudinaryWidth } from '@/lib/cloudinary'

interface GalleryLightboxProps {
  images: string[]
  /** Foto abierta; null = visor cerrado. */
  index: number | null
  onChange: (index: number) => void
  onClose: () => void
}

/** Visor de fotos a pantalla completa (galería del inicio y Experiencias): flechas, Esc y clic fuera para cerrar. */
export default function GalleryLightbox({ images, index, onChange, onClose }: GalleryLightboxProps) {
  const t = useDict().galleryPage
  const list = images

  const goPrev = useCallback(() => {
    if (index === null) return
    onChange(index <= 0 ? list.length - 1 : index - 1)
  }, [index, list.length, onChange])

  const goNext = useCallback(() => {
    if (index === null) return
    onChange(index >= list.length - 1 ? 0 : index + 1)
  }, [index, list.length, onChange])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (index === null) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [index, onClose, goPrev, goNext])

  if (index === null) return null

  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t.lightboxAria}
      onClick={onClose}
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
        onClick={onClose}
        aria-label={t.close}
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
            aria-label={t.prev}
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
            aria-label={t.next}
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
        src={cloudinaryWidth(list[index], 1600)}
        alt={t.image(index + 1)}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
      />
    </div>
  )
}
