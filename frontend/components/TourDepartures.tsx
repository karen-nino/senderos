'use client'

import React, { useState } from 'react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { whatsappHref } from '@/lib/contact'
import { useDict } from '@/components/LangProvider'

export interface TourDeparture {
  departure?: string
  transport?: string
  minimumParticipants?: string
  arrival?: Array<{
    value: string
    arrivalNationalPrice?: string
    arrivalInternationalPrice?: string
    arrivalHour?: string
    arrivalAccommodation?: string
  }>
  /** Mensaje de WhatsApp ya armado para esta salida (si hay varios regresos, el componente agrega el elegido). */
  whatsappMessage: string
}

interface TourDeparturesProps {
  departures: TourDeparture[]
  /** Duración del tour; es la misma para todas las salidas. */
  duration?: string
  /** Prefijo para ids únicos: el bloque se pinta dos veces (móvil y escritorio). */
  idPrefix: string
  className?: string
}

/**
 * Caja "Detalles del Tour". Con varias salidas muestra un selector "¿Desde dónde sales?", y si la salida tiene
 * varios regresos, otro "¿Hacia dónde regresas?"; solo se ven los datos (hora, alojamiento, precios) de lo elegido,
 * para que quede claro que son alternativas. El botón de WhatsApp manda la salida y el regreso elegidos.
 */
export default function TourDepartures({ departures, duration, idPrefix, className = '' }: TourDeparturesProps) {
  const [active, setActive] = useState(0)
  const [activeArrival, setActiveArrival] = useState(0)
  const t = useDict().tour
  const dep = departures[active] ?? departures[0]
  const hasChoice = departures.length > 1
  if (!dep) return null
  const arrivals = dep.arrival ?? []
  const hasArrivalChoice = arrivals.length > 1
  const arrival = arrivals[activeArrival] ?? arrivals[0]
  const whatsappMessage = hasArrivalChoice && arrival
    ? `${dep.whatsappMessage}\n- ${t.msgTo(arrival.value.trim())}`
    : dep.whatsappMessage

  return (
    <div className={`sidebar-widget booking-info-widget tour-departures ${className}`.trim()}>
      <div className="pb-2 border-bottom">
        <h4 className="">{t.detailsTitle}</h4>
        {hasChoice ? (
          <>
            <p className="tour-departures__question" id={`${idPrefix}-question`}>
              {t.departuresCount(departures.length)}
              <br />
              {t.whereFrom}
            </p>
            <div className="tour-departures__tabs" role="tablist" aria-labelledby={`${idPrefix}-question`}>
              {departures.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  id={`${idPrefix}-tab-${i}`}
                  aria-selected={i === active}
                  aria-controls={`${idPrefix}-panel`}
                  className={`tour-departures__tab${i === active ? ' is-active' : ''}`}
                  onClick={() => { setActive(i); setActiveArrival(0) }}
                >
                  <i className="far fa-map-marker-alt" aria-hidden></i>
                  {d.departure || t.option(i + 1)}
                </button>
              ))}
            </div>
          </>
        ) : null}
        {hasArrivalChoice && (
          <>
            <p className="tour-departures__question" id={`${idPrefix}-arrival-question`}>
              {!hasChoice && <>{t.returnsCount(arrivals.length)}<br /></>}
              {t.whereTo}
            </p>
            <div className="tour-departures__tabs" role="tablist" aria-labelledby={`${idPrefix}-arrival-question`}>
              {arrivals.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  id={`${idPrefix}-arrival-tab-${i}`}
                  aria-selected={i === activeArrival}
                  aria-controls={`${idPrefix}-panel`}
                  className={`tour-departures__tab${i === activeArrival ? ' is-active' : ''}`}
                  onClick={() => setActiveArrival(i)}
                >
                  <i className="far fa-map-marker-alt" aria-hidden></i>
                  {a.value || t.option(i + 1)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <ul
        className="info-list pt-3"
        id={`${idPrefix}-panel`}
        role={hasChoice ? 'tabpanel' : undefined}
        aria-labelledby={hasChoice ? `${idPrefix}-tab-${active}` : undefined}
      >
        <li><span><i className="fal fa-clock"></i>{t.duration}<span style={{ float: 'none' }}>{duration || t.variable}</span></span></li>
        {dep.minimumParticipants && <li><span><i className="fal fa-users"></i>{t.minParticipants}<span style={{ float: 'none' }}>{dep.minimumParticipants}</span></span></li>}
        {dep.departure && <li><span><i className="far fa-map-marker-alt"></i>{t.departureFrom}<span style={{ float: 'none', display: 'block' }}>{dep.departure}</span></span></li>}
        {/* Un solo regreso a la vista: el único que hay o el elegido en el selector */}
        {arrival && (
          <React.Fragment key={`arrival-${active}-${activeArrival}`}>
            <li><span><i className="far fa-map-marker-alt"></i>{t.returnTo}<span style={{ float: 'none', display: 'block'}}>{arrival.value}</span>{arrival.arrivalHour && <span style={{ float: 'none', display: 'block' }}>{arrival.arrivalHour}</span>}</span></li>
            {arrival.arrivalAccommodation && <li><span><i className="far fa-bed"></i>{t.accommodation}<span style={{ float: 'none', display: 'block' }}>{arrival.arrivalAccommodation}</span></span></li>}
          </React.Fragment>
        )}
        {dep.transport && <li><span><i className="fal fa-bus"></i>{t.transport}<span style={{ float: 'none' }}>{dep.transport}</span></span></li>}
        {arrival?.arrivalNationalPrice && (
          <li><span><i className="fal fa-box-usd"></i>{arrival.arrivalInternationalPrice ? t.priceNationalFrom : t.priceFrom}<span style={{ float: 'none' }}>{arrival.arrivalNationalPrice}</span></span></li>
        )}
        {arrival?.arrivalInternationalPrice && (
          <li><span><i className="fal fa-box-usd"></i>{t.priceInternationalFrom}<span style={{ float: 'none' }}>{arrival.arrivalInternationalPrice}</span></span></li>
        )}
        <li className="tour-details-wa-cta-mobile">
          <div className="submit-button">
            <a
              href={whatsappHref(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="main-btn primary-btn"
            >
              {t.checkAvailability}<WhatsAppIcon className="whatsapp-icon" />
            </a>
          </div>
        </li>
      </ul>
    </div>
  )
}
