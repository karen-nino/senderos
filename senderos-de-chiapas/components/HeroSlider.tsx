'use client'

import HeroPostales from './hero/HeroPostales'
import type { HeroSlide } from './hero/heroShared'

export type { HeroSlide }

interface HeroSliderProps {
  slides: HeroSlide[]
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  // Si no hay slides, mostrar un mensaje o retornar null
  if (!slides || slides.length === 0) {
    return (
      <section className="hero-postal hero-postal--empty">
        <p>No hay slides disponibles. Por favor, configura los slides en Strapi.</p>
      </section>
    )
  }

  return <HeroPostales slides={slides} />
}
