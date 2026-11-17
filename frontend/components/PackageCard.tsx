import Link from 'next/link'
import { cloudinaryWidth } from '@/lib/cloudinary'

interface PackageCardProps {
  title: string
  image: string
  href: string
  /** Etiqueta fija sobre la foto: "Paquete", "Aventura", "Temporada". */
  tag: string
  badge?: 'nuevo' | 'pocos_lugares' | 'agotado' | 'oculto'
  description?: string
  departureDate?: string
  duration?: string
  route?: string
  price?: string
  priceLabel?: string
  className?: string
}

/** Separa la moneda final para mostrarla más chica: "$10,200 MXN" → ["$10,200", "MXN"]. */
function splitCurrency(price: string): [string, string | undefined] {
  const match = price.trim().match(/^(.*?)\s*\b(MXN|USD|EUR)\.?$/i)
  return match && match[1] ? [match[1], match[2].toUpperCase()] : [price, undefined]
}

const BADGE_TEXT = { nuevo: '¡Nuevo!', pocos_lugares: 'Pocos lugares', agotado: 'Agotado' } as const

/** Tarjeta de paquete del inicio: foto arriba, información abajo y precio al pie. */
export default function PackageCard({
  title,
  image,
  href,
  tag,
  badge,
  description,
  departureDate,
  duration,
  route,
  price,
  priceLabel = 'Precios desde',
  className = '',
}: PackageCardProps) {
  return (
    <Link href={href} className={`package-card ${className}`.trim()}>
      {badge && badge !== 'oculto' && (
        <span className={`package-card__stamp package-card__stamp--${badge}`}>
          <span className="package-card__stamp-face">{BADGE_TEXT[badge]}</span>
        </span>
      )}
      <div className="package-card__media">
        <div className="package-card__tags">
          <span className="package-card__tag">{tag}</span>
        </div>
        <img src={cloudinaryWidth(image, 800)} alt={title} loading="lazy" decoding="async" />
      </div>
      <div className="package-card__body">
        <h3 className="package-card__title">{title}</h3>
        {description && <p className="package-card__desc">{description}</p>}
        {departureDate && (
          <p className="package-card__meta"><i className="far fa-calendar-alt" aria-hidden></i>{departureDate}</p>
        )}
        {duration && (
          <p className="package-card__meta"><i className="far fa-clock" aria-hidden></i>{duration}</p>
        )}
        {route && (
          <p className="package-card__meta package-card__meta--route"><i className="far fa-map-marked-alt" aria-hidden></i><span className="package-card__route">{route}</span></p>
        )}
        <div className="package-card__foot">
          {price ? (
            <div>
              <span className="package-card__price-label">{priceLabel}</span>
              <PriceAmount price={price} />
            </div>
          ) : (
            <span className="package-card__price package-card__price--ask">Consultar precio</span>
          )}
          <span className="package-card__arrow" aria-hidden><i className="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </Link>
  )
}

function PriceAmount({ price }: { price: string }) {
  const [amount, currency] = splitCurrency(price)
  return (
    <span className="package-card__price">
      {amount}
      {currency && <span className="package-card__currency">{currency}</span>}
    </span>
  )
}
