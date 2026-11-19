import { notFound } from 'next/navigation'

/** Cualquier ruta que no exista dentro de un idioma muestra la página 404 del sitio (app/[lang]/not-found.tsx). */
export default function CatchAll() {
  notFound()
}
