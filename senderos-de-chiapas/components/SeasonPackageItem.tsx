import Link from 'next/link'

interface SeasonPackageItemProps {
  title: string
  image: string
  link: string
  category?: string
  dateFormatted?: string
  description?: string
  duration?: string
  price?: string
  badge?: 'nuevo' | 'pocos_lugares' | 'agotado' | 'oculto'
  /** 'section' = home en columnas. 'card' = página Paquetes (mismo layout que PackageItem) */
  variant?: 'section' | 'card'
}

function SeasonPackageCardBody({
  title,
  image,
  link,
  category,
  dateFormatted,
  description,
  duration,
  price,
  badge,
}: Omit<SeasonPackageItemProps, 'variant'>) {
  const href = !link?.trim() || link === '#'
    ? '/paquetes'
    : link.startsWith('/')
      ? link
      : `/paquete-detalles/${link}`

  return (
    <div className="single-service-item mb-40">
      <div className="content">
        {category ? (
          <div className="mb-10">
            <span className="seasonal-pill">{category}</span>
          </div>
        ) : null}
        <h3 className="title">{title}</h3>
        {description ? <p className="pb-2">{description}</p> : null}
        {(dateFormatted || duration || price) && (
          <div className="destination-info mb-15">
            {dateFormatted ? (
              <div className="departure-date">
                <span className="label">Fecha de salida:</span>
                <div className="value-wrapper">
                  <i className="far fa-calendar-alt" />
                  <span className="value">{dateFormatted}</span>
                </div>
              </div>
            ) : null}
            {duration ? (
              <div className="duration">
                <span className="label">Tiempo:</span>
                <span className="value">{duration}</span>
              </div>
            ) : null}
            {price ? (
              <div className="price price--highlight">
                <span className="label">Precio por persona:</span>
                <span className="price-amount">{price}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="img-holder destination-img-wrapper">
        {badge && badge !== 'oculto' ? (
          <span
            className={`destination-badge destination-badge--${badge}`}
            aria-label={
              badge === 'nuevo'
                ? 'Nuevo paquete'
                : badge === 'pocos_lugares'
                  ? 'Pocos lugares disponibles'
                  : 'Agotado'
            }
          >
            {badge === 'nuevo'
              ? '¡NUEVO!'
              : badge === 'pocos_lugares'
                ? 'POCOS LUGARES'
                : 'AGOTADO'}
          </span>
        ) : null}
        <img src={image} alt={title || 'Paquete de temporada'} />
      </div>
      <Link href={href} className="tour-item-more-info-btn">
        Más información
      </Link>
    </div>
  )
}

export default function SeasonPackageItem({
  title,
  image,
  link,
  category,
  dateFormatted,
  description,
  duration,
  price,
  badge,
  variant = 'section',
}: SeasonPackageItemProps) {
  const props = {
    title,
    image,
    link,
    category,
    dateFormatted,
    description,
    duration,
    price,
    badge,
  }

  if (variant === 'card') {
    return <SeasonPackageCardBody {...props} />
  }

  return (
    <div className="col-lg-4 col-md-6 col-sm-12">
      <div className="wow fadeInUp">
        <SeasonPackageCardBody {...props} />
      </div>
    </div>
  )
}
