import GalleryPolaroids from '@/components/GalleryPolaroids'
import { slugify } from '@/lib/strapi'
import { getDictionary } from '@/lib/dictionaries'
import type { Lang } from '@/lib/i18n'

interface GalleryIntroProps {
  groups: { title: string; images: string[] }[]
  lang?: Lang
}

/** Id de la sección de cada experiencia en la galería (para el índice). */
export function galleryGroupId(title: string, index: number): string {
  return `experiencia-${slugify(title) || index + 1}`
}

/** Encabezado de Experiencias: título, índice de lugares y una tira de polaroids con fotos al azar de la galería. */
export default function GalleryIntro({ groups, lang = 'es' }: GalleryIntroProps) {
  const t = getDictionary(lang).galleryPage

  return (
    <header className="gallery-intro">
      <div className="container gallery-intro__inner">
        <div className="gallery-intro__text">
          <h1 className="gallery-intro__title">{t.title}</h1>
          <p className="gallery-intro__lead">{t.lead}</p>
          {/* Índice de lugares: lleva a la sección de cada experiencia */}
          <nav className="gallery-intro__nav" aria-label={t.navAria}>
            {groups.map((g, i) => (
              <a key={i} href={`#${galleryGroupId(g.title, i)}`} className="gallery-intro__nav-link">
                {g.title || t.experience(i + 1)}
                <span className="gallery-intro__nav-count">{g.images.length}</span>
              </a>
            ))}
          </nav>
        </div>
        <GalleryPolaroids groups={groups} />
      </div>
    </header>
  )
}
