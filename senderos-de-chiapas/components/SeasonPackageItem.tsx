import Link from 'next/link'

interface SeasonPackageItemProps {
  title: string
  image: string
  link: string
  category?: string
  dateFormatted?: string
  /** 'section' = layout para home (con col). 'card' = card compacta para página Paquetes, mismo peso visual que PackageItem */
  variant?: 'section' | 'card'
}

export default function SeasonPackageItem({
  title,
  image,
  link,
  category,
  dateFormatted,
  variant = 'section',
}: SeasonPackageItemProps) {
  if (variant === 'card') {
    return (
      <div className="single-service-item single-service-item--seasonal seasonal-card-horizontal mb-40">
        <div className="seasonal-card-horizontal__image">
          <img src={image} alt={title || 'Paquete de temporada'} />
        </div>
        <div className="seasonal-card-horizontal__body">
          {(category || dateFormatted) && (
            <div className="seasonal-meta mb-10">
              {category && <span className="seasonal-pill">{category}</span>}
              {dateFormatted && (
                <span className="seasonal-date">
                  <i className="far fa-calendar-alt" aria-hidden />
                  {dateFormatted}
                </span>
              )}
            </div>
          )}
          <h3 className="title">{title}</h3>
          <Link href={link} className="tour-item-more-info-btn">
            Más información
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="col-lg-4 col-md-6 col-sm-12">
      <div className="single-seasonal-package mb-40 wow fadeInUp">
        <div className="post-thumbnail">
          <img src={image} alt={title || 'Paquete de temporada'} />
        </div>
        <div className="entry-content">
          {category && (
            <span className="cat-btn">{category}</span>
          )}
          {dateFormatted && (
            <div className="post-meta">
              <span><i className="far fa-calendar-alt"></i><a href="#">{dateFormatted}</a></span>
            </div>
          )}
          <h3 className="title">
            <Link href={link}>{title}</Link>
          </h3>
          <Link href={link} className="main-btn filled-btn">
            Más Información<i className="far fa-paper-plane"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}
