import Link from 'next/link'

interface TourItemProps {
    title: string
    subtitle: string
    image: string
    link?: string
    departureDate?: string
    price?: string
    duration?: string
    badge?: 'nuevo' | 'pocos_lugares' | 'agotado' | 'oculto'
}

export default function TourItem({
    title,
    subtitle,
    image,
    link,
    departureDate,
    price,
    duration,
    badge
}: TourItemProps) {
    // Asegurar que el enlace sea siempre /tour-detalles/[slug] (si link es solo el slug, añadir ruta)
    const href = !link
        ? '/tour-detalles/chiapas'
        : link.startsWith('/')
            ? link
            : `/tour-detalles/${link}`
    return (
        <Link href={href} className="single-service-item mb-40 d-block text-decoration-none">
            <div className="content">
                <h3 className="title">{title}</h3>
                <p className='pb-2'>{subtitle}</p>
                {(departureDate || price || duration) && (
                    <div className="destination-info mb-15">
                        {departureDate && (
                            <div className="departure-date">
                                <span className="label">Fecha de salida:</span>
                                <div className="value-wrapper">
                                    <i className="far fa-calendar-alt"></i>
                                    <span className="value">{departureDate}</span>
                                </div>
                            </div>
                        )}
                        {duration && (
                            <div className="duration">
                                <span className="label">Tiempo:</span>
                                <span className="value">{duration}</span>
                            </div>
                        )}
                        {price && (
                            <div className="price price--highlight">
                                <span className="label">Precio por persona:</span>
                                <span className="price-amount">{price}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="img-holder destination-img-wrapper">
                {badge && badge !== 'oculto' && (
                    <span
                        className={`destination-badge destination-badge--${badge}`}
                        aria-label={badge === 'nuevo' ? 'Nuevo destino' : badge === 'pocos_lugares' ? 'Pocos lugares disponibles' : 'Agotado'}
                    >
                        {badge === 'nuevo' ? '¡NUEVO!' : badge === 'pocos_lugares' ? 'POCOS LUGARES' : 'AGOTADO'}
                    </span>
                )}
                <img src={image} alt={title} />
            </div>
            <span className="tour-item-more-info-btn">Más información</span>
        </Link>
    )
}
