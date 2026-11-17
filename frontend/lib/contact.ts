/** Datos de contacto de Senderos de Chiapas: un solo lugar para cambiarlos. */

/** Número con código de país, sin "+" (formato de wa.me). */
export const PHONE_NUMBER = '529613629724'
export const PHONE_TEL_HREF = `tel:+${PHONE_NUMBER}`
export const PHONE_DISPLAY = '961 362 9724'
export const PHONE_DISPLAY_INTL = '+52 961 362 9724'

/** Enlace a WhatsApp con un mensaje opcional ya escrito. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${PHONE_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
