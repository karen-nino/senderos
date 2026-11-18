'use client'

import { useId, useMemo, useState } from 'react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { whatsappHref } from '@/lib/contact'

interface PackageQuoteProps {
  /** Precio general del paquete (sin tabla por grupo). */
  price: string
  priceInternational?: string
  /** Tabla de Strapi: ocupación ("2 Personas", "4-8 Personas") → precio por persona. */
  pricePerPerson?: Array<{ occupation: string; price: string }>
  /** Nombre del paquete, para el mensaje de WhatsApp. */
  title: string
  /** Paquete de aventura: cambia el emoji del mensaje (🧗‍♂️ aventura · 🧳 los demás). */
  isAdventure?: boolean
}

type Tier = { min: number; max: number; price: string }

/** "2 Personas" → 2–2 · "4-8 Personas" / "4 a 8" → 4–8 · "8+" / "8 o más" → 8–∞. Null si no se entiende. */
function parseOccupation(text: string): { min: number; max: number } | null {
  const nums = (text.match(/\d+/g) ?? []).map(Number)
  if (nums.length === 0) return null
  if (nums.length >= 2) return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) }
  const openEnded = /\+|m[aá]s/i.test(text)
  return { min: nums[0], max: openEnded ? Infinity : nums[0] }
}

function buildTiers(rows: PackageQuoteProps['pricePerPerson']): Tier[] | null {
  if (!rows?.length) return null
  const tiers: Tier[] = []
  for (const row of rows) {
    const range = parseOccupation(row.occupation)
    if (!range) return null
    tiers.push({ ...range, price: row.price })
  }
  return tiers.sort((a, b) => a.min - b.min)
}

/**
 * Precio en la caja "Detalles del paquete". Si hay tabla de precio por grupo, la persona elige cuántas van
 * con un contador (−/+) y ve el precio por persona de ese grupo; el mensaje de WhatsApp lleva esa elección.
 */
export default function PackageQuote({ price, priceInternational, pricePerPerson, title, isAdventure = false }: PackageQuoteProps) {
  const tiers = useMemo(() => buildTiers(pricePerPerson), [pricePerPerson])
  const minPeople = tiers ? tiers[0].min : 1
  // Tope del contador: el mayor número de la tabla (un rango abierto como "8+" permite hasta 8 + 7)
  const maxPeople = tiers
    ? Math.max(...tiers.map((t) => (Number.isFinite(t.max) ? t.max : t.min + 7)))
    : 1
  const [people, setPeople] = useState(minPeople)
  const labelId = useId()

  // Precio del grupo que contiene a ese número; si cae entre grupos, el del grupo menor más cercano
  const tier = tiers
    ? tiers.find((t) => people >= t.min && people <= t.max) ?? [...tiers].reverse().find((t) => people >= t.min) ?? tiers[0]
    : null

  // Mensaje corto: nombre del paquete y, si eligió en el contador, cuántas personas
  const message = [
    'Hola 👋, me gustaría cotizar el siguiente paquete:',
    '',
    `${isAdventure ? '🧗‍♂️' : '🧳'} *${title}*`,
    ...(tier ? [`- ${people} ${people === 1 ? 'Persona' : 'Personas'}`] : []),
  ].join('\n')

  return (
    <>
      {tier ? (
        <>
        <li className="package-quote">
          <span className="package-quote__label" id={labelId}>
            <i className="fal fa-users" aria-hidden></i>¿Cuántas personas viajan?
          </span>
          <div className="package-quote__stepper" role="group" aria-labelledby={labelId}>
            <button
              type="button"
              className="package-quote__btn"
              onClick={() => setPeople((n) => Math.max(minPeople, n - 1))}
              disabled={people <= minPeople}
              aria-label="Una persona menos"
            >
              <i className="far fa-minus" aria-hidden></i>
            </button>
            <output className="package-quote__count" aria-live="polite">
              {people} {people === 1 ? 'persona' : 'personas'}
            </output>
            <button
              type="button"
              className="package-quote__btn"
              onClick={() => setPeople((n) => Math.min(maxPeople, n + 1))}
              disabled={people >= maxPeople}
              aria-label="Una persona más"
            >
              <i className="far fa-plus" aria-hidden></i>
            </button>
          </div>
        </li>
        <li className="package-quote">
          <div className="package-quote__price">
            <span className="package-quote__price-label">Precio desde</span>
            <span className="package-quote__price-amount">{tier.price}</span>
            <span className="package-quote__price-note">por persona</span>
          </div>
        </li>
        </>
      ) : (
        <>
          <li><span><i className="fal fa-box-usd"></i>{priceInternational ? 'Precio Nacional' : 'Precio desde'}<span>{price}</span></span></li>
          {priceInternational && <li><span><i className="fal fa-box-usd"></i>Precio Internacional<span>{priceInternational}</span></span></li>}
        </>
      )}
      <li>
        <div className="submit-button">
          <a href={whatsappHref(message)} target="_blank" rel="noopener noreferrer" className="main-btn primary-btn">
            Cotizar por WhatsApp<WhatsAppIcon className="whatsapp-icon" />
          </a>
        </div>
      </li>
    </>
  )
}
