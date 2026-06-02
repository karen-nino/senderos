'use client'

import { useMemo, useState } from 'react'
import TourItem from '@/components/TourItem'
import {
  type AdaptedDestination,
  getTourDetailHref,
  tourCardSubtitle,
} from '@/lib/strapi'

interface ToursListWithFiltersProps {
  destinations: AdaptedDestination[]
}

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

const DIACRITICS_RE = /[̀-ͯ]/g

function normalize(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase().trim()
}

function titleWords(title: string): string[] {
  return normalize(title).split(/\s+/).filter(Boolean)
}

function titleInitials(title: string): Set<string> {
  const set = new Set<string>()
  for (const w of titleWords(title)) set.add(w.charAt(0).toUpperCase())
  return set
}

export default function ToursListWithFilters({ destinations }: ToursListWithFiltersProps) {
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<string | null>(null)

  const selectLetter = (next: string | null) => {
    setLetter(next)
  }

  const availableLetters = useMemo(() => {
    const set = new Set<string>()
    for (const d of destinations) for (const i of titleInitials(d.title)) set.add(i)
    return set
  }, [destinations])

  const filtered = useMemo(() => {
    const queryTokens = normalize(query).split(/\s+/).filter(Boolean)
    return destinations.filter((d) => {
      const words = titleWords(d.title)
      const matchesQuery =
        queryTokens.length === 0 ||
        queryTokens.every((token) => words.some((w) => w.includes(token)))
      const matchesLetter = !letter || titleInitials(d.title).has(letter)
      return matchesQuery && matchesLetter
    })
  }, [destinations, query, letter])

  return (
    <>
      <div className="tours-filters container">
        <div className="tours-filters__search">
          <i className="far fa-search tours-filters__search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tour por nombre"
            aria-label="Buscar tour por nombre"
            className="tours-filters__input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="tours-filters__clear"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <div className="tours-filters__alphabet-wrap">
          {/* Mobile/tablet: select nativo */}
          <div className="tours-filters__alphabet-select-wrap">
            <select
              className="tours-filters__alphabet-select"
              value={letter ?? ''}
              onChange={(e) => selectLetter(e.target.value || null)}
              aria-label="Filtrar por letra inicial"
            >
              <option value="">Todos</option>
              {ALPHABET.map((l) => {
                const enabled = availableLetters.has(l)
                return (
                  <option key={l} value={l} disabled={!enabled}>
                    {l}
                  </option>
                )
              })}
            </select>
            <i className="far fa-chevron-down tours-filters__alphabet-select-icon" aria-hidden />
          </div>

          {/* Desktop: fila de letras */}
          <div
            className="tours-filters__alphabet"
            role="group"
            aria-label="Filtrar por letra inicial"
          >
            <button
              type="button"
              onClick={() => selectLetter(null)}
              className={`tours-filters__letter${letter === null ? ' is-active' : ''}`}
              aria-pressed={letter === null}
            >
              Todos
            </button>
            {ALPHABET.map((l) => {
              const enabled = availableLetters.has(l)
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => enabled && selectLetter(letter === l ? null : l)}
                  className={`tours-filters__letter${letter === l ? ' is-active' : ''}${enabled ? '' : ' is-disabled'}`}
                  aria-pressed={letter === l}
                  disabled={!enabled}
                >
                  {l}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="places-section__container">
        {filtered.length > 0 ? (
          <div className="places-section__grid">
            {filtered.map((destination, index) => (
              <div
                key={destination.link || destination.title || index}
                className="places-section__item"
              >
                <div className="wow fadeInUp">
                  <TourItem
                    title={destination.title}
                    subtitle={tourCardSubtitle(destination)}
                    image={destination.image}
                    link={getTourDetailHref(destination)}
                    departureDate={destination.departureDate}
                    duration={destination.duration}
                    price={destination.price}
                    badge={destination.badge}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="tours-filters__empty container text-center">
            No encontramos tours que coincidan con tu búsqueda.
          </p>
        )}
      </div>
    </>
  )
}
