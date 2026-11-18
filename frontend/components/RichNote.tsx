import { Fragment } from 'react'

/**
 * Texto simple de Strapi con formato ligero: *texto* en negritas (como en WhatsApp) y
 * líneas en blanco como separación de párrafos.
 */
export default function RichNote({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>
          {paragraph.split(/(\*[^*\n]+\*)/g).map((part, j) =>
            /^\*[^*\n]+\*$/.test(part) ? (
              <strong key={j}>{part.slice(1, -1)}</strong>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
        </p>
      ))}
    </>
  )
}
