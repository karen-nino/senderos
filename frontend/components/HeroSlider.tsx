'use client'

import HeroPostales from './hero/HeroPostales'
import type { HeroSlide } from './hero/heroShared'

export type { HeroSlide }

interface HeroSliderProps {
  slides: HeroSlide[]
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  // Un slide sin título dejaría un <h1> vacío y una postal sin nombre: se descarta
  const validSlides = (slides ?? []).filter((s) => s.title?.trim())
  if (validSlides.length === 0) return null

  return <HeroPostales slides={validSlides} />
}
