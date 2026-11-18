interface PageIntroProps {
  title: string
  intro?: string
}

/** Encabezado de listados (Paquetes, Tours): franja crema que continúa el header, título e introducción, y el sendero punteado de las postales del inicio. */
export default function PageIntro({ title, intro }: PageIntroProps) {
  return (
    <header className="page-intro">
      <div className="container">
        <div className="page-intro__head">
          <h1 className="page-intro__title">{title}</h1>
          {intro && <p className="page-intro__text">{intro}</p>}
        </div>
      </div>
      {/* Sendero punteado con pin (solo escritorio) */}
      <div className="page-intro__trail" aria-hidden>
        <svg viewBox="0 0 400 200" preserveAspectRatio="none">
          <path d="M 0 190 C 70 185, 90 120, 160 118 C 230 116, 250 160, 310 120 C 350 94, 360 50, 382 30" />
        </svg>
        <span className="page-intro__trail-pin"><i className="fas fa-map-marker-alt"></i></span>
      </div>
    </header>
  )
}
