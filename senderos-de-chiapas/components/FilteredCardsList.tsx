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

const DIACRITICS_RE = /[̀-ͯ]/g

function normalize(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase().trim()
}

function titleWords(title: string): string[] {
  return normalize(title).split(/\s+/).filter(Boolean)
}

export default function FilteredCardsList({
  items,
  searchPlaceholder = 'Buscar por nombre',
  emptyMessage = 'No encontramos resultados que coincidan con tu búsqueda.',
  gridClassName = 'places-section__grid',
}: FilteredCardsListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const queryTokens = normalize(query).split(/\s+/).filter(Boolean)
    if (queryTokens.length === 0) return items
    return items.filter((it) => {
      const words = titleWords(it.title)
      return queryTokens.every((token) => words.some((w) => w.includes(token)))
    })
  }, [items, query])

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
