import { getDictionary } from '@/lib/dictionaries'
import type { Lang } from '@/lib/i18n'

import { cloudinaryWidth } from '@/lib/cloudinary'

interface InternationalItemProps {
    lang?: Lang
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
    lang = 'es',
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
    const t = getDictionary(lang).internationalPage
    return (
        <div className="single-service-item international-item mb-40">
            <div className="content">
                <h3 className="title">{title}</h3>
                <p className='pb-2'>{description}</p>
                {(departureDate || price || accommodation || duration || route || transport || departure || (includes && includes.length > 0)) && (
                    <div className="international-info mb-15">
                        {departureDate && (
                            <div className="departure-date">
                                <span className="label">{t.departureDate}</span>
                                <div className="value-wrapper">
                                    <i className="far fa-calendar-alt"></i>
                                    <span className="value">{departureDate}</span>
                                </div>
                            </div>
                        )}
                        {route && (
                            <div className="route">
                                <span className="label">{t.route}</span>
                                <span className="value">{route}</span>
                            </div>
                        )}
                        {transport && (
                            <div className="transport">
                                <span className="label">{t.transport}</span>
                                <span className="value">{transport}</span>
                            </div>
                        )}
                        {departure && (
                            <div className="departure">
                                <span className="label">{t.departure}</span>
                                <span className="value">{departure}</span>
                            </div>
                        )}
                        {duration && (
                            <div className="duration">
                                <span className="label">{t.duration}</span>
                                <span className="value">{duration}</span>
                            </div>
                        )}
                        {accommodation && (
                            <div className="accommodation">
                                <span className="label">{t.lodging}</span>
                                <span className="value">{accommodation}</span>
                            </div>
                        )}
                        {includes && includes.length > 0 && (() => {
                            const rows = includes.flatMap((item) =>
                                item.split(/\n/).map((line) => line.trim()).filter(Boolean)
                            )
                            return (
                                <div className="includes">
                                    <span className="label">{t.includes}</span>
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
                                <span className="label">{t.priceFrom}</span>
                                <span className="price-amount">{price}</span>
                            </div>
                        )}
                    </div>
                )}
                {/* <div className="meta">
                    {icons.map((icon, index) => (
                        <span key={index} className="icon">
                            <i className={icon}></i>
                        </span>
                    ))}
                </div> */}
            </div>
            <div className="img-holder international-img-wrapper">
                {badge && (
                    <span
                        className={`destination-badge destination-badge--${badge}`}
                        aria-label={t.badgeAria[badge]}
                    >
                        {t.badge[badge]}
                    </span>
                )}
                <img src={cloudinaryWidth(image, 800)} alt={title} loading="lazy" decoding="async" />
            </div>
        </div>
    )
}
