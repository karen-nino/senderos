'use client'

import React, { useState } from 'react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { whatsappHref } from '@/lib/contact'

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
  /** Mensaje de WhatsApp ya armado para esta salida. */
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
 * Caja "Detalles del Tour". Con varias salidas muestra un selector "¿Desde dónde sales?" y solo los datos
 * de la salida elegida, para que quede claro que son alternativas; el botón de WhatsApp manda esa salida.
 */
export default function TourDepartures({ departures, duration, idPrefix, className = '' }: TourDeparturesProps) {
  const [active, setActive] = useState(0)
  const dep = departures[active] ?? departures[0]
  const hasChoice = departures.length > 1
  if (!dep) return null

  return (
    <div className={`sidebar-widget booking-info-widget tour-departures ${className}`.trim()}>
      <div className="pb-2 border-bottom">
        <h4 className="">Detalles del Tour</h4>
        {hasChoice ? (
          <>
            <p className="tour-departures__question" id={`${idPrefix}-question`}>
              Este tour tiene {departures.length} puntos de salida. ¿Desde dónde sales?
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
                  onClick={() => setActive(i)}
                >
                  <i className="far fa-map-marker-alt" aria-hidden></i>
                  {d.departure || `Opción ${i + 1}`}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
      <ul
        className="info-list pt-3"
        id={`${idPrefix}-panel`}
        role={hasChoice ? 'tabpanel' : undefined}
        aria-labelledby={hasChoice ? `${idPrefix}-tab-${active}` : undefined}
      >
        <li><span><i className="fal fa-clock"></i>Duración<span style={{ float: 'none' }}>{duration || 'Variable'}</span></span></li>
        {dep.minimumParticipants && <li><span><i className="fal fa-users"></i>Mínimo de participantes<span style={{ float: 'none' }}>{dep.minimumParticipants}</span></span></li>}
        {dep.departure && <li><span><i className="far fa-map-marker-alt"></i>Salida desde<span style={{ float: 'none', display: 'block' }}>{dep.departure}</span></span></li>}
        {dep.arrival && dep.arrival.length > 0 && (
          dep.arrival.length === 1 ? (
            <React.Fragment>
              <li><span><i className="far fa-map-marker-alt"></i>Regreso hacia<span style={{ float: 'none', display: 'block'}}>{dep.arrival[0].value}</span><span style={{ float: 'none', display: 'block' }}>{dep.arrival[0].arrivalHour}</span></span></li>
              {dep.transport && <li><span><i className="fal fa-bus"></i>Transporte<span style={{ float: 'none' }}>{dep.transport}</span></span></li>}
              {dep.arrival[0].arrivalNationalPrice && (
                <li><span><i className="fal fa-box-usd"></i>{dep.arrival[0].arrivalInternationalPrice ? 'Precio Nacional desde' : 'Precio desde'}<span style={{ float: 'none' }}>{dep.arrival[0].arrivalNationalPrice}</span></span></li>
              )}
              {dep.arrival[0].arrivalInternationalPrice && (
                <li><span><i className="fal fa-box-usd"></i>Precio Internacional desde<span style={{ float: 'none' }}>{dep.arrival[0].arrivalInternationalPrice}</span></span></li>
              )}
            </React.Fragment>
          ) : (
            dep.arrival.map((a, i) => (
              <React.Fragment key={`arrival-${active}-${i}`}>
                <li><span><i className="far fa-map-marker-alt pb-3"></i>{`Regreso hacia`}<span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.value}</span><span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.arrivalHour}</span>{a.arrivalAccommodation && (<><span className='pt-3' style={{ float: 'none', display: 'block'}}>Alojamiento</span><span className='pb-1' style={{ float: 'none', display: 'block'}}>{a.arrivalAccommodation}</span></>)}{a.arrivalNationalPrice && (<><span className='pt-3' style={{ float: 'none', display: 'block'}}>{a.arrivalInternationalPrice ? 'Precio Nacional desde' : 'Precio desde'}</span><span style={{ float: 'none', display: 'block', fontSize: '22px' }}>{a.arrivalNationalPrice}</span></>)}{a.arrivalInternationalPrice && (<><span className='pt-3' style={{ float: 'none', display: 'block'}}>Precio Internacional desde</span><span style={{ float: 'none', display: 'block', fontSize: '22px' }}>{a.arrivalInternationalPrice}</span></>)}</span></li>
              </React.Fragment>
            ))
          )
        )}
        {/* Con un regreso el transporte va justo después de él; con varios, después de todos (sus precios van dentro de cada uno) */}
        {(!dep.arrival || dep.arrival.length !== 1) && dep.transport && <li><span><i className="fal fa-bus"></i>Transporte<span style={{ float: 'none' }}>{dep.transport}</span></span></li>}
        <li className="tour-details-wa-cta-mobile">
          <div className="submit-button">
            <a
              href={whatsappHref(dep.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="main-btn primary-btn"
            >
              Consulta disponibilidad<WhatsAppIcon className="whatsapp-icon" />
            </a>
          </div>
        </li>
      </ul>
    </div>
  )
}
