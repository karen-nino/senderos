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

      const scripts = [
        '/assets/vendor/jquery-3.6.0.min.js',
        '/assets/vendor/popper/popper.min.js',
        '/assets/vendor/bootstrap/js/bootstrap.min.js',
        '/assets/vendor/slick/slick.min.js',
        '/assets/vendor/magnific-popup/dist/jquery.magnific-popup.min.js',
        '/assets/vendor/jquery.counterup.min.js',
        '/assets/vendor/jquery.waypoints.js',
        '/assets/vendor/nice-select/js/jquery.nice-select.min.js',
        '/assets/vendor/jquery-ui/jquery-ui.min.js',
        '/assets/vendor/calendar/calendar.min.js',
        '/assets/vendor/wow.min.js',
        '/assets/js/theme.js',
        '/assets/js/theme-reinit.js',
      ]

      // Load scripts sequentially
      scripts.reduce((promise, src) => {
        return promise.then(() => loadScript(src))
      }, Promise.resolve()).catch((error) => {
        console.error('Error loading scripts:', error)
      })
    }
  }, [])

  return null
}

