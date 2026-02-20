'use client'

import { useEffect, useRef } from 'react'

export default function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Ocultar preloader cuando la página esté completamente cargada
    const hidePreloader = () => {
      if (preloaderRef.current) {
        preloaderRef.current.classList.add('fade-out')
        setTimeout(() => {
          if (preloaderRef.current && preloaderRef.current.parentNode) {
            preloaderRef.current.style.display = 'none'
          }
        }, 500)
      }
    }

    // Intentar ocultar cuando la página esté lista
    if (document.readyState === 'complete') {
      // Si ya está cargado, ocultar inmediatamente
      setTimeout(hidePreloader, 500)
    } else {
      window.addEventListener('load', hidePreloader)
      // Fallback: ocultar después de 2 segundos máximo
      const fallbackTimeout = setTimeout(hidePreloader, 2000)
      
      return () => {
        window.removeEventListener('load', hidePreloader)
        clearTimeout(fallbackTimeout)
      }
    }
  }, [])

  return (
    <div ref={preloaderRef} className="preloader">
      <div className="loader">
        <div className="pre-shadow"></div>
        <div className="pre-box"></div>
      </div>
    </div>
  )
}

