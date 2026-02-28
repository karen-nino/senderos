interface InternationalItemProps {
    title: string
    description: string
    image: string
    /** @deprecated El item ya no navega a otra página */
    link?: string
    icons?: string[]
    departureDate?: string
    price?: string
    accommodation?: string
    duration?: string
    badge?: 'nuevo' | 'pocos_lugares' | 'agotado'
    /** Campos de Strapi International */
    route?: string
    transport?: string
    departure?: string
    /** Lista de ítems para "Incluye" (se muestra como lista vertical) */
    includes?: string[]
}

export default function InternationalItem({
    title,
    description,
    image,
    icons = ['flaticon-blanket', 'flaticon-cat', 'flaticon-tent', 'flaticon-fire'],
    departureDate,
    price,
    accommodation,
    duration,
    badge,
    route,
    transport,
    departure,
    includes
}: InternationalItemProps) {
    return (
        <div className="single-service-item international-item mb-40">
            <div className="content">
                <h3 className="title">{title}</h3>
                <p className='pb-2'>{description}</p>
                {(departureDate || price || accommodation || duration || route || transport || departure || (includes && includes.length > 0)) && (
                    <div className="international-info mb-15">
                        {departureDate && (
                            <div className="departure-date">
                                <span className="label">Fecha de salida:</span>
                                <div className="value-wrapper">
                                    <i className="far fa-calendar-alt"></i>
                                    <span className="value">{departureDate}</span>
                                </div>
                            </div>
                        )}
                        {route && (
                            <div className="route">
                                <span className="label">Ruta:</span>
                                <span className="value">{route}</span>
                            </div>
                        )}
                        {transport && (
                            <div className="transport">
                                <span className="label">Transporte:</span>
                                <span className="value">{transport}</span>
                            </div>
                        )}
                        {departure && (
                            <div className="departure">
                                <span className="label">Salida:</span>
                                <span className="value">{departure}</span>
                            </div>
                        )}
                        {duration && (
                            <div className="duration">
                                <span className="label">Duración:</span>
                                <span className="value">{duration}</span>
                            </div>
                        )}
                        {accommodation && (
                            <div className="accommodation">
                                <span className="label">Hospedaje:</span>
                                <span className="value">{accommodation}</span>
                            </div>
                        )}
                        {includes && includes.length > 0 && (() => {
                            const rows = includes.flatMap((item) =>
                                item.split(/\n/).map((line) => line.trim()).filter(Boolean)
                            )
                            return (
                                <div className="includes">
                                    <span className="label">Incluye:</span>
                                    <ul className="includes-list">
                                        {rows.map((row, i) => (
                                            <li key={i} className="includes-list__item">{row}</li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })()}
                        {price && (
                            <div className="price price--highlight">
                                <span className="label">Precio desde</span>
                                <span className="price-amount">{price}</span>
                            </div>
                        )}
                    </div>
                )}
                <div className="meta">
                    {icons.map((icon, index) => (
                        <span key={index} className="icon">
                            <i className={icon}></i>
                        </span>
                    ))}
                </div>
            </div>
            <div className="img-holder international-img-wrapper">
                {badge && (
                    <span
                        className={`destination-badge destination-badge--${badge}`}
                        aria-label={badge === 'nuevo' ? 'Nuevo destino' : badge === 'pocos_lugares' ? 'Pocos lugares disponibles' : 'Agotado'}
                    >
                        {badge === 'nuevo' ? '¡NUEVO!' : badge === 'pocos_lugares' ? 'POCOS LUGARES' : 'AGOTADO'}
                    </span>
                )}
                <img src={image} alt={title} />
            </div>
        </div>
    )
}
