'use client'

import HeroOpcion2, { type HeroPostalFondo } from './hero/HeroOpcion2'
import type { HeroSlide } from './hero/heroShared'

export type { HeroSlide }

interface HeroSliderProps {
  slides: HeroSlide[]
  /** Fondo del panel (por defecto: claro) */
  fondo?: HeroPostalFondo
}

export default function HeroSlider({ slides, fondo }: HeroSliderProps) {
  // Si no hay slides, mostrar un mensaje o retornar null
  if (!slides || slides.length === 0) {
    return (
      <section className="hero-postal hero-postal--empty">
        <p>No hay slides disponibles. Por favor, configura los slides en Strapi.</p>
      </section>
    )
  }

  return <HeroOpcion2 slides={slides} fondo={fondo} />
}
