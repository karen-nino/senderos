const { STRAPI_URL, STRAPI_TOKEN } = process.env;

/** Revalidación ISR: regenerar datos de Strapi como máximo cada 60 segundos */
export const STRAPI_REVALIDATE_SECONDS = 60;

/** Collection Type Tour (Strapi v5: GET /api/tours devuelve { data: [...] }). */
const STRAPI_TOURS_POPULATE = "populate[image]=*&populate[imagesDetails]=*&populate[itineraryItem]=*&populate[mapItem]=*";
const STRAPI_TOURS_URL = `/api/tours?${STRAPI_TOURS_POPULATE}`;
/** Single type Tours - Página: banner para la lista de tours. */
const STRAPI_TOURS_PAGINA_URL = "/api/tours-pagina?populate[banner]=*";

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

/** Ítem de itinerario desde Strapi (activity/routeItinerary/accommodation pueden ser string o rich text) */
export interface StrapiItineraryItem {
  dayTitle?: string;
  time?: string;
  activity?: string | StrapiBlock | StrapiBlock[];
  routeItinerary?: string | StrapiBlock | StrapiBlock[];
  accommodation?: string | StrapiBlock | StrapiBlock[];
}

/** Formato de destino desde Strapi API /api/tours (Collection Type) y /api/international */
export interface StrapiDestinationItem {
  id?: number;
  documentId?: string;
  title?: string;
  description?: string;
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
  badge?: "new" | "few_left" | "sold_out" | "hide";
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
  image: string;
  link?: string;
  icons?: string[];
  departureDate?: string;
  price?: string;
  accommodation?: string;
  duration?: string;
  badge?: "new" | "few_left" | "sold_out" | "hide";
  /** Campos específicos de International desde Strapi */
  route?: string;
  transport?: string;
  departure?: string;
  /** Lista de ítems (cada bloque = un ítem) para mostrar como lista vertical */
  includes?: string[];
  /** Slug para URL de detalle (ej: internacional-detalles/[slug]) */
  slug?: string;
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

function buildFullImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";
  const trimmed = imageUrl.trim();
  const uploadsMatch = trimmed.match(/\/uploads\/(.+)$/) ?? trimmed.match(/^uploads\/(.+)$/);
  if (uploadsMatch) {
    return `/api/strapi-uploads/${uploadsMatch[1]}`;
  }
  if (trimmed.startsWith("http")) return trimmed;
  const cleanUrl = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${getStrapiBaseUrl()}${cleanUrl}`;
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
    description: d.description ?? "",
    image: fullImageUrl,
    link: d.link,
    icons: Array.isArray(d.icons) ? d.icons : undefined,
    departureDate: d.departureDate,
    price: d.price,
    accommodation: d.accommodation,
    duration: d.duration,
    badge:
      d.badge === "new" ||
      d.badge === "few_left" ||
      d.badge === "sold_out" ||
      d.badge === "hide"
        ? d.badge
        : undefined,
    route: routeToStr(d.route),
    transport: d.transport,
    departure: d.departure,
    includes: blocksToList(d.includes),
    slug: d.slug ?? getSlugFromLink(d.link) ?? (d.title ? slugify(d.title) : undefined),
  };
}

/** Obtiene los destinos (tours) desde Strapi Collection Type /api/tours */
export async function fetchDestinations(): Promise<AdaptedDestination[]> {
  const result = await fetchTourPageData();
  return result.destinations;
}

/** Obtiene tours desde Collection Type /api/tours y banner desde single type /api/tours-pagina. */
export async function fetchTourPageData(): Promise<{
  destinations: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const response = await fetchStrapi(STRAPI_TOURS_URL);
    if (response?.error) return { destinations: [], imageBannerUrl: null };
    const rawData = response?.data;
    const items: StrapiDestinationItem[] = Array.isArray(rawData)
      ? (rawData as StrapiDestinationItem[])
      : [];
    const destinations = items.map(adaptStrapiDestination);

    const paginaRes = await fetchStrapi(STRAPI_TOURS_PAGINA_URL);
    const paginaDoc = (paginaRes?.data ?? {}) as Record<string, unknown>;
    const imageBanner = paginaDoc.banner;
    const bannerUrl = getImageUrl(
      imageBanner as StrapiDestinationItem["image"],
    );
    const imageBannerUrl = bannerUrl ? buildFullImageUrl(bannerUrl) : null;
    return { destinations, imageBannerUrl };
  } catch (error) {
    console.error("Error fetching tours from Strapi:", error);
    return { destinations: [], imageBannerUrl: null };
  }
}

/** @deprecated Usar fetchTourPageData */
export const fetchDestinationPageData = fetchTourPageData;

/** Obtiene destinos internacionales + imageBanner (Strapi v5: data.info, data.imageBanner). */
export async function fetchInternationalPageData(): Promise<{
  destinations: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const response = await fetchStrapi("/api/international");
    if (response?.error) return { destinations: [], imageBannerUrl: null };
    const doc = (response?.data ?? {}) as Record<string, unknown>;
    const items: StrapiDestinationItem[] = Array.isArray(doc.info)
      ? (doc.info as StrapiDestinationItem[])
      : [];
    const destinations = items.map(adaptStrapiDestination);
    const imageBanner = doc.imageBanner;
    const bannerUrl = getImageUrl(
      imageBanner as StrapiDestinationItem["image"],
    );
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
  badge?: "new" | "few_left" | "sold_out" | "hide";
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
    badge: p.badge,
  };
}

/** Formato de ítem Season (componente package.season en Strapi) */
export interface StrapiSeasonItem {
  title?: string;
  subtitle?: string;
  departureDate?: string;
  link?: string;
  home?: boolean;
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
  return {
    category: s.subtitle ?? "",
    dateFormatted: formatSeasonDate(s.departureDate),
    title: s.title ?? "",
    link,
    image: fullImageUrl,
  };
}

/** Obtiene las temporadas desde Strapi single type /api/package (Strapi v5: data.Temporada o data.season). */
async function fetchRawSeasonsFromStrapi(): Promise<StrapiSeasonItem[]> {
  const response = await fetchStrapi("/api/package");
  if (response?.error) return [];
  const doc = (response?.data ?? {}) as Record<string, unknown>;
  const seasons = Array.isArray(doc.Temporada)
    ? (doc.Temporada as StrapiSeasonItem[])
    : Array.isArray(doc.season)
      ? (doc.season as StrapiSeasonItem[])
      : [];
  return seasons;
}

/** Obtiene los paquetes de temporada para el home (Temporada con home: true). Soporta "Temporada" o "season". */
export async function fetchSeasonsForHome(): Promise<AdaptedSeason[]> {
  try {
    const rawSeasons = await fetchRawSeasonsFromStrapi();
    const all = rawSeasons
      .filter((s) => s.home === true)
      .map((s, i) => adaptStrapiSeasonItem(s, i));
    return all.filter((s) => s.title || s.category);
  } catch (error) {
    console.error("Error fetching seasons from Strapi:", error);
    return [];
  }
}

/** Obtiene todas las temporadas para la página de Paquetes (no filtra por home). */
export async function fetchSeasonsForPackagesPage(): Promise<AdaptedSeason[]> {
  try {
    const rawSeasons = await fetchRawSeasonsFromStrapi();
    const all = rawSeasons.map((s, i) => adaptStrapiSeasonItem(s, i));
    return all.filter((s) => s.title || s.category);
  } catch (error) {
    console.error("Error fetching seasons from Strapi:", error);
    return [];
  }
}

/** Obtiene los paquetes desde Strapi single type /api/package */
export async function fetchPackages(): Promise<AdaptedDestination[]> {
  const result = await fetchPackagesPageData();
  return result.packages;
}

/** Obtiene paquetes + banner desde single type /api/package (Strapi v5: data.Paquete, data.Banner). */
export async function fetchPackagesPageData(): Promise<{
  packages: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const response = await fetchStrapi("/api/package");
    if (response?.error) return { packages: [], imageBannerUrl: null };
    const doc = (response?.data ?? {}) as Record<string, unknown>;
    const rawItems = Array.isArray(doc.Paquete)
      ? doc.Paquete
      : Array.isArray(doc.package)
        ? doc.package
        : [];
    const items = rawItems as StrapiPackageItem[];
    const packages = items.map((p: StrapiPackageItem) =>
      adaptStrapiPackageItem(p),
    );
    const imageBanner = doc.Banner ?? doc.imageBanner;
    const bannerUrl = getImageUrl(
      imageBanner as StrapiDestinationItem["image"],
    );
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

/** Obtiene un paquete por slug desde Strapi single type (Strapi v5: data.Paquete). */
export async function fetchPackageBySlug(
  slug: string,
): Promise<AdaptedPackageDetail | null> {
  try {
    const response = await fetchStrapi("/api/package");
    if (response?.error) return null;
    const doc = (response?.data ?? {}) as Record<string, unknown>;
    const items: StrapiPackageItem[] = Array.isArray(doc.Paquete)
      ? (doc.Paquete as StrapiPackageItem[])
      : Array.isArray(doc.package)
        ? (doc.package as StrapiPackageItem[])
        : [];
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
    const item = items.find((p) => {
      const itemSlug = p.title ? slugify(p.title) : "";
      return itemSlug === normalizedSlug;
    });
    if (item) {
      const adapted = adaptStrapiPackageItem(item);
      const routeList = blocksToList(
        item.route as StrapiDestinationItem["includes"],
      );
      const itinerary = Array.isArray(item.itineraryItem)
        ? item.itineraryItem
            .map((i) => ({
              dayTitle: i.dayTitle ?? "Día",
              time: typeof i.time === "string" ? i.time : undefined,
              activity: richTextToPlainString(i.activity) ?? "",
              routeItinerary: richTextToPlainString(i.routeItinerary),
              accommodation: richTextToPlainString(i.accommodation),
            }))
            .filter((entry) => entry.activity.length > 0)
        : undefined;
      const imagesDetails = getImagesDetailsUrls(item.imagesDetails);
      return {
        title: adapted.title,
        description: adapted.description,
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
          const items = arr.map((m) => ({
            map: typeof m?.map === "string" ? m.map : undefined,
            title: typeof m?.title === "string" ? m.title : undefined,
          }));
          return items.length ? items : undefined;
        })(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching package by slug from Strapi:", error);
    return null;
  }
}

/** Obtiene los tours con home: true desde Collection Type /api/tours. */
export async function fetchDestinationsForHome(): Promise<
  AdaptedDestination[]
> {
  try {
    const response = await fetchStrapi(
      `/api/tours?filters[home][$eq]=true&${STRAPI_TOURS_POPULATE}`,
    );
    if (response?.error) return [];
    const rawData = response?.data;
    const items: StrapiDestinationItem[] = Array.isArray(rawData)
      ? (rawData as StrapiDestinationItem[])
      : [];
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
  image: string;
  imagesDetails: string[];
  location: string;
  price: string;
  duration: string;
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
  if (!imagesDetails) return [];
  const arr = Array.isArray(imagesDetails)
    ? imagesDetails
    : ((
        imagesDetails as { data?: Array<{ url?: string }> }
      )?.data ?? []);
  return arr
    .map((img) => {
      const url = (img as { url?: string })?.url ?? "";
      return buildFullImageUrl(url);
    })
    .filter(Boolean);
}

function adaptToDestinationDetail(
  d: StrapiDestinationItem,
): AdaptedDestinationDetail {
  const imageUrl = getImageUrl(d.image);
  const fullImageUrl = buildFullImageUrl(imageUrl);
  const imagesDetails = getImagesDetailsUrls(d.imagesDetails);
  const itinerary = Array.isArray(d.itineraryItem)
    ? d.itineraryItem
        .map((i) => ({
          dayTitle: i.dayTitle ?? "Día",
          time: typeof i.time === "string" ? i.time : undefined,
          activity: richTextToPlainString(i.activity) ?? "",
          routeItinerary: richTextToPlainString(i.routeItinerary),
          accommodation: richTextToPlainString(i.accommodation),
        }))
        .filter((entry) => entry.activity.length > 0)
    : undefined;
  return {
    title: d.title ?? "",
    description: d.description ?? "",
    image: fullImageUrl,
    imagesDetails,
    location: d.location ?? "Chiapas, México",
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
    description: d.description ?? "",
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

/** Genera slug desde título (para URLs) */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Extrae URLs de un campo Multiple media (Strapi v5: items con .url). */
function getMultipleMediaUrls(media: unknown): string[] {
  if (!media) return [];
  const arr = Array.isArray(media)
    ? media
    : ((media as { data?: Array<{ url?: string }> })?.data ?? []);
  return arr
    .map((img) => {
      const url = (img as { url?: string })?.url ?? "";
      return buildFullImageUrl(url);
    })
    .filter(Boolean);
}

/** Grupo de galería desde Strapi (componente gallery.gallery: title + gallery) */
export interface GalleryGroup {
  title: string;
  images: string[];
}

/** Obtiene datos de la página Galería desde Strapi (Strapi v5: data.imageBanner, data.galleryGroup). */
export async function fetchGalleryPageData(): Promise<{
  imageBannerUrl: string | null;
  galleryGroups: GalleryGroup[];
  galleryImages: string[];
}> {
  try {
    const response = await fetchStrapi("/api/gallery");
    if (response?.error)
      return { imageBannerUrl: null, galleryGroups: [], galleryImages: [] };
    const doc = (response?.data ?? {}) as Record<string, unknown>;
    const imageBanner = doc.imageBanner;
    const bannerUrl = getImageUrl(
      imageBanner as StrapiDestinationItem["image"],
    );
    const rawGroups = doc.galleryGroup ?? [];
    const groupsArr = Array.isArray(rawGroups) ? rawGroups : [rawGroups];
    const galleryGroups: GalleryGroup[] = groupsArr
      .filter((g: unknown) => g && typeof g === "object")
      .map((g: { title?: string; gallery?: unknown }) => ({
        title: (g.title as string) ?? "Galería",
        images: getMultipleMediaUrls(g.gallery),
      }))
      .filter((g) => g.images.length > 0);
    const galleryImages = galleryGroups.flatMap((g) => g.images);
    return {
      imageBannerUrl: bannerUrl ? buildFullImageUrl(bannerUrl) : null,
      galleryGroups,
      galleryImages,
    };
  } catch (error) {
    console.error("Error fetching gallery from Strapi:", error);
    return { imageBannerUrl: null, galleryGroups: [], galleryImages: [] };
  }
}

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

/** Obtiene datos de la página About (Strapi v5: data es el documento). */
export async function fetchAboutPageData(): Promise<AboutPageData> {
  const empty: AboutPageData = { imageBannerUrl: null };
  try {
    const response = await fetchStrapi("/api/about");
    if (response?.error) return empty;
    const doc = (response?.data ?? {}) as Record<string, unknown>;

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
    return {
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
  } catch (error) {
    console.error("Error fetching about from Strapi:", error);
    return empty;
  }
}

/** Obtiene un tour por slug desde Collection Type /api/tours (filtro por slug). */
export async function fetchTourBySlug(
  slug: string,
): Promise<AdaptedDestinationDetail | null> {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const response = await fetchStrapi(
      `/api/tours?filters[slug][$eq]=${encodedSlug}&${STRAPI_TOURS_POPULATE}`,
    );
    if (response?.error) return null;
    const rawData = response?.data;
    const items: StrapiDestinationItem[] = Array.isArray(rawData)
      ? (rawData as StrapiDestinationItem[])
      : [];
    const item = items[0] ?? null;
    if (item) return adaptToDestinationDetail(item);
    return null;
  } catch (error) {
    console.error("Error fetching tour by slug from Strapi:", error);
    return null;
  }
}

/** @deprecated Usar fetchTourBySlug */
export const fetchDestinationBySlug = fetchTourBySlug;

/** Obtiene un destino internacional por slug (Strapi v5: data.info). */
export async function fetchInternationalBySlug(
  slug: string,
): Promise<AdaptedInternationalDetail | null> {
  try {
    const response = await fetchStrapi("/api/international");
    if (response?.error) return null;
    const doc = (response?.data ?? {}) as Record<string, unknown>;
    const items: StrapiDestinationItem[] = Array.isArray(doc.info)
      ? (doc.info as StrapiDestinationItem[])
      : [];
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
