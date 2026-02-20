# Integración Destinos con Strapi

## Resumen

Los tours/destinos se obtienen desde Strapi (`/api/tour`) y se muestran en:

- **Home** (`/`) - Sección de destinos
- **Página Destinos** (`/tours`)
- **Detalle de Tour** (`/destino-detalles/[slug]` → reescrito a `/tour-details/[slug]`) - Busca por slug del campo `link`

## Configuración

### 1. Variables de entorno (`.env.local`)

```env
STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=tu_token_api
```

### 2. Permisos en Strapi Admin

1. Inicia Strapi: `cd backend && npm run dev`
2. Abre http://localhost:1337/admin
3. Ve a **Settings** → **Users & Permissions** → **Roles** → **Public**
4. En **Tour** → **find**, marca como permitido (si quieres acceso público)
5. O crea un **API Token** en Settings → API Tokens y úsalo en `STRAPI_TOKEN`

### 3. Datos en Strapi

En el content-type **Tours** (`/api/tour`, single type), agrega items en el componente repetible **Tours** (componente `destinations.destinations`) con:

- title, description, image (requerido)
- departureDate, accommodation, duration, price
- imagesDetails (media múltiple, para la página de detalle)
- location (ej: `Tzimol, Chiapas`) - para la página de detalle
- badge: opcional (new, few_left, sold_out, hide). Si es "hide", no se muestra en la lista.
- home: true si quieres que aparezca en la página de inicio

El banner de la página de Tours se configura en el campo **Banner** del single type Tour. Si el contenido usa draft & publish, debe estar **publicado**.

## Cómo probar

### Terminal 1 - Backend Strapi

```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend Next.js

```bash
cd senderos-de-chiapas
npm run dev
```

Abre http://localhost:3000 y verifica que los destinos de Strapi aparecen. Si no hay datos en Strapi, se muestran los destinos de fallback.

## API Endpoint

- **URL**: `GET /api/tour?populate[info][populate]=image`
- **Formato Strapi 5**: Respuesta aplanada (`data.info` directamente)
- **Formato Strapi 4**: Respuesta con `data.attributes.info`

El código soporta ambos formatos automáticamente.

## Troubleshooting: "No se carga la info de Strapi"

1. **Strapi debe estar corriendo**: `cd backend && npm run dev` (puerto 1337)
2. **Variables de entorno**: Verifica `.env.local` con `STRAPI_URL` y opcionalmente `STRAPI_TOKEN`
3. **Permisos**: En Strapi Admin → Settings → Users & Permissions → Public → Tour → `find` debe estar marcado
4. **Contenido publicado**: Con draftAndPublish activo, el contenido debe estar **publicado** (botón Publish en el editor)
5. **Datos en info**: El single type Destinos debe tener al menos un item en el componente repetible **info**
6. **Consola del servidor**: Si hay errores 403/404, aparecerán en la terminal donde corre `npm run dev`
