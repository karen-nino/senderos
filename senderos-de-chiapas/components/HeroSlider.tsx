'use client'

import HeroOpcion1 from './hero/HeroOpcion1'
import HeroOpcion2, { type HeroPostalFondo } from './hero/HeroOpcion2'
import HeroOpcion3 from './hero/HeroOpcion3'
import HeroOpcion4 from './hero/HeroOpcion4'
import HeroOpcion5 from './hero/HeroOpcion5'
import type { HeroSlide } from './hero/heroShared'

export type { HeroSlide }

interface HeroSliderProps {
  slides: HeroSlide[]
  /** 1 = Inmersivo (pantalla completa) · 2 = Pila de postales · 3 = Horizonte partido · 4 = Recorrido con scroll · 5 = Cordilleras en capas */
  variant?: 1 | 2 | 3 | 4 | 5
  /** Solo opción 2: fondo del panel */
  fondo?: HeroPostalFondo
}

export default function HeroSlider({ slides, variant = 1, fondo }: HeroSliderProps) {
  // Si no hay slides, mostrar un mensaje o retornar null
  if (!slides || slides.length === 0) {
    return (
      <section className="hero-immersive hero-immersive--empty">
        <p>No hay slides disponibles. Por favor, configura los slides en Strapi.</p>
      </section>
    )
  }

  if (variant === 5) return <HeroOpcion5 slides={slides} />
  if (variant === 4) return <HeroOpcion4 slides={slides} />
  if (variant === 3) return <HeroOpcion3 slides={slides} />
  return variant === 2 ? <HeroOpcion2 slides={slides} fondo={fondo} /> : <HeroOpcion1 slides={slides} />
}
