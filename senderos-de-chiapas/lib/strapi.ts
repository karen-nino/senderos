const { STRAPI_URL, STRAPI_TOKEN } = process.env;

/** Revalidación ISR: regenerar datos de Strapi como máximo cada 60 segundos */
export const STRAPI_REVALIDATE_SECONDS = 60;

/** Collection Type Tour (Strapi v5: GET /api/tours). Evitar populate[image]=* porque Strapi devuelve ValidationError "Invalid key related at image.related". */
const STRAPI_TOURS_POPULATE = "populate=*";
const STRAPI_TOURS_URL = `/api/tours?${STRAPI_TOURS_POPULATE}`;
/**
 * Strapi 5: populate=* NO rellena componentes anidados. itineraryItem.activity (repeatable)
 * solo llega con populate explícito; sin esto el itinerario sale vacío en el detalle.
 */
const STRAPI_TOUR_ITINERARY_POPULATE =
  "populate[itineraryItem][populate][activity]=*&populate[image]=true&populate[imagesDetails]=true&populate[mapItem]=true";
/** Single type Tours-Page: banner (imageBanner). Sin populate[imageBanner]=* para evitar ValidationError "Invalid key related at imageBanner.related". */
const STRAPI_TOURS_PAGE_URLS = [
  "/api/tours-page?populate=imageBanner&status=published",
  "/api/tours-page?populate=imageBanner",
  "/api/tours-page?status=published",
  "/api/tours-page",
] as const;

/** Opciones para peticiones a /api/tours: usar rol Public (sin token) para que coincida con permisos de visitantes. */
const STRAPI_TOURS_FETCH_OPTIONS = { useToken: false } as const;

/** Collection Type Package (Strapi v5: GET /api/packages). Necesita populate profundo igual que tours para itineraryItem.activity. */
const STRAPI_PACKAGES_POPULATE =
  "populate[itineraryItem][populate][activity]=*&populate[image]=true&populate[imagesDetails]=true&populate[mapItem]=true";
const STRAPI_PACKAGES_URL = `/api/packages?${STRAPI_PACKAGES_POPULATE}`;
/** Single type Packages-Page: solo banner (imageBanner). Sin populate[imageBanner]=* para evitar ValidationError "Invalid key related". */
const STRAPI_PACKAGES_PAGE_URLS = [
  "/api/packages-page?populate=imageBanner&status=published",
  "/api/packages-page?populate=imageBanner",
  "/api/packages-page?status=published",
  "/api/packages-page",
] as const;

/** Collection Type International (Strapi v5: GET /api/internationals). */
const STRAPI_INTERNATIONALS_URL = `/api/internationals?${STRAPI_TOURS_POPULATE}`;
/** Single type International-Page: solo banner (imageBanner). Sin populate[imageBanner]=* para evitar ValidationError. */
const STRAPI_INTERNATIONAL_PAGE_URLS = [
  "/api/international-page?populate=imageBanner&status=published",
  "/api/international-page?populate=imageBanner",
  "/api/international-page?status=published",
  "/api/international-page",
] as const;

/** Aplana attributes de Strapi v4 (o anidados) para que title, documentId, etc. queden en la raíz. */
function normalizeTourItem(raw: Record<string, unknown>): StrapiDestinationItem {
  const attrs = raw.attributes as Record<string, unknown> | undefined;
  if (attrs && typeof attrs === "object") {
    return { ...raw, ...attrs } as StrapiDestinationItem;
  }
  return raw as StrapiDestinationItem;
}

/** Extrae el array de tours de la respuesta de Strapi (soporta data como array o data.data, etc.). Normaliza ítems v5 (attributes). */
function getToursArrayFromResponse(response: Record<string, unknown> | null): StrapiDestinationItem[] {
  if (!response || response.error) return [];
  const data = response.data;
  let items: Record<string, unknown>[] = [];
  if (Array.isArray(data)) items = data as Record<string, unknown>[];
  else {
    const inner = data && typeof data === "object" && (data as Record<string, unknown>).data;
    if (Array.isArray(inner)) items = inner as Record<string, unknown>[];
    else {
      const results = data && typeof data === "object" && (data as Record<string, unknown>).results;
      if (Array.isArray(results)) items = results as Record<string, unknown>[];
    }
  }
  return items.map(normalizeTourItem);
}

/** Respuesta findOne o data única: un documento tour plano (Strapi v5). */
function getSingleTourFromResponse(
  response: Record<string, unknown> | null,
): StrapiDestinationItem | null {
  if (!response || response.error) return null;
  const data = response.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    if (
      d.documentId != null ||
      d.id != null ||
      d.title != null ||
      Array.isArray(d.itineraryItem)
    ) {
      return normalizeTourItem(d);
    }
  }
  const items = getToursArrayFromResponse(response);
  return items[0] ?? null;
}

/**
 * Segunda petición con populate anidado: sin esto Strapi 5 no devuelve activity dentro de itineraryItem.
 */
async function fetchTourWithItineraryPopulated(
  item: StrapiDestinationItem,
): Promise<StrapiDestinationItem> {
  const docId =
    item.documentId != null ? String(item.documentId).trim() : "";
  const numId = item.id != null ? String(item.id) : "";
  const queries: string[] = [];
  if (docId) {
    queries.push(
      `/api/tours?filters[documentId][$eq]=${encodeURIComponent(docId)}&${STRAPI_TOUR_ITINERARY_POPULATE}`,
    );
    queries.push(
      `/api/tours/${encodeURIComponent(docId)}?${STRAPI_TOUR_ITINERARY_POPULATE}`,
    );
  }
  if (numId) {
    queries.push(
      `/api/tours?filters[id][$eq]=${encodeURIComponent(numId)}&${STRAPI_TOUR_ITINERARY_POPULATE}`,
    );
  }
  for (const url of queries) {
    try {
      const res = await fetchStrapi(url, STRAPI_TOURS_FETCH_OPTIONS);
      if ((res as Record<string, unknown>)?.error) continue;
      const one = getSingleTourFromResponse(res as Record<string, unknown>);
      if (!one) continue;
      return {
        ...item,
        itineraryItem:
          Array.isArray(one.itineraryItem) && one.itineraryItem.length > 0
            ? (one.itineraryItem as StrapiItineraryItem[])
            : item.itineraryItem,
        image:
          one.image !== undefined && one.image !== null ? one.image : item.image,
        imagesDetails:
          one.imagesDetails !== undefined && one.imagesDetails !== null
            ? one.imagesDetails
            : item.imagesDetails,
        mapItem:
          one.mapItem !== undefined && one.mapItem !== null
            ? one.mapItem
            : item.mapItem,
      };
    } catch {
      /* probar siguiente URL */
    }
  }
  return item;
}

const HOME_QUERY = "populate=*&status=published";
const HOME_QUERY_ES = `${HOME_QUERY}&locale=es`;
const HOME_QUERY_DEEP =
  "populate[heroSlides][populate]=*&populate[services][populate]=*&populate[testimonial][populate]=*&populate[gallery]=*&status=published";
/** Single type puede ser /api/home o /api/homes. populate[X][populate]=* trae todos los campos del componente (incl. media). */
const HOME_URLS = [
  `/api/home?${HOME_QUERY_DEEP}`,
  `/api/home?${HOME_QUERY}`,
  `/api/homes?${HOME_QUERY}`,
  `/api/home?${HOME_QUERY_ES}`,
  `/api/homes?${HOME_QUERY_ES}`,
] as const;
export const STRAPI_HOME_URL = HOME_URLS[0];

/** Obtiene Página Principal sin token para usar rol Public (find). Evita 401 si el API Token no tiene permiso en Home. */
export async function fetchHome(): Promise<{ data: Record<string, unknown> | null; error?: unknown }> {
  for (const url of HOME_URLS) {
    const res = await fetchStrapi(url, { useToken: false });
    if (res?.data != null && typeof res.data === "object") return { data: res.data as Record<string, unknown> };
    if (res?.error) console.warn("[Strapi] home:", url, res.error);
  }
  return { data: null };
}

/**
 * Obtiene datos de Strapi (usa la misma configuración ISR que fetchStrapi).
 * Preferir fetchStrapi para respuestas tipadas y manejo de errores.
 * Collection Type "Tour" en Strapi v5 expone GET /api/tours (plural).
 */
export function query(url: string) {
  const baseUrl = getStrapiBaseUrl();
  const resource = url === "tour" ? "tours" : url;
  const fullUrl = `${baseUrl}/api/${resource}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token =
    typeof STRAPI_TOKEN === "string" && STRAPI_TOKEN.trim().length > 0
      ? STRAPI_TOKEN.trim()
      : null;
  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(fullUrl, {
    headers,
    next: { revalidate: STRAPI_REVALIDATE_SECONDS },
  }).then((res) => res.json());
}

/** URL base del backend Strapi (server). En Vercel configurar STRAPI_URL o NEXT_PUBLIC_STRAPI_URL. */
function getStrapiBaseUrl(): string {
  const url =
    STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  return url.replace(/\/$/, "");
}

export type FetchStrapiOptions = { useToken?: boolean };

export async function fetchStrapi(url: string, options?: FetchStrapiOptions) {
  const baseUrl = getStrapiBaseUrl();
  const path = url.startsWith("/") ? url : `/${url}`;
  const fullUrl = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const useToken = options?.useToken !== false;
  const token =
    useToken &&
    typeof STRAPI_TOKEN === "string" &&
    STRAPI_TOKEN.trim().length > 0
      ? STRAPI_TOKEN.trim()
      : null;
  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    headers,
    next: { revalidate: STRAPI_REVALIDATE_SECONDS },
  });

  const json = await response.json();

  if (!response.ok) {
    console.error(
      `[Strapi] Error ${response.status} ${response.statusText}:`,
      fullUrl,
      json?.error?.message || json,
    );
    return { data: null, error: json };
  }

  return json;
}

/** Bloque de rich text / blocks de Strapi */
export type StrapiBlock = {
  type?: string;
  children?: Array<{ type?: string; text?: string }>;
  [key: string]: unknown;
};

/** Ítem de día en itinerario: en Strapi v5 suele ser dayTitle + activity[] (componente activity-item). Legacy: time/activity en el mismo nivel. */
export interface StrapiItineraryItem {
  dayTitle?: string;
  time?: string;
  activity?: string | StrapiBlock | StrapiBlock[] | Array<Record<string, unknown>>;
  /** Algunos modelos usan "description" en vez de "activity" */
  description?: string | StrapiBlock | StrapiBlock[] | Array<Record<string, unknown>>;
  /** Fallback común en componentes legacy */
  text?: string | StrapiBlock | StrapiBlock[] | Array<Record<string, unknown>>;
  routeItinerary?: string | StrapiBlock | StrapiBlock[];
  accommodation?: string | StrapiBlock | StrapiBlock[];
}

/** Formato de destino desde Strapi API /api/tours (Collection Type) y /api/international */
export interface StrapiDestinationItem {
  id?: number;
  documentId?: string;
  title?: string;
  /** En Collection Type Tour es blocks; puede llegar como string en otros tipos */
  description?: string | StrapiBlock | StrapiBlock[];
  subtitle?: string;
  departureDate?: string;
  accommodation?: string;
  duration?: string;
  price?: string;
  link?: string;
  /** Slug del tour (Collection Type tour tiene uid slug). */
  slug?: string;
  location?: string;
  home?: boolean;
  icons?: string[];
  image?:
    | {
        data?: {
          id?: number;
          attributes?: { url?: string };
          url?: string;
        };
        url?: string;
        formats?: Record<string, { url?: string }>;
      }
    | string;
  imagesDetails?:
    | Array<{
        data?: { id?: number; attributes?: { url?: string }; url?: string };
        url?: string;
        formats?: Record<string, { url?: string }>;
      }>
    | {
        data?: Array<{
          id?: number;
          attributes?: { url?: string };
          url?: string;
        }>;
      };
  map?: string;
  /** Componente(s) Strapi para el bloque de mapa (map, title). Puede ser uno o array (repeatable). */
  mapItem?:
    | { map?: string; title?: string }
    | Array<{ map?: string; title?: string }>;
  badge?: string;
  /** Ruta: en Destinations (tours) es Blocks; en International puede ser String */
  route?: string | StrapiBlock | StrapiBlock[];
  transport?: string;
  departure?: string;
  includes?: StrapiBlock[];
  /** Itinerario por día (componente repeatable) */
  itineraryItem?: StrapiItineraryItem[];
  /** Fecha inicio para calendario (ej. YYYY-MM-DD o ISO) */
  calendarStart?: string;
  /** Fecha fin para calendario (ej. YYYY-MM-DD o ISO) */
  calendarEnd?: string;
}

/** Formato adaptado para DestinationItem / InternationalItem */
export interface AdaptedDestination {
  title: string;
  description: string;
  /** Subtítulo desde Strapi (para listados tipo TourItem). */
  subtitle?: string;
  image: string;
  link?: string;
  icons?: string[];
  departureDate?: string;
  price?: string;
  accommodation?: string;
  duration?: string;
  /** Valores internos: nuevo | pocos_lugares | agotado | oculto */
  badge?: "nuevo" | "pocos_lugares" | "agotado" | "oculto";
  /** Campos específicos de International desde Strapi */
  route?: string;
  transport?: string;
  departure?: string;
  /** Lista de ítems (cada bloque = un ítem) para mostrar como lista vertical */
  includes?: string[];
  /** Slug para URL de detalle (ej: tour-details/[slug]). Preferir slug legible (título); documentId es fallback. */
  slug?: string;
  /** documentId de Strapi (v5); se usa como fallback para el enlace de detalle si no hay slug. */
  documentId?: string;
}

/** Busca la primera propiedad "url" en un objeto/array (Strapi puede anidar la media). */
function findUrlInObject(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const u = findUrlInObject(item);
      if (u) return u;
    }
    return "";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.url != null && typeof obj.url === "string") return obj.url.trim();
    for (const v of Object.values(obj)) {
      const u = findUrlInObject(v);
      if (u) return u;
    }
  }
  return "";
}

function getImageUrl(image: StrapiDestinationItem["image"]): string {
  if (!image) return "";
  if (typeof image === "string") return image.trim();
  const obj = image as Record<string, unknown>;
  const data = obj?.data as { url?: string; attributes?: { url?: string } } | undefined;
  const attrs = obj?.attributes as { url?: string } | undefined;
  const url =
    (obj?.url as string) ??
    data?.url ??
    data?.attributes?.url ??
    attrs?.url ??
    (obj.formats && Object.values(obj.formats as Record<string, { url?: string }>)[0]?.url) ??
    findUrlInObject(image) ??
    "";
  return (url && String(url).trim()) || "";
}

/** En local, devolver URL directa a Strapi para que el navegador cargue sin pasar por el proxy (más rápido). */
function buildFullImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";
  const trimmed = imageUrl.trim();
  const baseUrl = getStrapiBaseUrl();
  const uploadsMatch = trimmed.match(/\/uploads\/(.+)$/) ?? trimmed.match(/^uploads\/(.+)$/);
  if (uploadsMatch) {
    const path = uploadsMatch[1];
    const isLocal =
      baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    if (isLocal) {
      return `${baseUrl.replace(/\/$/, "")}/uploads/${path}`;
    }
    return `/api/strapi-uploads/${path}`;
  }
  if (trimmed.startsWith("http")) return trimmed;
  const cleanUrl = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanUrl}`;
}

const FALLBACK_IMAGE = "/assets/images/place/place-1.jpg";
/** Imagen por defecto para hero slides (HTML Template: assets/images/hero/hero-one_img-1.jpg) */
const HERO_FALLBACK_IMAGE = "/assets/images/hero/hero-one_img-1.jpg";
/** Imagen por defecto para services (390×545, como en HTML Template activity section) */
const ACTIVITY_FALLBACK_IMAGE = "/assets/images/gallery/activity.jpg";

/** Extrae texto de bloques Strapi (includes) - soporta array o documento con children */
function extractTextFromBlock(block: StrapiBlock): string[] {
  const out: string[] = [];
  const children = block.children;
  if (Array.isArray(children)) {
    for (const c of children) {
      if (c?.text) out.push(c.text);
      // Recursivo por si hay nodos anidados (listas, etc.)
      if (Array.isArray((c as StrapiBlock).children)) {
        out.push(...extractTextFromBlock(c as StrapiBlock));
      }
    }
  }
  return out;
}

/** Descripción desde Strapi blocks o string (Collection Type Tour). */
export function descriptionFromBlocks(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (!Array.isArray(value)) {
    return richTextToPlainString(value) ?? "";
  }
  const parts: string[] = [];
  for (const block of value) {
    if (typeof block === "object" && block) {
      const p = extractTextFromBlock(block as StrapiBlock)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");
      if (p) parts.push(p);
    }
  }
  return parts.join("\n\n");
}

/** Texto corto para tarjetas de tour (subtitle Strapi o extracto de descripción). */
export function tourCardSubtitle(d: {
  subtitle?: string;
  description?: string;
}): string {
  const s = d.subtitle?.trim();
  if (s) return s;
  const desc = (d.description || "").replace(/\s+/g, " ").trim();
  if (!desc) return "";
  return desc.length <= 240 ? desc : `${desc.slice(0, 237).trim()}…`;
}

/** Convierte valor que puede ser string o rich text (Strapi blocks) a string plano */
function richTextToPlainString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  const blocks = Array.isArray(value) ? value : [value];
  const parts: string[] = [];
  for (const block of blocks) {
    if (typeof block === "object" && block && "children" in block) {
      parts.push(...extractTextFromBlock(block as StrapiBlock));
    }
  }
  const joined = parts
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
  return joined || undefined;
}

/** Convierte blocks de Strapi (includes) en array de strings, una fila por cada ítem/párrafo */
function blocksToList(
  includes: StrapiDestinationItem["includes"],
): string[] | undefined {
  if (!includes) return undefined;
  const texts: string[] = [];
  // Strapi puede devolver array de bloques o documento { type: 'doc', children: [...] }
  const list = Array.isArray(includes)
    ? includes
    : ((includes as StrapiBlock).children ?? []);
  if (!Array.isArray(list) || list.length === 0) return undefined;
  for (const block of list) {
    const parts = extractTextFromBlock(block as StrapiBlock)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const p of parts) texts.push(p);
  }
  return texts.length > 0 ? texts : undefined;
}

/** Ítem de servicio de Home (componente home.services en Strapi) */
export interface StrapiHomeServiceItem {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  image?:
    | {
        data?: { attributes?: { url?: string }; url?: string };
        url?: string;
        formats?: Record<string, { url?: string }>;
      }
    | string;
  list?: StrapiBlock | StrapiBlock[];
}

/** Servicio adaptado para la sección Activity (Nuestros Servicios) */
export interface AdaptedHomeService {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  imageUrl: string;
  listItems: string[];
}

/** Testimonial adaptado desde Strapi (componente home.testimonial) */
export interface AdaptedTestimonial {
  name: string;
  ocupation: string;
  testimonial: string;
  profilePhotoUrl: string;
  photoUrl: string;
}

/** Hero slide adaptado con URL de imagen resuelta (usa proxy /api/strapi-uploads) */
export interface AdaptedHeroSlide {
  id?: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  ctaText?: string;
  ctaLink?: string;
}

/** Extrae el id numérico de la media (cuando Strapi no popula y solo devuelve id). */
function getMediaId(image: unknown): number | null {
  if (image == null) return null;
  if (typeof image === "number" && Number.isInteger(image)) return image;
  const o = image as Record<string, unknown>;
  if (typeof o?.id === "number") return o.id as number;
  return null;
}

/** Parsea heroSlides desde home (Strapi v5: data es el documento; v4 puede usar data.attributes). */
export function parseHomeHeroSlides(homeData: unknown): AdaptedHeroSlide[] {
  const doc = (homeData as Record<string, unknown>) ?? {};
  const attrs = (doc as { attributes?: Record<string, unknown> }).attributes;
  const heroSlidesField = doc.heroSlides ?? attrs?.heroSlides;
  const raw = Array.isArray(heroSlidesField)
    ? heroSlidesField
    : Array.isArray((heroSlidesField as { data?: unknown[] })?.data)
      ? (heroSlidesField as { data: unknown[] }).data
      : null;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((s: Record<string, unknown>, i: number) => {
    const imageUrl = getImageUrl(s.image as StrapiDestinationItem["image"]);
    const fullUrl = imageUrl
      ? buildFullImageUrl(imageUrl)
      : HERO_FALLBACK_IMAGE;
    const mediaId = getMediaId(s.image);
    return {
      id: (s.id as number) ?? i,
      title: (s.title as string) ?? "",
      subtitle: (s.subtitle as string) ?? undefined,
      description: (s.description as string) ?? undefined,
      image: fullUrl,
      buttonText: (s.buttonText as string) ?? undefined,
      buttonLink: (s.buttonLink as string) ?? undefined,
      ctaText: (s.ctaText as string) ?? undefined,
      ctaLink: (s.ctaLink as string) ?? undefined,
      _mediaId: mediaId,
    } as AdaptedHeroSlide & { _mediaId?: number | null };
  });
}

/** Resuelve imágenes de hero: si el slide tiene imagen fallback pero sí tiene mediaId, pide la URL a /api/upload/files/:id. */
export async function fetchHomeHeroSlides(homeData: Record<string, unknown> | null): Promise<AdaptedHeroSlide[]> {
  const slides = parseHomeHeroSlides(homeData) as (AdaptedHeroSlide & { _mediaId?: number | null })[];
  const resolved = await Promise.all(
    slides.map(async (slide) => {
      const mediaId = slide._mediaId;
      const isFallback = slide.image === HERO_FALLBACK_IMAGE;
      if (mediaId == null || !isFallback) {
        const { _mediaId: _, ...s } = slide;
        return s as AdaptedHeroSlide;
      }
      try {
        const res = await fetchStrapi(`/api/upload/files/${mediaId}`, { useToken: false });
        const data = res?.data as { url?: string } | undefined;
        const url = data?.url;
        const fullUrl = url ? buildFullImageUrl(url) : HERO_FALLBACK_IMAGE;
        const { _mediaId: _, ...rest } = slide;
        return { ...rest, image: fullUrl } as AdaptedHeroSlide;
      } catch {
        const { _mediaId: _, ...rest } = slide;
        return { ...rest, image: HERO_FALLBACK_IMAGE } as AdaptedHeroSlide;
      }
    })
  );
  return resolved;
}

/** Parsea gallery (múltiple media) desde home (Strapi v5). */
export function parseHomeGallery(homeData: unknown): string[] {
  const doc = (homeData as Record<string, unknown>) ?? {};
  const galleryMedia = doc?.gallery;
  const urls = getMultipleMediaUrls(galleryMedia);
  return urls;
}

/** Imágenes por defecto para gallery (HTML Template: gl-1.jpg a gl-5.jpg) */
export const GALLERY_FALLBACK_IMAGES = [
  "/assets/images/gallery/gl-1.jpg",
  "/assets/images/gallery/gl-2.jpg",
  "/assets/images/gallery/gl-3.jpg",
  "/assets/images/gallery/gl-4.jpg",
  "/assets/images/gallery/gl-5.jpg",
  "/assets/images/gallery/gl-1.jpg",
];

/** Parsea el testimonial desde la respuesta de home (Strapi v5). */
export function parseHomeTestimonial(
  homeData: unknown,
): AdaptedTestimonial | null {
  const doc = (homeData as Record<string, unknown>) ?? {};
  const raw = doc?.testimonial;
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  const profileUrl = getImageUrl(
    t.profilePhoto as StrapiDestinationItem["image"],
  );
  const photoUrl = getImageUrl(t.photo as StrapiDestinationItem["image"]);
  const name = (t.name as string) ?? "";
  const testimonial = (t.testimonial as string) ?? "";
  if (!name && !testimonial) return null;
  return {
    name,
    ocupation: (t.ocupation as string) ?? "",
    testimonial,
    profilePhotoUrl: profileUrl ? buildFullImageUrl(profileUrl) : "",
    photoUrl: photoUrl ? buildFullImageUrl(photoUrl) : "",
  };
}

/** Parsea servicios desde la respuesta de home (Strapi v5). */
export function parseHomeServices(homeData: unknown): AdaptedHomeService[] {
  const doc = (homeData as Record<string, unknown>) ?? {};
  const rawServices = doc?.services;
  if (!Array.isArray(rawServices) || rawServices.length === 0) return [];

  return rawServices.map((s: Record<string, unknown>) => {
    const imageUrl = getImageUrl(s.image as StrapiDestinationItem["image"]);
    const fullImageUrl = imageUrl
      ? buildFullImageUrl(imageUrl)
      : ACTIVITY_FALLBACK_IMAGE;
    const listItems =
      blocksToList(s.list as StrapiDestinationItem["includes"]) ?? [];
    return {
      title: (s.title as string) ?? "",
      subtitle: (s.subtitle as string) ?? undefined,
      description: (s.description as string) ?? undefined,
      icon: (s.icon as string) ?? "flaticon-camp",
      imageUrl: fullImageUrl,
      listItems,
    };
  });
}

/** Adapta un item de Strapi al formato de DestinationItem / InternationalItem */
export function adaptStrapiDestination(
  d: StrapiDestinationItem,
): AdaptedDestination {
  const imageUrl = getImageUrl(d.image);
  const fullImageUrl = imageUrl ? buildFullImageUrl(imageUrl) : FALLBACK_IMAGE;
  return {
    title: d.title ?? "",
    description: descriptionFromBlocks(d.description),
    subtitle: d.subtitle ?? undefined,
    image: fullImageUrl,
    link: d.link,
    icons: Array.isArray(d.icons) ? d.icons : undefined,
    departureDate: d.departureDate,
    price: d.price,
    accommodation: d.accommodation,
    duration: d.duration,
    badge: normalizeBadge(d.badge),
    route: routeToStr(d.route),
    transport: d.transport,
    departure: d.departure,
    includes: blocksToList(d.includes),
    slug:
      d.slug ??
      getSlugFromLink(d.link) ??
      (d.title ? slugify(d.title) : undefined) ??
      (d.documentId ? String(d.documentId) : undefined),
    documentId: d.documentId ? String(d.documentId) : undefined,
  };
}

/** Obtiene los destinos (tours) desde Strapi Collection Type /api/tours */
export async function fetchDestinations(): Promise<AdaptedDestination[]> {
  const result = await fetchTourPageData();
  return result.destinations;
}

/** Obtiene tours desde Collection Type /api/tours y banner (imageBanner) desde single type /api/tours-page. */
export async function fetchTourPageData(): Promise<{
  destinations: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const response = await fetchStrapi(STRAPI_TOURS_URL, STRAPI_TOURS_FETCH_OPTIONS);
    const items = getToursArrayFromResponse(response as Record<string, unknown>);
    const destinations = items.map(adaptStrapiDestination);

    let paginaDoc: Record<string, unknown> = {};
    for (const url of STRAPI_TOURS_PAGE_URLS) {
      const paginaRes = await fetchStrapi(url, STRAPI_TOURS_FETCH_OPTIONS);
      if (!paginaRes?.error && paginaRes?.data != null) {
        paginaDoc = (paginaRes.data ?? {}) as Record<string, unknown>;
        if (Object.keys(paginaDoc).length > 0) break;
      }
    }
    const imageBanner = paginaDoc.imageBanner;
    const bannerUrl =
      getMediaUrl(imageBanner) ||
      getImageUrl(imageBanner as StrapiDestinationItem["image"]);
    const imageBannerUrl = bannerUrl ? buildFullImageUrl(bannerUrl) : null;
    return { destinations, imageBannerUrl };
  } catch (error) {
    console.error("Error fetching tours from Strapi:", error);
    return { destinations: [], imageBannerUrl: null };
  }
}

/** @deprecated Usar fetchTourPageData */
export const fetchDestinationPageData = fetchTourPageData;

/** Obtiene destinos internacionales desde Collection Type /api/internationals y banner desde single type /api/international-page (imageBanner). */
export async function fetchInternationalPageData(): Promise<{
  destinations: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const response = await fetchStrapi(STRAPI_INTERNATIONALS_URL, STRAPI_TOURS_FETCH_OPTIONS);
    const items = getToursArrayFromResponse(response as Record<string, unknown>);
    const destinations = items.map(adaptStrapiDestination);

    let paginaDoc: Record<string, unknown> = {};
    for (const url of STRAPI_INTERNATIONAL_PAGE_URLS) {
      const paginaRes = await fetchStrapi(url, STRAPI_TOURS_FETCH_OPTIONS);
      if (!paginaRes?.error && paginaRes?.data != null) {
        paginaDoc = (paginaRes.data ?? {}) as Record<string, unknown>;
        if (Object.keys(paginaDoc).length > 0) break;
      }
    }
    const imageBanner = paginaDoc.imageBanner;
    const bannerUrl =
      getMediaUrl(imageBanner) ||
      getImageUrl(imageBanner as StrapiDestinationItem["image"]);
    const imageBannerUrl = bannerUrl ? buildFullImageUrl(bannerUrl) : null;
    return { destinations, imageBannerUrl };
  } catch (error) {
    console.error("Error fetching international from Strapi:", error);
    return { destinations: [], imageBannerUrl: null };
  }
}

/** Formato de ítem del single type Package en Strapi */
export interface StrapiPackageItem {
  title?: string;
  subtitle?: string;
  duration?: string;
  price?: string;
  type?: string;
  route?: StrapiBlock | StrapiBlock[];
  image?:
    | {
        data?: { attributes?: { url?: string }; url?: string };
        url?: string;
        formats?: Record<string, { url?: string }>;
      }
    | string;
  /** Galería de imágenes para detalle (mismo formato que StrapiDestinationItem.imagesDetails) */
  imagesDetails?: StrapiDestinationItem["imagesDetails"];
  includes?: StrapiBlock | StrapiBlock[];
  /** Itinerario por día (componente repeatable) */
  itineraryItem?: StrapiItineraryItem[];
  /** Fecha inicio para calendario (ej. YYYY-MM-DD) */
  calendarStart?: string;
  /** Fecha fin para calendario (ej. YYYY-MM-DD) */
  calendarEnd?: string;
  /** Bloque(s) de mapa (map, title). Puede ser uno o array (repeatable). */
  mapItem?:
    | { map?: string; title?: string }
    | Array<{ map?: string; title?: string }>;
  accommodation?: string;
  departure?: string;
  transport?: string;
  badge?: string;
  /** Texto largo o rich text (blocks); Holiday suele usarlo; Package puede tenerlo en CMS */
  description?: string | StrapiBlock | StrapiBlock[];
}

/** Normaliza badge de Strapi (puede venir en inglés o español) al valor interno. */
function normalizeBadge(
  badge: string | undefined,
): "nuevo" | "pocos_lugares" | "agotado" | "oculto" | undefined {
  if (!badge || typeof badge !== "string") return undefined;
  const v = badge.trim().toLowerCase();
  if (v === "new" || v === "nuevo") return "nuevo";
  if (v === "few_left" || v === "pocos_lugares") return "pocos_lugares";
  if (v === "sold_out" || v === "agotado") return "agotado";
  if (v === "hide" || v === "oculto") return "oculto";
  return undefined;
}

/** Convierte blocks de Strapi en un solo string (para route, etc.) */
function blocksToSingleString(
  blocks: StrapiBlock | StrapiBlock[] | undefined,
): string | undefined {
  const list = blocksToList(blocks as StrapiDestinationItem["includes"]);
  if (!list || list.length === 0) return undefined;
  return list.join(" • ");
}

/** Normaliza route desde Strapi: puede venir como string (International) o Blocks (Destinations/tours) */
function routeToStr(
  route: string | StrapiBlock | StrapiBlock[] | undefined,
): string | undefined {
  if (route == null) return undefined;
  if (typeof route === "string") return route.trim() || undefined;
  return blocksToSingleString(route);
}

/** Adapta un ítem de Package al formato AdaptedDestination (compatible con DestinationItem) */
function adaptStrapiPackageItem(p: StrapiPackageItem): AdaptedDestination {
  const imageUrl = getImageUrl(p.image as StrapiDestinationItem["image"]);
  const fullImageUrl = imageUrl ? buildFullImageUrl(imageUrl) : FALLBACK_IMAGE;
  const slug = p.title ? slugify(p.title) : undefined;
  return {
    title: p.title ?? "",
    description: p.subtitle ?? "",
    image: fullImageUrl,
    link: slug ? `/paquete-detalles/${slug}` : undefined,
    duration: p.duration,
    price: p.price,
    route: blocksToSingleString(p.route),
    includes: blocksToList(p.includes as StrapiDestinationItem["includes"]),
    slug,
    badge: normalizeBadge(p.badge),
  };
}

/** Formato de ítem Season / Holiday (Collection Type Holiday en Strapi) */
export interface StrapiSeasonItem {
  title?: string;
  subtitle?: string;
  description?: string | StrapiBlock | StrapiBlock[];
  departureDate?: string;
  duration?: string;
  price?: string;
  link?: string;
  home?: boolean;
  badge?: string;
  image?:
    | {
        data?: { attributes?: { url?: string }; url?: string };
        url?: string;
        formats?: Record<string, { url?: string }>;
      }
    | string;
}

/** Season adaptada para la sección de paquetes de temporada en el home */
export interface AdaptedSeason {
  category: string;
  dateFormatted: string;
  title: string;
  link: string;
  image: string;
  /** Extracto de description (blocks) para tarjeta */
  description?: string;
  duration?: string;
  price?: string;
  badge?: "nuevo" | "pocos_lugares" | "agotado" | "oculto";
}

function formatSeasonDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** Imágenes por defecto para seasons sin imagen (placeholders grises como en el resto de la página) */
const SEASON_FALLBACK_IMAGES = [
  "/assets/images/place/place-1.jpg",
  "/assets/images/place/place-2.jpg",
  "/assets/images/place/place-3.jpg",
];

/** Paquetes de temporada por defecto cuando no hay datos en Strapi (como Testimonial, con placeholders grises) */
export const SEASONS_FALLBACK: AdaptedSeason[] = [
  {
    category: "San Valentín",
    dateFormatted: "14 febrero de 2026",
    title: "Festeja con tu pareja el día de los enamorados",
    link: "/paquete-detalles/san-valentin",
    image: "/assets/images/place/place-1.jpg",
  },
  {
    category: "Semana Santa",
    dateFormatted: "29 marzo de 2026",
    title: "Explora Chiapas en Semana Santa las mejores rutas",
    link: "/paquete-detalles/semana-santa",
    image: "/assets/images/place/place-2.jpg",
  },
  {
    category: "Verano",
    dateFormatted: "27 junio de 2026",
    title: "Calorcito y fiesta con tus seres queridos",
    link: "/paquete-detalles/verano",
    image: "/assets/images/place/place-3.jpg",
  },
];

function adaptStrapiSeasonItem(
  s: StrapiSeasonItem,
  index: number,
): AdaptedSeason {
  const imageUrl = getImageUrl(s.image as StrapiDestinationItem["image"]);
  const fullImageUrl = imageUrl
    ? buildFullImageUrl(imageUrl)
    : SEASON_FALLBACK_IMAGES[index % SEASON_FALLBACK_IMAGES.length];
  const slug = s.title ? slugify(s.title) : undefined;
  const link = s.link?.trim() || (slug ? `/paquete-detalles/${slug}` : "#");
  const descPlain = descriptionFromBlocks(s.description);
  const description =
    descPlain.length > 220 ? `${descPlain.slice(0, 217).trim()}…` : descPlain;
  return {
    category: s.subtitle ?? "",
    dateFormatted: formatSeasonDate(s.departureDate),
    title: s.title ?? "",
    link,
    image: fullImageUrl,
    description: description || undefined,
    duration: s.duration?.trim() || undefined,
    price: s.price?.trim() || undefined,
    badge: normalizeBadge(s.badge),
  };
}

/** Collection Type Holiday (temporadas): GET /api/holidays. Populate profundo para itineraryItem.activity. */
const STRAPI_HOLIDAYS_POPULATE =
  "populate[itineraryItem][populate][activity]=*&populate[image]=true&populate[imagesDetails]=true&populate[mapItem]=true";
const STRAPI_HOLIDAYS_URL = `/api/holidays?${STRAPI_HOLIDAYS_POPULATE}`;

/** Obtiene las temporadas desde Strapi Collection Type /api/holidays (Holiday). */
async function fetchRawSeasonsFromStrapi(): Promise<StrapiSeasonItem[]> {
  const response = await fetchStrapi(STRAPI_HOLIDAYS_URL, STRAPI_TOURS_FETCH_OPTIONS);
  if (response?.error) return [];
  const items = getToursArrayFromResponse(response as Record<string, unknown>);
  return items as StrapiSeasonItem[];
}

/** Obtiene los paquetes de temporada para el home (Holiday con home: true). */
export async function fetchSeasonsForHome(): Promise<AdaptedSeason[]> {
  try {
    const rawSeasons = await fetchRawSeasonsFromStrapi();
    const all = rawSeasons
      .filter((s) => s.home === true)
      .map((s, i) => adaptStrapiSeasonItem(s, i));
    return all.filter(
      (s) => (s.title || s.category) && s.badge !== "oculto",
    );
  } catch (error) {
    console.error("Error fetching seasons (holidays) from Strapi:", error);
    return [];
  }
}

/** Obtiene todas las temporadas (Holiday) para la página de Paquetes (no filtra por home). */
export async function fetchSeasonsForPackagesPage(): Promise<AdaptedSeason[]> {
  try {
    const rawSeasons = await fetchRawSeasonsFromStrapi();
    const all = rawSeasons.map((s, i) => adaptStrapiSeasonItem(s, i));
    return all.filter(
      (s) => (s.title || s.category) && s.badge !== "oculto",
    );
  } catch (error) {
    console.error("Error fetching seasons (holidays) from Strapi:", error);
    return [];
  }
}

/** Obtiene los paquetes desde Strapi Collection Type /api/packages */
export async function fetchPackages(): Promise<AdaptedDestination[]> {
  const result = await fetchPackagesPageData();
  return result.packages;
}

/** Obtiene paquetes desde Collection Type /api/packages y banner desde single type /api/packages-page (imageBanner). */
export async function fetchPackagesPageData(): Promise<{
  packages: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const response = await fetchStrapi(STRAPI_PACKAGES_URL, STRAPI_TOURS_FETCH_OPTIONS);
    const items = getToursArrayFromResponse(response as Record<string, unknown>) as StrapiPackageItem[];
    const packages = items.map((p: StrapiPackageItem) =>
      adaptStrapiPackageItem(p),
    );

    let paginaDoc: Record<string, unknown> = {};
    for (const url of STRAPI_PACKAGES_PAGE_URLS) {
      const paginaRes = await fetchStrapi(url, STRAPI_TOURS_FETCH_OPTIONS);
      if (!paginaRes?.error && paginaRes?.data != null) {
        paginaDoc = (paginaRes.data ?? {}) as Record<string, unknown>;
        if (Object.keys(paginaDoc).length > 0) break;
      }
    }
    const imageBanner = paginaDoc.imageBanner;
    const bannerUrl =
      getMediaUrl(imageBanner) ||
      getImageUrl(imageBanner as StrapiDestinationItem["image"]);
    const imageBannerUrl = bannerUrl ? buildFullImageUrl(bannerUrl) : null;
    return { packages, imageBannerUrl };
  } catch (error) {
    console.error("Error fetching packages from Strapi:", error);
    return { packages: [], imageBannerUrl: null };
  }
}

/** Formato para página de detalle de paquete */
export interface AdaptedPackageDetail {
  title: string;
  description: string;
  image: string;
  /** URLs de imágenes para slider/detalle (como en tour-details) */
  imagesDetails?: string[];
  price: string;
  duration?: string;
  route?: string;
  /** Cada viñeta/bloque de route en Strapi como línea propia */
  routeList?: string[];
  includes?: string[];
  /** Itinerario por días; si no hay datos, no se muestra la sección */
  itinerary?: Array<{
    dayTitle: string;
    time?: string;
    activity: string;
    routeItinerary?: string;
    accommodation?: string;
  }>;
  /** Fecha inicio para marcar en el calendario (ej. YYYY-MM-DD) */
  calendarStart?: string;
  /** Fecha fin para marcar en el calendario (ej. YYYY-MM-DD) */
  calendarEnd?: string;
  /** Lista de bloques de mapa desde Strapi (mapItem[].map, mapItem[].title) */
  mapItem?: Array<{ map?: string; title?: string }>;
  accommodation?: string;
  departure?: string;
  transport?: string;
}

/** Adapta un ítem Package o Holiday (misma estructura en Strapi) a AdaptedPackageDetail. Holiday tiene description; Package usa subtitle. */
function adaptPackageOrHolidayToDetail(item: StrapiPackageItem): AdaptedPackageDetail {
  const adapted = adaptStrapiPackageItem(item);
  const routeList = blocksToList(
    item.route as StrapiDestinationItem["includes"],
  );
  const itinerary = (() => {
    if (!Array.isArray(item.itineraryItem) || item.itineraryItem.length === 0) return undefined;
    const rows: NonNullable<AdaptedPackageDetail["itinerary"]> = [];
    for (const raw of item.itineraryItem) {
      const dayTitle = (typeof raw.dayTitle === "string" && raw.dayTitle.trim()) || "Día";
      const activities = unwrapStrapiRelationArray(raw.activity);
      if (activities.length > 0) {
        const first = activities[0] as Record<string, unknown>;
        const looksLikeActivityRow =
          !isStrapiRichTextBlock(first) &&
          first &&
          typeof first === "object" &&
          (typeof first.time === "string" ||
            typeof first.activity === "string" ||
            typeof first.accommodation === "string");
        if (looksLikeActivityRow) {
          for (const act of activities) {
            const a = flattenStrapiComponent(act);
            if (!a || Object.keys(a).length === 0) continue;
            const time = typeof a.time === "string" && a.time.trim() ? a.time.trim() : undefined;
            const rawActivity = a.activity ?? a.description ?? a.text;
            const actText = typeof rawActivity === "string" ? String(rawActivity).trim() : richTextToPlainString(rawActivity) ?? "";
            const acc = typeof a.accommodation === "string" ? String(a.accommodation).trim() : richTextToPlainString(a.accommodation);
            if (actText || time || acc) {
              rows.push({ dayTitle, time, activity: actText || "—", accommodation: acc });
            }
          }
          continue;
        }
      }
      // Legacy: activity is rich text or plain string at day level
      const activity = richTextToPlainString(raw.activity ?? raw.description ?? raw.text) ?? "";
      if (activity) {
        rows.push({
          dayTitle,
          time: typeof raw.time === "string" ? raw.time : undefined,
          activity,
          routeItinerary: richTextToPlainString(raw.routeItinerary),
          accommodation: richTextToPlainString(raw.accommodation),
        });
      }
    }
    return rows.length ? rows : undefined;
  })();
  const imagesDetails = getImagesDetailsUrls(item.imagesDetails);
  return {
    title: adapted.title,
    description:
      descriptionFromBlocks(item.description) || adapted.description || "",
    image: adapted.image,
    imagesDetails: imagesDetails.length > 0 ? imagesDetails : undefined,
    price: adapted.price ?? "Consultar",
    duration: adapted.duration,
    route: adapted.route,
    routeList: routeList ?? undefined,
    includes: adapted.includes,
    itinerary: itinerary?.length ? itinerary : undefined,
    calendarStart: item.calendarStart,
    calendarEnd: item.calendarEnd,
    accommodation: item.accommodation,
    departure: item.departure,
    transport: item.transport,
    mapItem: (() => {
      const raw = item.mapItem;
      if (!raw) return undefined;
      const arr = Array.isArray(raw) ? raw : [raw];
      const mapItems = arr.map((m) => ({
        map: typeof m?.map === "string" ? m.map : undefined,
        title: typeof m?.title === "string" ? m.title : undefined,
      }));
      return mapItems.length ? mapItems : undefined;
    })(),
  };
}

/** Obtiene un paquete por slug desde Strapi Collection Type /api/packages. */
export async function fetchPackageBySlug(
  slug: string,
): Promise<AdaptedPackageDetail | null> {
  try {
    const response = await fetchStrapi(STRAPI_PACKAGES_URL, STRAPI_TOURS_FETCH_OPTIONS);
    if (response?.error) return null;
    const items = getToursArrayFromResponse(response as Record<string, unknown>) as StrapiPackageItem[];
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
    const item = items.find((p) => {
      const itemSlug = p.title ? slugify(p.title) : "";
      return itemSlug === normalizedSlug;
    });
    if (item) return adaptPackageOrHolidayToDetail(item);
    return null;
  } catch (error) {
    console.error("Error fetching package by slug from Strapi:", error);
    return null;
  }
}

/** Obtiene un paquete de temporada (Holiday) por slug desde Strapi Collection Type /api/holidays. */
export async function fetchHolidayBySlug(
  slug: string,
): Promise<AdaptedPackageDetail | null> {
  try {
    const response = await fetchStrapi(STRAPI_HOLIDAYS_URL, STRAPI_TOURS_FETCH_OPTIONS);
    if (response?.error) return null;
    const items = getToursArrayFromResponse(response as Record<string, unknown>) as StrapiPackageItem[];
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
    const item = items.find((p) => {
      const itemSlug = p.title ? slugify(p.title) : "";
      return itemSlug === normalizedSlug;
    });
    if (item) return adaptPackageOrHolidayToDetail(item);
    return null;
  } catch (error) {
    console.error("Error fetching holiday by slug from Strapi:", error);
    return null;
  }
}

/** Obtiene todos los tours publicados para la home (Collection Type /api/tours). Sin filtro home para que se vean todos; la home excluye solo badge "oculto". */
export async function fetchDestinationsForHome(): Promise<
  AdaptedDestination[]
> {
  try {
    const response = await fetchStrapi(
      `/api/tours?${STRAPI_TOURS_POPULATE}`,
      STRAPI_TOURS_FETCH_OPTIONS,
    );
    const items = getToursArrayFromResponse(response as Record<string, unknown>);
    return items.map(adaptStrapiDestination);
  } catch (error) {
    console.error("Error fetching tours for home from Strapi:", error);
    return [];
  }
}

/** Formato para página de detalle de destino */
export interface AdaptedDestinationDetail {
  title: string;
  description: string;
  subtitle?: string;
  image: string;
  imagesDetails: string[];
  location: string;
  price: string;
  duration: string;
  /** Punto de salida (Strapi tour.departure) */
  departure?: string;
  transport?: string;
  link?: string;
  /** Ruta como texto único (para compatibilidad) */
  route?: string;
  /** Ruta como lista de puntos para mostrar en lista vertical */
  routeList?: string[];
  accommodation?: string;
  departureDate?: string;
  map?: string;
  /** Lista de bloques de mapa desde Strapi (mapItem[].map, mapItem[].title) */
  mapItem?: Array<{ map?: string; title?: string }>;
  includes?: string[];
  /** Itinerario: lista de ítems con día, hora, actividad, ruta y alojamiento */
  itinerary?: Array<{
    dayTitle: string;
    time?: string;
    activity: string;
    routeItinerary?: string;
    accommodation?: string;
  }>;
  /** Fecha inicio para marcar en el calendario (ej. YYYY-MM-DD) */
  calendarStart?: string;
  /** Fecha fin para marcar en el calendario (ej. YYYY-MM-DD) */
  calendarEnd?: string;
}

/** Formato para página de detalle de destino internacional */
export interface AdaptedInternationalDetail {
  title: string;
  description: string;
  image: string;
  imagesDetails: string[];
  price: string;
  duration: string;
  accommodation?: string;
  departureDate?: string;
  map?: string;
  route?: string;
  transport?: string;
  departure?: string;
  includes?: string[];
  location?: string;
}

function getImagesDetailsUrls(
  imagesDetails: StrapiDestinationItem["imagesDetails"],
): string[] {
  return getMultipleMediaUrls(imagesDetails);
}

/** Componentes/repeatables a veces vienen como { data: [...] } en respuestas API. */
function unwrapStrapiRelationArray(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object" && value !== null && "data" in value) {
    const d = (value as { data: unknown }).data;
    if (Array.isArray(d)) return d;
    if (d != null && typeof d === "object") return [d];
  }
  return [value];
}

/** Aplana attributes en ítems de componente (v4 o respuestas anidadas). */
function flattenStrapiComponent(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const attrs = r.attributes as Record<string, unknown> | undefined;
  if (attrs && typeof attrs === "object") return { ...r, ...attrs };
  return r;
}

/** true si parece bloque de Strapi (paragraph, list, etc.), no componente activity-item */
function isStrapiRichTextBlock(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (Array.isArray(o.children)) return true;
  const t = typeof o.type === "string" ? o.type : "";
  return (
    t === "paragraph" ||
    t === "heading" ||
    t === "list" ||
    t === "quote" ||
    t === "link"
  );
}

/** Itinerario: día + activity (un objeto o lista de activity-item) o blocks legacy. */
function parseTourItinerary(
  d: StrapiDestinationItem,
): AdaptedDestinationDetail["itinerary"] {
  const itineraryDays = unwrapStrapiRelationArray(d.itineraryItem);
  if (itineraryDays.length === 0) return undefined;
  const rows: NonNullable<AdaptedDestinationDetail["itinerary"]> = [];
  for (const raw of itineraryDays) {
    const i = flattenStrapiComponent(raw);
    const dayTitle =
      (typeof i.dayTitle === "string" && i.dayTitle.trim()) || "Día";
    const activities = unwrapStrapiRelationArray(i.activity);
    if (activities.length > 0) {
      const first = activities[0];
      const firstIsBlock = isStrapiRichTextBlock(first);
      const firstObj = first as Record<string, unknown> | undefined;
      const looksLikeActivityRow =
        !firstIsBlock &&
        firstObj &&
        typeof firstObj === "object" &&
        (typeof firstObj.time === "string" ||
          typeof firstObj.activity === "string" ||
          typeof firstObj.accommodation === "string" ||
          (firstObj.activity != null && !isStrapiRichTextBlock(firstObj.activity)));
      if (looksLikeActivityRow) {
        for (const act of activities) {
          const a = flattenStrapiComponent(act);
          if (!a || Object.keys(a).length === 0) continue;
          const time =
            typeof a.time === "string" && a.time.trim()
              ? a.time.trim()
              : undefined;
          const rawActivity = a.activity ?? a.description ?? a.text;
          const actText =
            typeof rawActivity === "string"
              ? String(rawActivity).trim()
              : richTextToPlainString(rawActivity) ?? "";
          const acc =
            typeof a.accommodation === "string"
              ? String(a.accommodation).trim()
              : richTextToPlainString(a.accommodation);
          if (actText || time || acc) {
            rows.push({
              dayTitle,
              time,
              activity: actText || "—",
              accommodation: acc,
            });
          }
        }
        continue;
      }
    }
    const legacy = i as StrapiItineraryItem;
    const activity =
      richTextToPlainString(
        legacy.activity ?? legacy.description ?? legacy.text,
      ) ?? "";
    if (activity) {
      rows.push({
        dayTitle,
        time: typeof legacy.time === "string" ? legacy.time : undefined,
        activity,
        routeItinerary: richTextToPlainString(legacy.routeItinerary),
        accommodation: richTextToPlainString(legacy.accommodation),
      });
    }
  }
  return rows.length ? rows : undefined;
}

function adaptToDestinationDetail(
  d: StrapiDestinationItem,
): AdaptedDestinationDetail {
  const imageUrl = getImageUrl(d.image);
  const fullImageUrl = buildFullImageUrl(imageUrl);
  const imagesDetails = getImagesDetailsUrls(d.imagesDetails);
  const itinerary = parseTourItinerary(d);
  return {
    title: d.title ?? "",
    description: descriptionFromBlocks(d.description),
    subtitle: d.subtitle?.trim() || undefined,
    image: fullImageUrl,
    imagesDetails,
    location:
      d.departure?.trim() ||
      d.location?.trim() ||
      "Chiapas, México",
    price: d.price ?? "Consultar",
    duration: d.duration ?? "Variable",
    link: d.link,
    route: routeToStr(d.route),
    routeList:
      typeof d.route === "string"
        ? d.route?.trim()
          ? [d.route.trim()]
          : undefined
        : blocksToList(d.route as StrapiDestinationItem["includes"]),
    accommodation: d.accommodation,
    departureDate: d.departureDate,
    departure: d.departure?.trim() || undefined,
    transport: d.transport?.trim() || undefined,
    map:
      (Array.isArray(d.mapItem) ? d.mapItem[0]?.map : d.mapItem?.map) ?? d.map,
    mapItem: (() => {
      const raw = d.mapItem;
      if (!raw) return undefined;
      const arr = Array.isArray(raw) ? raw : [raw];
      const items = arr
        .map((m) => ({
          map: typeof m?.map === "string" ? m.map : undefined,
          title: typeof m?.title === "string" ? m.title : undefined,
        }))
        .filter((m) => m.map);
      return items.length ? items : undefined;
    })(),
    includes: blocksToList(d.includes),
    itinerary: itinerary?.length ? itinerary : undefined,
    calendarStart: d.calendarStart,
    calendarEnd: d.calendarEnd,
  };
}

function adaptToInternationalDetail(
  d: StrapiDestinationItem,
): AdaptedInternationalDetail {
  const imageUrl = getImageUrl(d.image);
  const fullImageUrl = imageUrl ? buildFullImageUrl(imageUrl) : FALLBACK_IMAGE;
  const imagesDetails = getImagesDetailsUrls(d.imagesDetails);
  return {
    title: d.title ?? "",
    description: descriptionFromBlocks(d.description),
    image: fullImageUrl,
    imagesDetails,
    price: d.price ?? "Consultar",
    duration: d.duration ?? "Variable",
    accommodation: d.accommodation,
    departureDate: d.departureDate,
    map: d.map,
    route: routeToStr(d.route),
    transport: d.transport,
    departure: d.departure,
    includes: blocksToList(d.includes),
    location: routeToStr(d.route) ?? d.departure ?? undefined,
  };
}

/** Extrae el slug del link (ej: /destino-detalles/las-tres-tzimoleras -> las-tres-tzimoleras) */
function getSlugFromLink(link?: string): string {
  if (!link) return "";
  const parts = link.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/** Genera slug desde título (para URLs). Exportado para construir URLs de detalle en la UI. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Devuelve la URL de la página de detalle de un tour (para usar en enlaces desde listados). Usa slug legible (título) o documentId como fallback; solo devuelve /tours si no hay ninguno. */
export function getTourDetailHref(destination: {
  slug?: string;
  link?: string;
  title: string;
  documentId?: string;
}): string {
  const slug =
    (destination.slug && destination.slug.trim()) ||
    (destination.link ? getSlugFromLink(destination.link) : "") ||
    (destination.title ? slugify(destination.title) : "") ||
    destination.documentId ||
    "";
  return slug ? `/tour-detalles/${slug}` : "/tours";
}

/** Extrae la URL de un ítem de media (objeto con .url, .data.url, .attributes.url o anidado). */
function getOneMediaUrl(img: unknown): string {
  if (img == null) return "";
  if (typeof img === "string") return img.trim();
  const o = img as Record<string, unknown>;
  const data = o?.data as { url?: string; attributes?: { url?: string } } | undefined;
  const attrs = o?.attributes as { url?: string } | undefined;
  const url =
    (o?.url as string) ??
    data?.url ??
    data?.attributes?.url ??
    attrs?.url ??
    findUrlInObject(img) ??
    "";
  return (url && String(url).trim()) || "";
}

/** Extrae URLs de un campo Multiple media (Strapi v5: array, { data: array }, o un solo objeto). */
function getMultipleMediaUrls(media: unknown): string[] {
  if (!media) return [];
  let arr: unknown[] = [];
  if (Array.isArray(media)) {
    arr = media;
  } else if (media && typeof media === "object" && "data" in media) {
    const data = (media as { data?: unknown }).data;
    arr = Array.isArray(data) ? data : data ? [data] : [];
  } else if (media && typeof media === "object") {
    // Un solo ítem de media (objeto con .url o anidado)
    arr = [media];
  }
  return arr
    .map((img) => getOneMediaUrl(img))
    .filter(Boolean)
    .map((url) => buildFullImageUrl(url))
    .filter(Boolean);
}

/** Grupo de galería desde Strapi (componente gallery.gallery: title + gallery) */
export interface GalleryGroup {
  title: string;
  images: string[];
}

/** Extrae IDs de media cuando Strapi devuelve gallery como [ id1, id2 ] o [ { id }, ... ]. */
function extractMediaIds(gallery: unknown): number[] {
  if (!gallery) return [];
  const arr = Array.isArray(gallery) ? gallery : (gallery as { data?: unknown[] })?.data ?? [];
  return arr
    .map((item) => (typeof item === "number" ? item : (item as { id?: number })?.id))
    .filter((id): id is number => typeof id === "number" && Number.isInteger(id));
}

/** Resuelve IDs de media a URLs vía GET /api/upload/files/:id (cuando el populate no trae la media). */
async function resolveMediaIdsToUrls(ids: number[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetchStrapi(`/api/upload/files/${id}`, STRAPI_TOURS_FETCH_OPTIONS);
        const data = res?.data as { url?: string } | undefined;
        const url = data?.url;
        return url ? buildFullImageUrl(url) : "";
      } catch {
        return "";
      }
    })
  );
  return results.filter(Boolean);
}

/** Single type Gallery: varias variantes de populate (la anidada [populate]=gallery da 500 en algunos Strapi). */
const STRAPI_GALLERY_PAGE_URLS = [
  "/api/gallery?populate=imageBanner&populate[galleryGroup][populate][gallery]=true&status=published",
  "/api/gallery?populate=imageBanner&populate[galleryGroup]=*&status=published",
  "/api/gallery?populate=imageBanner&populate[galleryGroup]=*",
  "/api/gallery?populate=imageBanner&populate=galleryGroup&status=published",
  "/api/gallery?populate=imageBanner&populate=galleryGroup",
  "/api/gallery?populate=imageBanner&status=published",
  "/api/gallery?populate=imageBanner",
  "/api/gallery?status=published",
  "/api/gallery",
  "/api/galleries?populate=imageBanner&populate[galleryGroup]=*&status=published",
  "/api/galleries?populate=imageBanner&populate=galleryGroup&status=published",
  "/api/galleries?populate=imageBanner&status=published",
  "/api/galleries",
] as const;

/** Obtiene datos de la página Galería desde Strapi single type /api/gallery (imageBanner, galleryGroup). */
export async function fetchGalleryPageData(): Promise<{
  imageBannerUrl: string | null;
  galleryGroups: GalleryGroup[];
  galleryImages: string[];
}> {
  try {
    let doc: Record<string, unknown> = {};
    for (const url of STRAPI_GALLERY_PAGE_URLS) {
      const response = await fetchStrapi(url, STRAPI_TOURS_FETCH_OPTIONS);
      if (!response?.error && response?.data != null) {
        doc = (response.data ?? {}) as Record<string, unknown>;
        if (Object.keys(doc).length > 0) break;
      }
    }
    const imageBanner = doc.imageBanner;
    const bannerUrl =
      getMediaUrl(imageBanner) ||
      getImageUrl(imageBanner as StrapiDestinationItem["image"]);
    const imageBannerUrl = bannerUrl ? buildFullImageUrl(bannerUrl) : null;

    const rawGroups = doc.galleryGroup ?? doc.galleryGroups ?? [];
    const groupsArr = Array.isArray(rawGroups) ? rawGroups : [rawGroups];
    const rawItems = groupsArr.filter(
      (g: unknown): g is Record<string, unknown> => g != null && typeof g === "object"
    ) as Array<{ title?: string; gallery?: unknown; images?: unknown }>;
    const galleryGroups: GalleryGroup[] = [];
    for (const g of rawItems) {
      const galleryRaw = g.gallery ?? g.images;
      let images = getMultipleMediaUrls(galleryRaw);
      if (images.length === 0) {
        const ids = extractMediaIds(galleryRaw);
        if (ids.length > 0) images = await resolveMediaIdsToUrls(ids);
      }
      if (images.length > 0) {
        galleryGroups.push({ title: (g.title as string) ?? "Galería", images });
      }
    }
    const galleryImages = galleryGroups.flatMap((g) => g.images);
    return {
      imageBannerUrl,
      galleryGroups,
      galleryImages,
    };
  } catch (error) {
    console.error("Error fetching gallery from Strapi:", error);
    return { imageBannerUrl: null, galleryGroups: [], galleryImages: [] };
  }
}

/** Single type About: populate de media (imageAbout, imageAboutGallery, imageBannerAbout). */
const STRAPI_ABOUT_PAGE_URLS = [
  "/api/about?populate=imageAbout&populate=imageAboutGallery&populate=imageBannerAbout&status=published",
  "/api/about?populate=imageAbout&populate=imageAboutGallery&populate=imageBannerAbout",
  "/api/about?populate=*&status=published",
  "/api/about?populate=*",
  "/api/about?status=published",
  "/api/about",
] as const;

/** Tipo para datos de la página About (Strapi v5 single type: data es el documento). */
export interface AboutPageData {
  imageBannerUrl: string | null;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: unknown;
  featuresSubTitle?: string;
  featuresTitle?: string;
  featuresDescription?: string;
  features?: Array<{ icon?: string; title?: string; description?: string }>;
  whoWeAre?: {
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string | null;
  };
  whoWeAreTitle?: string;
  whoWeAreDescription?: string;
  whatWeSubTitle?: string;
  whatWeTitle?: string;
  galleryImages?: string[];
  cta?: { title?: string; buttonText?: string; buttonLink?: string };
  ctaTitle?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
}

function getMediaUrl(media: unknown): string {
  if (!media) return "";
  if (typeof media === "string") return media;
  const m = media as Record<string, unknown>;
  const dataUrl = (m?.data as Record<string, unknown>)?.url;
  if (typeof dataUrl === "string") return dataUrl;
  if (typeof m?.url === "string") return m.url;
  return "";
}

/** Obtiene datos de la página About (Strapi v5: data es el documento). Devuelve null si no hay datos o hay error. */
export async function fetchAboutPageData(): Promise<AboutPageData | null> {
  try {
    let doc: Record<string, unknown> = {};
    for (const url of STRAPI_ABOUT_PAGE_URLS) {
      const response = await fetchStrapi(url, STRAPI_TOURS_FETCH_OPTIONS);
      if (!response?.error && response?.data != null) {
        doc = (response.data ?? {}) as Record<string, unknown>;
        if (Object.keys(doc).length > 0) break;
      }
    }

    // Sin documento o documento vacío → mostrar "en mantenimiento" en la página
    if (Object.keys(doc).length === 0) return null;

    const imageBannerAbout = doc.imageBannerAbout ?? doc.imageBanner;
    const bannerUrl =
      getMediaUrl(imageBannerAbout) ||
      getImageUrl(imageBannerAbout as StrapiDestinationItem["image"]);
    const imageBannerUrl = bannerUrl ? buildFullImageUrl(bannerUrl) : null;

    const features = Array.isArray(doc.features)
      ? (doc.features as Array<Record<string, unknown>>).map((f) => ({
          icon: String(f?.icon ?? f?.flaticon ?? ""),
          title: String(f?.title ?? f?.name ?? ""),
          description: String(f?.description ?? f?.text ?? ""),
        }))
      : undefined;

    const imageAbout = doc.imageAbout ?? doc.whoWeAreImage;
    const rawWhoWeUrl =
      getMediaUrl(imageAbout) ||
      getImageUrl(imageAbout as StrapiDestinationItem["image"]);
    const whoWeImgUrl = rawWhoWeUrl ? buildFullImageUrl(rawWhoWeUrl) : null;

    const galleryImages = getMultipleMediaUrls(doc.imageAboutGallery);

    const whoWe = doc.whoWeAre as Record<string, unknown> | undefined;
    const result: AboutPageData = {
      imageBannerUrl,
      galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      title: doc.title ? String(doc.title) : undefined,
      subtitle: (doc.subtitle ?? doc.subTitle)
        ? String(doc.subtitle ?? doc.subTitle)
        : undefined,
      description: doc.description ? String(doc.description) : undefined,
      content: doc.content,
      featuresSubTitle: doc.featuresSubTitle ? String(doc.featuresSubTitle) : undefined,
      featuresTitle: doc.featuresTitle ? String(doc.featuresTitle) : undefined,
      featuresDescription: doc.featuresDescription ? String(doc.featuresDescription) : undefined,
      features,
      whoWeAre: whoWe
        ? {
            title: whoWe.title ? String(whoWe.title) : undefined,
            subtitle: (whoWe.subtitle ?? whoWe.subTitle)
              ? String(whoWe.subtitle ?? whoWe.subTitle)
              : undefined,
            description: whoWe.description
              ? String(whoWe.description)
              : undefined,
            imageUrl: whoWeImgUrl,
          }
        : doc.imageAbout || doc.whoWeAreImage || doc.whoWeAre
          ? { imageUrl: whoWeImgUrl }
          : undefined,
      whoWeAreTitle: doc.whoWeAreTitle ? String(doc.whoWeAreTitle) : undefined,
      whoWeAreDescription: doc.whoWeAreDescription ? String(doc.whoWeAreDescription) : undefined,
      whatWeSubTitle: doc.whatWeSubTitle ? String(doc.whatWeSubTitle) : undefined,
      whatWeTitle: doc.whatWeTitle ? String(doc.whatWeTitle) : undefined,
      cta:
        doc.ctaTitle || doc.ctaButtonText
          ? {
              title: doc.ctaTitle ? String(doc.ctaTitle) : undefined,
              buttonText: doc.ctaButtonText
                ? String(doc.ctaButtonText)
                : undefined,
              buttonLink: doc.ctaButtonLink
                ? String(doc.ctaButtonLink)
                : undefined,
            }
          : undefined,
      ctaTitle: doc.ctaTitle ? String(doc.ctaTitle) : undefined,
      ctaButtonText: doc.ctaButtonText ? String(doc.ctaButtonText) : undefined,
      ctaButtonLink: doc.ctaButtonLink ? String(doc.ctaButtonLink) : undefined,
    };

    // Si no hay contenido real (solo metadata o campos vacíos), mostrar "en mantenimiento"
    const hasContent =
      (result.title && result.title.trim()) ||
      (result.description && result.description.trim()) ||
      (result.features && result.features.length > 0) ||
      (result.featuresTitle && result.featuresTitle.trim()) ||
      (result.whoWeAre?.title || result.whoWeAre?.description) ||
      (result.whatWeTitle && result.whatWeTitle.trim()) ||
      (result.ctaTitle && result.ctaTitle.trim()) ||
      (result.galleryImages && result.galleryImages.length > 0) ||
      (whoWeImgUrl != null && whoWeImgUrl !== "") ||
      (imageBannerUrl != null && imageBannerUrl !== "");
    if (!hasContent) return null;

    return result;
  } catch (error) {
    console.error("Error fetching about from Strapi:", error);
    return null;
  }
}

/** Single type FAQ (api::faq.faq): lista en componente repeatable "faq". Strapi v5 puede devolver sin populate por defecto. */
const STRAPI_FAQ_PAGE_URLS = [
  "/api/faq?populate=*&status=published",
  "/api/faq?populate[0]=faq&status=published",
  "/api/faq?populate=faq&status=published",
  "/api/faq?populate=*",
  "/api/faq?populate[0]=faq",
  "/api/faq?populate=faq",
  "/api/faq?status=published",
  "/api/faq",
] as const;

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Extrae el array de ítems FAQ del documento (soporta data plano, data.attributes v4, y faq como array o { data: [] }). */
function getFaqArrayFromDoc(doc: Record<string, unknown>): Array<Record<string, unknown>> {
  const attrs = (doc.attributes ?? doc) as Record<string, unknown>;
  const rawFaq = attrs.faq ?? doc.faq;
  if (Array.isArray(rawFaq)) return rawFaq as Array<Record<string, unknown>>;
  const inner = rawFaq && typeof rawFaq === "object" && (rawFaq as Record<string, unknown>).data;
  if (Array.isArray(inner)) return inner as Array<Record<string, unknown>>;
  return [];
}

/** Obtiene los ítems de FAQ desde Strapi (single type api::faq.faq, componente faq). */
export async function fetchFaqPageData(): Promise<FaqItem[]> {
  try {
    let doc: Record<string, unknown> = {};
    for (const url of STRAPI_FAQ_PAGE_URLS) {
      const response = await fetchStrapi(url, STRAPI_TOURS_FETCH_OPTIONS);
      if (response?.error) continue;
      const data = response?.data;
      if (data == null) continue;
      doc = (typeof data === "object" && !Array.isArray(data) ? data : {}) as Record<string, unknown>;
      if (Object.keys(doc).length > 0) break;
    }
    const faqArray = getFaqArrayFromDoc(doc);
    if (faqArray.length === 0) return [];
    return faqArray.map((item, index) => ({
      id: String(item.documentId ?? item.id ?? `faq${index + 1}`),
      question: String(item.question ?? ""),
      answer: String(item.answer ?? ""),
    }));
  } catch (error) {
    console.error("Error fetching FAQ from Strapi:", error);
    return [];
  }
}

/** Obtiene un tour por slug desde Collection Type /api/tours. El content-type tour no tiene campo slug; se busca por slug generado del título (slugify) o por documentId. */
export async function fetchTourBySlug(
  slug: string,
): Promise<AdaptedDestinationDetail | null> {
  try {
    const normalizedSlug = slugify(slug);
    const response = await fetchStrapi(
      STRAPI_TOURS_URL,
      STRAPI_TOURS_FETCH_OPTIONS,
    );
    const items = getToursArrayFromResponse(response as Record<string, unknown>);
    const item = items.find((d) => {
      const byDocId = d.documentId && String(d.documentId) === slug;
      const byTitle = d.title ? slugify(d.title) === normalizedSlug : false;
      return byDocId || byTitle;
    }) ?? null;
    if (!item) return null;
    const withItinerary = await fetchTourWithItineraryPopulated(item);
    return adaptToDestinationDetail(withItinerary);
  } catch (error) {
    console.error("Error fetching tour by slug from Strapi:", error);
    return null;
  }
}

/** @deprecated Usar fetchTourBySlug */
export const fetchDestinationBySlug = fetchTourBySlug;

/** Obtiene un destino internacional por slug desde Collection Type /api/internationals. */
export async function fetchInternationalBySlug(
  slug: string,
): Promise<AdaptedInternationalDetail | null> {
  try {
    const response = await fetchStrapi(STRAPI_INTERNATIONALS_URL, STRAPI_TOURS_FETCH_OPTIONS);
    if (response?.error) return null;
    const items = getToursArrayFromResponse(response as Record<string, unknown>);
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
    const item = items.find((d) => {
      const fromLink = getSlugFromLink(d.link);
      const fromTitle = d.title ? slugify(d.title) : "";
      return (
        fromLink.toLowerCase() === normalizedSlug ||
        fromTitle === normalizedSlug ||
        fromLink.toLowerCase().replace(/\s+/g, "-") === normalizedSlug
      );
    });
    if (item) return adaptToInternationalDetail(item);
    return null;
  } catch (error) {
    console.error("Error fetching international by slug from Strapi:", error);
    return null;
  }
}
