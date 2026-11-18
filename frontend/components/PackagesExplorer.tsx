'use client'

import { useId, useMemo, useState, type ComponentProps } from 'react'
import PackageCard from '@/components/PackageCard'

type PackageCardProps = ComponentProps<typeof PackageCard>

export interface PackagesGroup {
  /** También define el color de la categoría (temporada · aventura · paquetes). */
  id: string
  /** Clase de Font Awesome del ícono de la categoría. */
  icon: string
  /** Texto del filtro ("Por temporada"). */
  label: string
  title: string
  subtitle?: string
  items: Array<PackageCardProps & { key: string }>
}

interface PackagesExplorerProps {
  groups: PackagesGroup[]
}

const DIACRITICS_RE = /[̀-ͯ]/g

function normalize(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase().trim()
}

/** Texto donde busca el buscador: nombre, ruta y descripción de la tarjeta. */
function searchableText(item: PackageCardProps): string {
  return normalize([item.title, item.route, item.description].filter(Boolean).join(' '))
}

/** Página de paquetes: buscador y filtros por categoría arriba; secciones por categoría con sus tarjetas. */
export default function PackagesExplorer({ groups }: PackagesExplorerProps) {
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

  const clearAll = () => {
    setQuery('')
    setCategory('todos')
  }

  return (
    <div className="packages-explorer">
      <div className="packages-explorer__toolbar">
        <div className="tours-filters__search packages-explorer__search">
          <label htmlFor={searchId} className="visually-hidden">Buscar paquete</label>
          <i className="far fa-search tours-filters__search-icon" aria-hidden />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o destino"
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

        {showFilters && (
          <div className="packages-explorer__chips" role="group" aria-label="Filtrar por categoría">
            {[{ id: 'todos', label: 'Todos', icon: '', count: total }, ...filtered.map((g) => ({ id: g.id, label: g.label, icon: g.icon, count: g.items.length }))].map((chip) => (
              <button
                key={chip.id}
                type="button"
                aria-pressed={category === chip.id}
                className={`packages-explorer__chip category-tone--${chip.id}${category === chip.id ? ' is-active' : ''}`}
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
        {visibleGroups.reduce((n, g) => n + g.items.length, 0)} paquetes encontrados
      </p>

      {visibleGroups.length > 0 ? (
        <div className="packages-explorer__groups">
        {visibleGroups.map((group) => (
          <section
            key={group.id}
            // Con 1 o 2 tarjetas la categoría ocupa solo esas columnas y puede compartir fila con la siguiente
            className={`packages-explorer__group category-tone--${group.id}${group.items.length <= 2 ? ` packages-explorer__group--span-${group.items.length}` : ''}`}
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
                <PackageCard {...card} />
              </div>
            ))}
          </section>
        ))}
        </div>
      ) : (
        <div className="packages-explorer__empty">
          <p>{query ? <>No encontramos paquetes que coincidan con «{query}».</> : 'No hay paquetes en esta categoría.'}</p>
          <button type="button" className="packages-explorer__reset" onClick={clearAll}>
            Ver todos los paquetes
          </button>
        </div>
      )}
    </div>
  )
}
