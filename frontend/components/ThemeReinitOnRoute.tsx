'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Reinicializa sliders, WOW, niceSelect, etc. al cambiar de ruta.
 * Evita que secciones se vean "muy grandes" en la primera navegación (sin refresh).
 */
export default function ThemeReinitOnRoute() {
  const pathname = usePathname()
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    const didChange = prevPathname.current !== null && prevPathname.current !== pathname
    prevPathname.current = pathname

    // También reinicializar en el primer mount (deploy suele fallar si solo lo hacemos en navegación)
    const reinit = () => {
      if (typeof window !== 'undefined' && typeof (window as any).reinitTheme === 'function') {
        ;(window as any).reinitTheme()
      }
    }

    const t1 = setTimeout(() => reinit(), didChange ? 80 : 150)
    const t2 = setTimeout(() => reinit(), didChange ? 380 : 450)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [pathname])

  return null
}
