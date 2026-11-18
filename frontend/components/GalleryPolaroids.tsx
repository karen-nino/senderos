'use client'

import { useEffect, useState } from 'react'
import { Permanent_Marker } from 'next/font/google'
import { cloudinaryWidth } from '@/lib/cloudinary'

/** Letra de plumón para el pie de las polaroids, como escrito a mano sobre la foto. */
const handwriting = Permanent_Marker({ subsets: ['latin'], weight: '400', display: 'swap' })

interface GalleryPolaroidsProps {
  groups: { title: string; images: string[] }[]
  max?: number
}

type Photo = { src: string; caption: string }

function shuffle<T>(list: T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Fotos al azar: categorías y fotos revueltas, tomando una de cada categoría por turnos para variar los lugares. */
function pickRandom(groups: GalleryPolaroidsProps['groups'], max: number): Photo[] {
  const pools = shuffle(groups).map((g) => shuffle(g.images).map((src) => ({ src, caption: g.title })))
  const picked: Photo[] = []
  while (picked.length < max && pools.some((p) => p.length)) {
    for (const pool of pools) {
      const photo = pool.shift()
      if (photo) picked.push(photo)
      if (picked.length === max) break
    }
  }
  return picked
}

/**
 * Tira de polaroids del encabezado de Experiencias. La selección se hace en el navegador para que cambie
 * en cada visita (la página se sirve desde caché); aparecen con un fundido cuando ya están elegidas.
 */
export default function GalleryPolaroids({ groups, max = 5 }: GalleryPolaroidsProps) {
  const [photos, setPhotos] = useState<Photo[] | null>(null)

  useEffect(() => {
    setPhotos(pickRandom(groups, max))
  }, [groups, max])

  return (
    // Decorativas: las mismas fotos se ven completas en la galería de abajo
    <div className={`gallery-intro__polaroids${photos ? ' is-ready' : ''}`} aria-hidden>
      {photos?.map((p, i) => (
        <figure key={`${p.src}-${i}`} className={`gallery-intro__polaroid gallery-intro__polaroid--${i + 1}`}>
          <img src={cloudinaryWidth(p.src, 500)} alt="" decoding="async" />
          <figcaption className={handwriting.className}>{p.caption}</figcaption>
        </figure>
      ))}
    </div>
  )
}
