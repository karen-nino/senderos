'use client'

import { useEffect } from 'react'

export default function Scripts() {
  useEffect(() => {
    // Load scripts sequentially to ensure dependencies are loaded in order
    if (typeof window !== 'undefined') {
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Check if script already exists
          const existingScript = document.querySelector(`script[src="${src}"]`)
          if (existingScript) {
            resolve()
            return
          }

          const script = document.createElement('script')
          script.src = src
          script.async = false
          script.onload = () => resolve()
          script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
          document.body.appendChild(script)
        })
      }

      // Estilos que solo aplican cuando los plugins ya corrieron (sliders, animaciones WOW, popups, calendario)
      const loadStyle = (href: string): Promise<void> => {
        return new Promise((resolve) => {
          if (document.querySelector(`link[href="${href}"]`)) {
            resolve()
            return
          }

          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = href
          // Si un estilo falla, los plugins igual deben cargar
          link.onload = () => resolve()
          link.onerror = () => resolve()
          document.head.appendChild(link)
        })
      }

      const styles = [
        '/assets/vendor/slick/slick.css',
        '/assets/vendor/animate.css',
        '/assets/vendor/magnific-popup/dist/magnific-popup.css',
        '/assets/vendor/calendar/calendar.min.css',
      ]

      const scripts = [
        '/assets/vendor/jquery-3.6.0.min.js',
        '/assets/vendor/popper/popper.min.js',
        '/assets/vendor/bootstrap/js/bootstrap.min.js',
        '/assets/vendor/slick/slick.min.js',
        '/assets/vendor/magnific-popup/dist/jquery.magnific-popup.min.js',
        '/assets/vendor/calendar/calendar.min.js',
        '/assets/vendor/wow.min.js',
      ]

      // Inicializan los plugins: corren cuando los estilos de arriba ya están aplicados
      const themeScripts = ['/assets/js/theme.js', '/assets/js/theme-reinit.js']

      const loadSequentially = (list: string[], start: Promise<void>) =>
        list.reduce((promise, src) => promise.then(() => loadScript(src)), start)

      // Los estilos se piden en paralelo mientras cargan los plugins
      const stylesReady = Promise.all(styles.map(loadStyle))
      loadSequentially(scripts, Promise.resolve())
        .then(() => stylesReady)
        .then(() => loadSequentially(themeScripts, Promise.resolve()))
        .then(() => {
          // En prod, a veces el DOM ya está "ready" antes de que carguen estos scripts;
          // forzamos una reinicialización al terminar de cargar para asegurar slick/WOW/etc.
          const reinit = (window as any).reinitTheme
          if (typeof reinit === 'function') {
            setTimeout(() => reinit(), 50)
            // Segundo intento (imágenes/layout) para casos donde slick calcule width=0
            setTimeout(() => reinit(), 350)
          }
        })
        .catch((error) => {
          console.error('Error loading scripts:', error)
        })
    }
  }, [])

  return null
}

