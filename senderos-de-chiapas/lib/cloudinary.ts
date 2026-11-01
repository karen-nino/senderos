/**
 * Pide a Cloudinary una versión optimizada (formato automático WebP/AVIF, calidad automática y
 * ancho máximo). Las URLs que no son de Cloudinary se devuelven tal cual.
 */
export function cloudinaryResize(url: string, transform: string): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}

/** Atajo para el caso común: formato y calidad automáticos con un ancho máximo en píxeles. */
export function cloudinaryWidth(url: string, width: number): string {
  return cloudinaryResize(url, `f_auto,q_auto,w_${width}`)
}
