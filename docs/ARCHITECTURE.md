# Senderos Travel Agency – Arquitectura del proyecto

## Resumen

- **Frontend:** Next.js (App Router), desplegado en Vercel. Carpeta: `senderos-de-chiapas`.
- **Backend:** Strapi v5 (TypeScript), desplegado en Fly.io.
- **Base de datos:** Neon (PostgreSQL), compartida entre local y producción.

---

## Frontend

| Aspecto | Detalle |
|--------|---------|
| Framework | Next.js (App Router) |
| Hosting | Vercel |
| Carpeta | `senderos-de-chiapas` (raíz del repo: `senderos`) |
| Rutas dinámicas | `/tour-details/[slug]`, `/package-details/[slug]`, etc. |
| Listado de tours | `/tours` |
| Datos | Fetch desde Strapi con populate estructurado |

### Variables de entorno (frontend)

- **Local** (`.env.local`):
  - `STRAPI_URL=http://localhost:1337` (servidor Next usa esto para fetch en servidor)
  - `NEXT_PUBLIC_STRAPI_URL=https://senderos-backend.fly.dev` (cliente, ej. imágenes)
  - `STRAPI_TOKEN` (opcional, para APIs restringidas)
- **Producción (Vercel):**
  - `STRAPI_URL` y/o `NEXT_PUBLIC_STRAPI_URL` = URL del backend en Fly.io (ej. `https://senderos-backend.fly.dev`)

> En este proyecto se usan `STRAPI_URL` y `NEXT_PUBLIC_STRAPI_URL`, no `NEXT_PUBLIC_API_URL`.

---

## Backend (Strapi)

| Aspecto | Detalle |
|--------|---------|
| CMS | Strapi v5 (TypeScript) |
| Hosting | Fly.io |
| Carpeta | `backend` |
| Base de datos | Neon PostgreSQL (misma en local y producción) |
| En producción | Variables con Fly secrets; despliegue vía GitHub + `fly deploy` |
| Local | `npm run develop`; configuración en `.env` y `config/database.ts` |

### Variables de entorno (backend)

- **Local** (`.env` en `backend`):
  - `DATABASE_CLIENT=postgres`
  - `DATABASE_URL` = connection string de Neon
  - `ADMIN_AUTH_SECRET`, `APP_KEYS`, `JWT_SECRET`, etc.
- **Producción (Fly.io):** mismas variables como Fly secrets; mismo `DATABASE_URL` (Neon).

### Base de datos (Neon)

- Proveedor: Neon (PostgreSQL).
- Uso: producción (Fly.io) y desarrollo local.
- Conexión: `DATABASE_URL`.
- SSL: requerido (en `config/database.ts` se usa `rejectUnauthorized: false` cuando aplica).

---

## Contenido en Strapi

### Collection type: Tour (`api::tour.tour`)

- **API:** single type expuesto como `/api/tour` (Strapi usa el singular en la ruta para este single type). Respuesta incluye `Tours` (array) y `Banner`.
- **Populate:** estructurado, p. ej. `populate[Banner]=*&populate[Tours]=*`.

**Campos:**

| Campo | Tipo | Notas |
|-------|------|--------|
| slug | UID | Único |
| home | Boolean | Mostrar en home |
| title | Text | |
| description | Text | |
| departure | Text | |
| departureDate | Text | Descripción comercial |
| accommodation | Text | |
| transport | Text | |
| duration | Integer | |
| price | Decimal | |
| location | Text | |
| icons | JSON | |
| image | Media | |
| imagesDetails | Multiple Media | |
| badge | Enumeration | |
| includes | Rich text (Blocks) | |
| route | Rich text (Blocks) | |
| calendarStart | Date | |
| calendarEnd | Date | |
| itineraryItem | Component (repeatable) | |
| mapItem | Component (repeatable) | |

**Componente `itineraryItem`:**
- dayTitle (Text), time (Text), activity (Text), accommodation (Text), routeItinerary (Rich text – Blocks).

**Componente `mapItem`:**
- title (Text), map (Text).

### Single type: Home (Página Principal)

- **API:** `/api/home` (singular; en esta instancia `/api/homes` devuelve 404). Parámetros: `populate=*`, `status=published`.
- Incluye: heroSlides (repeatable), services, testimonial, gallery.
- **Permisos:** En Strapi → **Settings → Users & Permissions → Roles → Public**:
  - **Home (Página Principal):** activa **find**.
  - Para que las imágenes del hero (y otras media) se devuelvan populadas, activa **find** en **Content Manager → Media Library** (o **Upload**, según versión). Sin esto, `heroSlides[].image` puede llegar vacío o solo con id.

### Otros single types

- Package: `/api/package` (Paquete, Temporada, etc.)
- About, Gallery, International: cada uno con su ruta y populate según necesidad.

---

## Rutas y datos en el frontend

- **Listado de tours:** `/tours` → datos de Strapi `Tours` con `home: true` o listado completo según página.
- **Detalle de tour:** `/tour-details/[slug]` → filtro por `filters[slug][$eq]=...` en Strapi.
- **Detalle de paquete:** `/package-details/[slug]`.
- No se usa `populate=*` en todos los casos; en tour se usa populate estructurado para controlar nivel y tamaño de respuesta.

---

## Notas importantes

- Base de datos Neon compartida entre local y producción.
- Backend local: `npm run develop` en `backend`.
- Producción backend: Fly.io con secrets; mismo `DATABASE_URL` (Neon).
- Frontend: Vercel; variables de entorno según entorno (local vs producción).
- Rutas de detalle en la app son `/tour-details/[slug]`, no `/tours/[slug]`.
