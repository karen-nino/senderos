'use client'

import { useDict } from '@/components/LangProvider'
import { useCallback, useState } from 'react'
import { cloudinaryWidth } from '@/lib/cloudinary'
import GalleryLightbox from '@/components/GalleryLightbox'

interface GalleryGridProps {
  title: string
  images: string[]
}

/** Cuadrícula de fotos de un grupo de Experiencias; al hacer clic se abre el mismo visor que la galería del inicio. */
export default function GalleryGrid({ title, images }: GalleryGridProps) {
  const t = useDict().galleryPage
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  return (
    <>
      <div className="row">
        {images.map((imgUrl, idx) => (
          <div key={idx} className="col-lg-4 col-md-6 col-sm-6 col-6">
            <div className="single-gallery-item mb-30 wow fadeInUp">
              <div className="gallery-img" onClick={() => setLightboxIndex(idx)}>
                <img
                  src={cloudinaryWidth(imgUrl, 800)}
                  alt={`${title} ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                />
                <div className="hover-overlay">
                  <a
                    href={cloudinaryWidth(imgUrl, 1600)}
                    className="icon-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setLightboxIndex(idx)
                    }}
                    aria-label={t.enlarge}
                  >
                    <i className="far fa-eye"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <GalleryLightbox
        images={images}
        index={lightboxIndex}
        onChange={setLightboxIndex}
        onClose={closeLightbox}
      />
    </>
  )
}
