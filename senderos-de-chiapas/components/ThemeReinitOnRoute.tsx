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

    if (!didChange) return

    const t = setTimeout(() => {
      if (typeof window !== 'undefined' && typeof (window as any).reinitTheme === 'function') {
        ; (window as any).reinitTheme()
      }
    }, 50)
    return () => clearTimeout(t)
  }, [pathname])

  return null
}
