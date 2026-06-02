'use client'

import { useMemo, useState, type ReactNode } from 'react'

export interface FilteredCardItem {
  title: string
  key: string
  content: ReactNode
}

interface FilteredCardsListProps {
  items: FilteredCardItem[]
  searchPlaceholder?: string
  emptyMessage?: string
  gridClassName?: string
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

export default function FilteredCardsList({
  items,
  searchPlaceholder = 'Buscar por nombre',
  emptyMessage = 'No encontramos resultados que coincidan con tu búsqueda.',
  gridClassName = 'places-section__grid',
}: FilteredCardsListProps) {
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<string | null>(null)

  const availableLetters = useMemo(() => {
    const set = new Set<string>()
    for (const it of items) for (const i of titleInitials(it.title)) set.add(i)
    return set
  }, [items])

  const filtered = useMemo(() => {
    const queryTokens = normalize(query).split(/\s+/).filter(Boolean)
    return items.filter((it) => {
      const words = titleWords(it.title)
      const matchesQuery =
        queryTokens.length === 0 ||
        queryTokens.every((token) => words.some((w) => w.includes(token)))
      const matchesLetter = !letter || titleInitials(it.title).has(letter)
      return matchesQuery && matchesLetter
    })
  }, [items, query, letter])

  return (
    <>
      <div className="tours-filters container">
        <div className="tours-filters__search">
          <i className="far fa-search tours-filters__search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
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
          <div className="tours-filters__alphabet-select-wrap">
            <select
              className="tours-filters__alphabet-select"
              value={letter ?? ''}
              onChange={(e) => setLetter(e.target.value || null)}
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

          <div
            className="tours-filters__alphabet"
            role="group"
            aria-label="Filtrar por letra inicial"
          >
            <button
              type="button"
              onClick={() => setLetter(null)}
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
                  onClick={() => enabled && setLetter(letter === l ? null : l)}
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

      {filtered.length > 0 ? (
        <div className={gridClassName}>
          {filtered.map((it) => (
            <div key={it.key} className="places-section__item">
              <div className="wow fadeInUp">{it.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="tours-filters__empty container text-center">{emptyMessage}</p>
      )}
    </>
  )
}
