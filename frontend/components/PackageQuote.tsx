'use client'

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from '@daypicker/react'
import { es } from '@daypicker/react/locale'
import '@daypicker/react/style.css'
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

/** Rango del contador: de la tabla (un rango abierto como "8+" permite hasta 8 + 7) o 1–fallbackMax sin tabla. */
function peopleRange(tiers: Tier[] | null, fallbackMax: number): { min: number; max: number } {
  if (!tiers) return { min: 1, max: fallbackMax }
  return { min: tiers[0].min, max: Math.max(...tiers.map((t) => (Number.isFinite(t.max) ? t.max : t.min + 7))) }
}

/** Precio del grupo que contiene a ese número; si cae entre grupos, el del grupo menor más cercano. */
function tierFor(tiers: Tier[], people: number): Tier {
  return tiers.find((t) => people >= t.min && people <= t.max) ?? [...tiers].reverse().find((t) => people >= t.min) ?? tiers[0]
}

/**
 * Precio en la caja "Detalles del paquete". Si hay tabla de precio por grupo, la persona elige cuántas van
 * con un contador (−/+) y ve el precio por persona de ese grupo; el mensaje de WhatsApp lleva esa elección.
 * En paquetes de aventura la caja solo muestra el botón: contador, fechas y motivo van en el modal.
 */
export default function PackageQuote({ price, priceInternational, pricePerPerson, title, isAdventure = false }: PackageQuoteProps) {
  const tiers = useMemo(() => buildTiers(pricePerPerson), [pricePerPerson])
  const { min: minPeople, max: maxPeople } = peopleRange(tiers, 1)
  const [people, setPeople] = useState(minPeople)
  const labelId = useId()
  const tier = tiers ? tierFor(tiers, people) : null

  // Mensaje corto: nombre del paquete y, si eligió en el contador, cuántas personas
  const message = [
    'Hola 👋, me gustaría cotizar el siguiente paquete:',
    '',
    `🧳 *${title}*`,
    ...(tier ? [`- ${people} ${people === 1 ? 'Persona' : 'Personas'}`] : []),
  ].join('\n')

  const dialogRef = useRef<HTMLDialogElement>(null)

  if (isAdventure) {
    return (
      <li>
        <div className="submit-button">
          <button type="button" className="main-btn primary-btn" onClick={() => dialogRef.current?.showModal()}>
            Cotizar por WhatsApp<WhatsAppIcon className="whatsapp-icon" />
          </button>
        </div>
        <QuoteModal dialogRef={dialogRef} title={title} tiers={tiers} />
      </li>
    )
  }

  return (
    <>
      {tier ? (
        <>
        <li className="package-quote">
          <span className="package-quote__label" id={labelId}>
            <i className="fal fa-users" aria-hidden></i>¿Cuántas personas viajan?
          </span>
          <PeopleStepper labelId={labelId} people={people} min={minPeople} max={maxPeople} onChange={setPeople} />
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

function PeopleStepper({ labelId, people, min, max, onChange, numberOnly = false }: {
  labelId: string
  people: number
  min: number
  max: number
  onChange: (n: number) => void
  /** Solo el número ("4") en vez de "4 personas"; el lector de pantalla sigue oyendo "4 personas". */
  numberOnly?: boolean
}) {
  const peopleText = `${people} ${people === 1 ? 'persona' : 'personas'}`
  return (
    <div className="package-quote__stepper" role="group" aria-labelledby={labelId}>
      <button
        type="button"
        className="package-quote__btn"
        onClick={() => onChange(Math.max(min, people - 1))}
        disabled={people <= min}
        aria-label="Una persona menos"
      >
        <i className="far fa-minus" aria-hidden></i>
      </button>
      <output className="package-quote__count" aria-live="polite" aria-label={numberOnly ? peopleText : undefined}>
        {numberOnly ? people : peopleText}
      </output>
      <button
        type="button"
        className="package-quote__btn"
        onClick={() => onChange(Math.min(max, people + 1))}
        disabled={people >= max}
        aria-label="Una persona más"
      >
        <i className="far fa-plus" aria-hidden></i>
      </button>
    </div>
  )
}

const REASONS = ['Cumpleaños', 'Aniversario', 'Luna de miel', 'Vacaciones en familia', 'Viaje con amigos', 'Otro'] as const

/** Date → "sábado 15 de marzo de 2027". */
function formatDate(date: Date): string {
  return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** Como el calendario de los detalles de tour/paquete (theme.js): semana desde domingo, días en dos letras y "HOY". */
const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
const CALENDAR_FORMATTERS = {
  formatWeekdayName: (d: Date) => WEEKDAYS[d.getDay()],
  formatDay: (d: Date) => (d.toDateString() === new Date().toDateString() ? 'HOY' : String(d.getDate())),
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Modal de cotización de paquetes de aventura: contador de personas, fecha de salida y motivo opcional;
 * abre WhatsApp con todo en el mensaje.
 */
function QuoteModal({ dialogRef, title, tiers }: {
  dialogRef: RefObject<HTMLDialogElement>
  title: string
  tiers: Tier[] | null
}) {
  const { min: minPeople, max: maxPeople } = peopleRange(tiers, 30)
  const [people, setPeople] = useState(minPeople)
  const [departure, setDeparture] = useState<Date | undefined>()
  const [dateError, setDateError] = useState(false)
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const titleId = useId()
  const peopleLabelId = useId()
  const today = useMemo(startOfToday, [])
  // Mes que se está viendo: los días grises de otros meses se ven pero no se pueden elegir
  const [month, setMonth] = useState(today)
  const isOtherMonth = (d: Date) => d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()
  const close = () => dialogRef.current?.close()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!departure) {
      setDateError(true)
      return
    }
    const motive = reason === 'Otro' ? otherReason.trim() : reason
    const message = [
      'Hola 👋, me gustaría cotizar el siguiente paquete:',
      '',
      `🧗‍♂️ *${title}*`,
      `- ${people} ${people === 1 ? 'Persona' : 'Personas'}`,
      `- Fecha deseada de salida: ${formatDate(departure)} (por confirmar disponibilidad)`,
      ...(motive ? [`- Motivo del viaje: ${motive}`] : []),
    ].join('\n')
    window.open(whatsappHref(message), '_blank', 'noopener,noreferrer')
    close()
  }

  // El modal se monta en <body>: dentro de la caja "Detalles del paquete" heredaba los estilos del tema
  // para `ul.info-list li span` (tamaño y peso de letra) y desacomodaba el calendario y la fecha elegida.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <dialog
      ref={dialogRef}
      className="quote-modal"
      aria-labelledby={titleId}
      // Clic fuera de la tarjeta (en el fondo oscuro) cierra el modal
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <form className="quote-modal__card" onSubmit={handleSubmit}>
        <div className="quote-modal__head">
          <div>
            <span className="quote-modal__eyebrow">Cotiza tu aventura</span>
            <h3 className="quote-modal__title" id={titleId}>{title}</h3>
          </div>
          <button type="button" className="quote-modal__close" onClick={close} aria-label="Cerrar">
            <i className="far fa-times" aria-hidden></i>
          </button>
        </div>

        <div className="quote-modal__field">
          <span className="quote-modal__label" id={peopleLabelId}>¿Cuántas personas viajan?</span>
          <div className="quote-modal__people">
            <i className="fal fa-users" aria-hidden></i>
            <PeopleStepper labelId={peopleLabelId} people={people} min={minPeople} max={maxPeople} onChange={setPeople} numberOnly />
          </div>
        </div>

        <hr className="quote-modal__divider" />

        <fieldset className="quote-modal__field">
          <legend className="quote-modal__label">
            ¿Cuándo te gustaría salir?
            <span className="quote-modal__subtitle">
              Elige tu fecha ideal en el calendario. Revisamos la disponibilidad y te confirmamos por WhatsApp.
            </span>
          </legend>
          {/* Tarjeta de fondo claro para que el calendario se distinga del resto del modal */}
          <div className="quote-modal__calendar-card">
            <DayPicker
              className="quote-modal__calendar"
              mode="single"
              locale={es}
              weekStartsOn={0}
              navLayout="around"
              showOutsideDays
              formatters={CALENDAR_FORMATTERS}
              selected={departure}
              onSelect={(d) => { setDeparture(d); if (d) setDateError(false) }}
              month={month}
              onMonthChange={setMonth}
              disabled={[{ before: today }, isOtherMonth]}
              startMonth={today}
            />
          </div>
          {/* Fecha elegida (o aviso si falta) en su propia caja, fuera del calendario */}
          <div className={`quote-modal__selection${dateError ? ' quote-modal__selection--error' : ''}`} aria-live="polite">
            {departure ? (
              <>
                <span>
                  <i className="far fa-calendar-alt" aria-hidden></i>
                  <span>Fecha deseada: <strong>{formatDate(departure)}</strong></span>
                </span>
                <button type="button" className="quote-modal__clear" onClick={() => setDeparture(undefined)}>Cambiar</button>
              </>
            ) : dateError && (
              <span role="alert">Elige el día en que te gustaría salir.</span>
            )}
          </div>
        </fieldset>

        <hr className="quote-modal__divider" />

        <fieldset className="quote-modal__field">
          <legend className="quote-modal__label">Motivo del viaje <em>(opcional)</em></legend>
          <div className="quote-modal__chips">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                className="quote-modal__chip"
                aria-pressed={reason === r}
                onClick={() => setReason((cur) => (cur === r ? '' : r))}
              >
                {r}
              </button>
            ))}
          </div>
          {reason === 'Otro' && (
            <textarea
              className="quote-modal__input quote-modal__textarea"
              rows={3}
              placeholder="Cuéntanos el motivo"
              aria-label="Otro motivo del viaje"
              maxLength={200}
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              autoFocus
            />
          )}
        </fieldset>

        <button type="submit" className="main-btn primary-btn quote-modal__submit">
          Cotizar por WhatsApp<WhatsAppIcon className="whatsapp-icon" />
        </button>
      </form>
    </dialog>,
    document.body,
  )
}
