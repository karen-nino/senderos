import Link from 'next/link'

interface TourItemProps {
    title: string
    description: string
    image: string
    link?: string
    departureDate?: string
    price?: string
    duration?: string
    badge?: 'new' | 'few_left' | 'sold_out' | 'hide'
}

export default function TourItem({
    title,
    description,
    image,
    link,
    departureDate,
    price,
    duration,
    badge
}: TourItemProps) {
    // Asegurar que el enlace sea siempre /tour-details/[slug] (si link es solo el slug, añadir ruta)
    const href = !link
        ? '/tour-details/chiapas'
        : link.startsWith('/')
            ? link
            : `/tour-details/${link}`
    return (
        <div className="single-service-item mb-40">
            <div className="content">
                <h3 className="title">{title}</h3>
                <p className='pb-2'>{description}</p>
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
                {badge && badge !== 'hide' && (
                    <span
                        className={`destination-badge destination-badge--${badge}`}
                        aria-label={badge === 'new' ? 'Nuevo destino' : badge === 'few_left' ? 'Pocos lugares disponibles' : 'Agotado'}
                    >
                        {badge === 'new' ? '¡NUEVO!' : badge === 'few_left' ? 'POCOS LUGARES' : 'AGOTADO'}
                    </span>
                )}
                <img src={image} alt={title} />
            </div>
            <Link href={href} className="tour-item-more-info-btn">Más información</Link>
        </div>
    )
}
