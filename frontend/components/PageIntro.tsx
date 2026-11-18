interface PageIntroProps {
  title: string
  intro?: string
  /** Ilustración de la derecha (solo escritorio). */
  art?: 'paquetes' | 'tours'
}

/** Encabezado de listados (Paquetes, Tours): franja crema que continúa el header, título, introducción e ilustración. */
export default function PageIntro({ title, intro, art }: PageIntroProps) {
  return (
    <header className="page-intro">
      <div className="container">
        <div className="page-intro__head">
          <h1 className="page-intro__title">{title}</h1>
          {intro && <p className="page-intro__text">{intro}</p>}
        </div>
      </div>
      {art && (
        <div className="page-intro__art" aria-hidden>
          {art === 'paquetes' ? <PackagesArt /> : <ToursArt />}
        </div>
      )}
    </header>
  )
}

/* Colores: verde oscuro #2f6b1f (trazo), verde #63ab45 (detalles), verde pálido #e3f0d9 (colinas),
   naranja #f7921e (acentos), crema #fffdf8 (rellenos). */

/** Paquetes: maleta de viaje entre colinas. */
function PackagesArt() {
  return (
    <svg viewBox="0 0 560 220" preserveAspectRatio="xMaxYMax meet">
      {/* Colinas */}
      <path className="page-intro__hill" d="M 120 220 C 180 170, 250 160, 320 190 C 360 205, 400 200, 440 186 C 490 170, 530 176, 560 190 L 560 220 Z" />
      <path className="page-intro__hill page-intro__hill--back" d="M 220 220 C 270 150, 330 130, 390 168 C 420 186, 450 180, 470 172 L 470 220 Z" />
      {/* Maleta */}
      <g className="page-intro__ink">
        <path d="M 472 74 L 472 44 Q 472 38 478 38 L 506 38 Q 512 38 512 44 L 512 74" />
        <rect className="page-intro__fill" x="446" y="74" width="92" height="118" rx="14" />
        <path d="M 470 90 L 470 176 M 492 90 L 492 176 M 514 90 L 514 176" className="page-intro__stripe" />
        <circle className="page-intro__fill" cx="464" cy="200" r="8" />
        <circle className="page-intro__fill" cx="520" cy="200" r="8" />
      </g>
      {/* Etiqueta de equipaje */}
      <path className="page-intro__ink-thin" d="M 538 96 C 546 98, 548 106, 548 112" />
      <rect className="page-intro__tag" x="536" y="112" width="22" height="30" rx="4" transform="rotate(8 547 127)" />
      <circle className="page-intro__tag-hole" cx="547" cy="118" r="2.5" transform="rotate(8 547 127)" />
    </svg>
  )
}

/** Tours: paisaje de montañas y pinos. */
function ToursArt() {
  return (
    <svg viewBox="0 0 560 220" preserveAspectRatio="xMaxYMax meet">
      {/* Sol y montañas al fondo */}
      <circle className="page-intro__sun" cx="300" cy="70" r="26" />
      <path className="page-intro__hill page-intro__hill--back" d="M 180 220 L 250 110 L 290 150 L 350 70 L 420 160 L 470 118 L 560 210 L 560 220 Z" />
      <path className="page-intro__hill" d="M 120 220 C 200 176, 280 168, 360 186 C 430 202, 500 190, 560 176 L 560 220 Z" />
      {/* Pinos */}
      <g className="page-intro__leaf">
        <path d="M 498 196 L 516 140 L 534 196 Z" />
        <path d="M 520 200 L 540 124 L 560 200 Z" />
        <path d="M 196 206 L 210 162 L 224 206 Z" />
      </g>
      <path className="page-intro__ink-thin" d="M 516 196 L 516 206 M 540 200 L 540 212 M 210 206 L 210 214" />
    </svg>
  )
}
