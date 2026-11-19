'use client'

import { useId, useMemo, useState, type ComponentProps } from 'react'
import PackageCard from '@/components/PackageCard'
import { useDict, useLang } from '@/components/LangProvider'

type PackageCardProps = ComponentProps<typeof PackageCard>

export interface CardsGroup {
  id: string
  /** Color de la categoría (temporada · aventura · paquetes · salida); por defecto el id. */
  tone?: string
  /** Clase de Font Awesome del ícono de la categoría. */
  icon: string
  /** Texto del filtro ("Por temporada"). */
  label: string
  title: string
  subtitle?: string
  /** Aviso cuando la categoría no tiene tarjetas (\n = salto de línea); si falta, se usa uno genérico. */
  emptyText?: string
  items: Array<PackageCardProps & { key: string }>
}

interface CardsExplorerProps {
  groups: CardsGroup[]
  /** Sustantivo en plural para mensajes ("paquetes", "tours"). */
  noun?: string
  searchPlaceholder?: string
  filterLabel?: string
}

const DIACRITICS_RE = /[̀-ͯ]/g

function normalize(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase().trim()
}

/** Texto donde busca el buscador: nombre, ruta y descripción de la tarjeta. */
function searchableText(item: PackageCardProps): string {
  return normalize([item.title, item.route, item.description].filter(Boolean).join(' '))
}

/** Listado con buscador y filtros por categoría arriba, y secciones por categoría con sus tarjetas (páginas Paquetes y Tours). */
export default function CardsExplorer({
  groups,
  noun,
  searchPlaceholder,
  filterLabel,
}: CardsExplorerProps) {
  const lang = useLang()
  const t = useDict().explorer
  noun ??= t.nounPackages
  searchPlaceholder ??= t.searchDefault
  filterLabel ??= t.filterDefault
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('todos')
  const searchId = useId()

  const tokens = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query])

  const filtered = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        items: tokens.length
          ? group.items.filter((item) => {
              const text = searchableText(item)
              return tokens.every((t) => text.includes(t))
            })
          : group.items,
      })),
    [groups, tokens],
  )

  const visibleGroups = filtered.filter(
    (g) => g.items.length > 0 && (category === 'todos' || g.id === category),
  )
  const total = filtered.reduce((n, g) => n + g.items.length, 0)
  const showFilters = groups.length > 1

  // Aviso sin resultados: la primera línea va como título y el resto como texto de apoyo
  const activeGroup = filtered.find((g) => g.id === category)
  const [emptyTitle, ...emptyRest] = (
    query
      ? t.noMatches(noun, query)
      : activeGroup?.emptyText ?? t.emptyCategory(noun)
  ).split('\n')
  const emptyDetail = emptyRest.join(' ').trim()
  const emptyIcon = query ? 'far fa-search' : activeGroup?.icon || 'far fa-search'
  const emptyTone = query ? 'neutro' : activeGroup?.tone ?? activeGroup?.id ?? 'neutro'

  const clearAll = () => {
    setQuery('')
    setCategory('todos')
  }

  return (
    <div className="packages-explorer">
      <div className="packages-explorer__toolbar">
        <div className="tours-filters__search packages-explorer__search">
          <label htmlFor={searchId} className="visually-hidden">{searchPlaceholder}</label>
          <i className="far fa-search tours-filters__search-icon" aria-hidden />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="tours-filters__input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="tours-filters__clear"
              aria-label={t.clearSearch}
            >
              ×
            </button>
          )}
        </div>

        {showFilters && (
          <div className="packages-explorer__chips" role="group" aria-label={filterLabel}>
            {[{ id: 'todos', label: t.all, icon: '', count: total }, ...filtered.map((g) => ({ id: g.id, tone: g.tone ?? g.id, label: g.label, icon: g.icon, count: g.items.length }))].map((chip) => (
              <button
                key={chip.id}
                type="button"
                aria-pressed={category === chip.id}
                className={`packages-explorer__chip category-tone--${'tone' in chip ? chip.tone : chip.id}${category === chip.id ? ' is-active' : ''}`}
                onClick={() => setCategory(chip.id)}
              >
                {chip.icon && <i className={`${chip.icon} packages-explorer__chip-icon`} aria-hidden></i>}
                {chip.label}
                <span className="packages-explorer__chip-count">{chip.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {visibleGroups.reduce((n, g) => n + g.items.length, 0)} {noun} encontrados
      </p>

      {visibleGroups.length > 0 ? (
        <div className="packages-explorer__groups">
        {visibleGroups.map((group) => (
          <section
            key={group.id}
            className={`packages-explorer__group category-tone--${group.tone ?? group.id}`}
            aria-labelledby={`grupo-${group.id}`}
          >
            <header className="packages-explorer__group-head">
              <span className="packages-explorer__group-icon" aria-hidden><i className={group.icon}></i></span>
              <h2 id={`grupo-${group.id}`} className="packages-explorer__group-title">
                {group.title}
                <span className="packages-explorer__group-count">{group.items.length}</span>
              </h2>
              {group.subtitle && <p className="packages-explorer__group-subtitle">{group.subtitle}</p>}
            </header>
            {group.items.map(({ key, ...card }) => (
              <div key={key} className="packages-explorer__item">
                <PackageCard {...card} lang={lang} />
              </div>
            ))}
          </section>
        ))}
        </div>
      ) : (
        <div className={`packages-explorer__empty category-tone--${emptyTone}`}>
          <span className="packages-explorer__empty-icon" aria-hidden><i className={emptyIcon}></i></span>
          <p className="packages-explorer__empty-title">{emptyTitle}</p>
          {emptyDetail && <p className="packages-explorer__empty-text">{emptyDetail}</p>}
          <button type="button" className="packages-explorer__reset" onClick={clearAll}>
            Ver todos los {noun}
          </button>
        </div>
      )}
    </div>
  )
}
