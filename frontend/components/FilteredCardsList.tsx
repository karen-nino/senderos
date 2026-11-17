'use client'

import { useMemo, useState, type ReactNode } from 'react'

export interface FilteredCardItem {
  title: string
  key: string
  content: ReactNode
  groupKey?: string
  groupLabel?: string
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

  const hasGroups = useMemo(
    () => items.some((it) => it.groupKey),
    [items],
  )

  const groups = useMemo(() => {
    if (!hasGroups) return null
    const map = new Map<string, { label: string; items: FilteredCardItem[] }>()
    for (const it of filtered) {
      const key = it.groupKey || '__ungrouped__'
      const label = it.groupLabel || ''
      if (!map.has(key)) map.set(key, { label, items: [] })
      map.get(key)!.items.push(it)
    }
    return Array.from(map.entries()).map(([key, value]) => ({ key, ...value }))
  }, [filtered, hasGroups])

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
        groups ? (
          groups.map((group, idx) => (
            <div
              key={group.key}
              className={`tours-group ${idx === groups.length - 1 ? '' : 'mb-120'} ${idx === 0 ? '' : 'pt-60'}`.trim()}
            >
              {group.label && (
                <div className="section-title text-center pt-40 mb-60 wow fadeInDown">
                  <span className="sub-title">{group.label}</span>
                </div>
              )}
              <div className={gridClassName}>
                {group.items.map((it) => (
                  <div key={it.key} className="places-section__item">
                    <div className="wow fadeInUp">{it.content}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={gridClassName}>
            {filtered.map((it) => (
              <div key={it.key} className="places-section__item">
                <div className="wow fadeInUp">{it.content}</div>
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="tours-filters__empty container text-center">{emptyMessage}</p>
      )}
    </>
  )
}
