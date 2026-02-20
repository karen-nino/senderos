const { STRAPI_URL, STRAPI_TOKEN } = process.env;

export function query(url: string) {
  return fetch(`${STRAPI_URL}/api/${url}?populate=*`, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
  }).then((res) => res.json());
}

export async function fetchStrapi(url: string) {
  const baseUrl =
    STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const fullUrl = `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  const response = await fetch(fullUrl, {
    headers,
    cache: "no-store",
    next: { revalidate: 0 },
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

/** Formato de destino desde Strapi API /api/tour y /api/international */
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

function getImageUrl(image: StrapiDestinationItem["image"]): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  // Strapi v4: image.data.attributes.url
  // Strapi v5: image.url (formato aplanado)
  const url =
    image.data?.attributes?.url ??
    image.data?.url ??
    image.url ??
    (image.formats && Object.values(image.formats)[0]?.url) ??
    "";
  return url || "";
}

function buildFullImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  const cleanUrl = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  // Usar proxy /strapi-uploads para que las imágenes carguen desde el mismo origen
  // (evita CORS y permite acceso cuando Strapi está en localhost)
  if (cleanUrl.startsWith("/uploads/")) {
    return `/strapi-uploads${cleanUrl.replace("/uploads", "")}`;
  }
  const strapiUrl =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";
  return `${strapiUrl}${cleanUrl}`;
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

/** Hero slide adaptado con URL de imagen resuelta (usa proxy /strapi-uploads) */
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

/** Parsea heroSlides desde home y resuelve URLs de imagen con proxy */
export function parseHomeHeroSlides(homeData: unknown): AdaptedHeroSlide[] {
  const home = homeData as Record<string, unknown>;
  const attrs = home?.attributes ?? home;
  const raw = (attrs as Record<string, unknown>)?.heroSlides;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((s: Record<string, unknown>, i: number) => {
    const imageUrl = getImageUrl(s.image as StrapiDestinationItem["image"]);
    const fullUrl = imageUrl
      ? buildFullImageUrl(imageUrl)
      : HERO_FALLBACK_IMAGE;
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
    };
  });
}

/** Parsea gallery (múltiple media) desde home - Página Principal gallery */
export function parseHomeGallery(homeData: unknown): string[] {
  const home = homeData as Record<string, unknown>;
  const attrs = home?.attributes ?? home;
  const galleryMedia = (attrs as Record<string, unknown>)?.gallery;
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

/** Parsea el testimonial desde la respuesta de home (Strapi) */
export function parseHomeTestimonial(
  homeData: unknown,
): AdaptedTestimonial | null {
  const home = homeData as Record<string, unknown>;
  const attrs = home?.attributes ?? home;
  const raw = (attrs as Record<string, unknown>)?.testimonial;
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

/** Parsea servicios desde la respuesta de home (Strapi) */
export function parseHomeServices(homeData: unknown): AdaptedHomeService[] {
  const home = homeData as Record<string, unknown>;
  const attrs = home?.attributes ?? home;
  const rawServices = (attrs as Record<string, unknown>)?.services;
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
    slug: getSlugFromLink(d.link) || (d.title ? slugify(d.title) : undefined),
  };
}

/** Obtiene los destinos desde Strapi /api/tour */
export async function fetchDestinations(): Promise<AdaptedDestination[]> {
  const result = await fetchTourPageData();
  return result.destinations;
}

/** Obtiene tours + banner para la página de Tours. Soporta backend con atributos "info"+"imageBanner" o "Tours"+"Banner". */
export async function fetchTourPageData(): Promise<{
  destinations: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const urls = [
      "/api/tour?populate[0]=Tours&populate[1]=Tours.image&populate[2]=Banner",
      "/api/tour?populate[0]=info&populate[1]=info.image&populate[2]=imageBanner",
      "/api/tour?populate=*",
    ];
    let attributes: Record<string, unknown> = {};
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      attributes = data?.attributes ?? data ?? {};
      const items =
        (Array.isArray(attributes?.Tours) ? attributes.Tours : null) ??
        (Array.isArray(attributes?.info) ? attributes.info : null);
      if (Array.isArray(items) && items.length > 0) break;
    }
    const items: StrapiDestinationItem[] = Array.isArray(attributes?.Tours)
      ? attributes.Tours
      : Array.isArray(attributes?.info)
        ? attributes.info
        : [];
    const destinations = items.map(adaptStrapiDestination);

    const imageBanner = attributes?.Banner ?? attributes?.imageBanner;
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

/** Obtiene destinos internacionales + imageBanner para la página Internacional */
export async function fetchInternationalPageData(): Promise<{
  destinations: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const urls = [
      "/api/international?populate[0]=info&populate[1]=info.image&populate[2]=imageBanner",
      "/api/international?populate=*",
      "/api/internacional?populate[0]=info&populate[1]=info.image&populate[2]=imageBanner",
      "/api/internacional?populate=*",
    ];
    let attributes: Record<string, unknown> = {};
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      attributes = data?.attributes ?? data ?? {};
      const items = attributes?.info;
      if (Array.isArray(items) && items.length > 0) break;
    }
    const items: StrapiDestinationItem[] = Array.isArray(attributes?.info)
      ? attributes.info
      : [];
    const destinations = items.map(adaptStrapiDestination);

    const imageBanner = attributes?.imageBanner;
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

/** Obtiene las temporadas desde Strapi (sin filtrar por home). Usado por fetchSeasonsForHome y fetchSeasonsForPackagesPage. */
async function fetchRawSeasonsFromStrapi(): Promise<StrapiSeasonItem[]> {
  const urls = [
    "/api/package?populate[0]=Temporada&populate[1]=Temporada.image&populate[2]=Paquete&populate[3]=Paquete.image&populate[4]=Banner",
    "/api/package?populate[0]=season&populate[1]=season.image&populate[2]=package&populate[3]=package.image&populate[4]=imageBanner",
    "/api/package?populate[season][populate]=image",
    "/api/package?populate=*",
  ];
  let attributes: Record<string, unknown> = {};
  for (const url of urls) {
    const response = await fetchStrapi(url);
    if (response?.error) continue;
    const data = response?.data;
    attributes = data?.attributes ?? data ?? {};
    const seasons = Array.isArray(attributes?.Temporada)
      ? attributes.Temporada
      : Array.isArray(attributes?.season)
        ? attributes.season
        : [];
    if (seasons.length > 0) break;
  }
  return (Array.isArray(attributes?.Temporada)
    ? attributes.Temporada
    : Array.isArray(attributes?.season)
      ? attributes.season
      : []) as StrapiSeasonItem[];
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

/** Obtiene paquetes + banner para la página de Paquetes. Soporta "Paquete"+"Banner" o "package"+"imageBanner". */
export async function fetchPackagesPageData(): Promise<{
  packages: AdaptedDestination[];
  imageBannerUrl: string | null;
}> {
  try {
    const urls = [
      "/api/package?populate[0]=Paquete&populate[1]=Paquete.image&populate[2]=Banner",
      "/api/package?populate[0]=package&populate[1]=package.image&populate[2]=imageBanner",
      "/api/package?populate[package][populate]=image",
      "/api/package?populate=*",
    ];
    let attributes: Record<string, unknown> = {};
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      attributes = data?.attributes ?? data ?? {};
      const items = Array.isArray(attributes?.Paquete)
        ? attributes.Paquete
        : Array.isArray(attributes?.package)
          ? attributes.package
          : null;
      if (Array.isArray(items) && items.length > 0) break;
    }
    const items: StrapiPackageItem[] = Array.isArray(attributes?.Paquete)
      ? attributes.Paquete
      : Array.isArray(attributes?.package)
        ? attributes.package
        : [];
    const packages = items.map((p: StrapiPackageItem) =>
      adaptStrapiPackageItem(p),
    );

    const imageBanner = attributes?.Banner ?? attributes?.imageBanner;
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

/** Obtiene un paquete por slug desde Strapi. Soporta atributos "Paquete" o "package". */
export async function fetchPackageBySlug(
  slug: string,
): Promise<AdaptedPackageDetail | null> {
  try {
    const urls = [
      "/api/package?populate[0]=Paquete&populate[1]=Paquete.image&populate[2]=Paquete.imagesDetails&populate[3]=Paquete.itineraryItem&populate[4]=Paquete.mapItem",
      "/api/package?populate[package][populate][0]=image&populate[package][populate][1]=imagesDetails&populate[package][populate][2]=itineraryItem&populate[package][populate][3]=mapItem",
      "/api/package?populate[0]=Paquete&populate[1]=Paquete.image&populate[2]=Paquete.itineraryItem&populate[3]=Paquete.mapItem",
      "/api/package?populate[package][populate]=image",
      "/api/package?populate=*",
    ];
    let items: StrapiPackageItem[] = [];
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      const attributes = data?.attributes ?? data ?? {};
      items = Array.isArray(attributes?.Paquete)
        ? attributes.Paquete
        : Array.isArray(attributes?.package)
          ? attributes.package
          : [];
      if (items.length > 0) break;
    }
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

/** Obtiene los tours con home: true para mostrar en la página de inicio */
export async function fetchDestinationsForHome(): Promise<
  AdaptedDestination[]
> {
  try {
    const urls = [
      "/api/tour?populate[0]=Tours&populate[1]=Tours.image",
      "/api/tour?populate[0]=info&populate[1]=info.image",
      "/api/tour?populate=*",
    ];
    let items: StrapiDestinationItem[] = [];
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      const attributes = data?.attributes ?? data ?? {};
      items = Array.isArray(attributes?.Tours)
        ? attributes.Tours
        : Array.isArray(attributes?.info)
          ? attributes.info
          : [];
      if (items.length > 0) break;
    }
    const homeItems = items.filter((d) => d.home === true);
    return homeItems.map(adaptStrapiDestination);
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
        imagesDetails as {
          data?: Array<{ attributes?: { url?: string }; url?: string }>;
        }
      )?.data ?? []);
  return arr
    .map((img) => {
      const url =
        (img as { attributes?: { url?: string } })?.attributes?.url ??
        (img as { url?: string })?.url ??
        "";
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

/** Extrae URLs de un campo Multiple media de Strapi (gallery, images, etc.) */
function getMultipleMediaUrls(media: unknown): string[] {
  if (!media) return [];
  const arr = Array.isArray(media)
    ? media
    : ((
        media as {
          data?: Array<{ attributes?: { url?: string }; url?: string }>;
        }
      )?.data ?? []);
  return arr
    .map((img) => {
      const url =
        (img as { attributes?: { url?: string } })?.attributes?.url ??
        (img as { url?: string })?.url ??
        "";
      return buildFullImageUrl(url);
    })
    .filter(Boolean);
}

/** Grupo de galería desde Strapi (componente gallery.gallery: title + gallery) */
export interface GalleryGroup {
  title: string;
  images: string[];
}

/** Obtiene datos de la página Galería/Gallery desde Strapi (imageBanner + galleryGroup con título e imágenes) */
export async function fetchGalleryPageData(): Promise<{
  imageBannerUrl: string | null;
  galleryGroups: GalleryGroup[];
  /** @deprecated Use galleryGroups. Lista plana para compatibilidad (todas las imágenes de todos los grupos) */
  galleryImages: string[];
}> {
  try {
    const urls = [
      "/api/galeria?populate[0]=imageBanner&populate[1]=galleryGroup&populate[2]=galleryGroup.gallery",
      "/api/gallery?populate[0]=imageBanner&populate[1]=galleryGroup&populate[2]=galleryGroup.gallery",
      "/api/galeria?populate=*",
      "/api/gallery?populate=*",
    ];
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      const attributes = data?.attributes ?? data ?? {};
      const imageBanner = attributes?.imageBanner;
      const bannerUrl = getImageUrl(
        imageBanner as StrapiDestinationItem["image"],
      );

      const rawGroups = attributes?.galleryGroup ?? [];
      const groupsArr = Array.isArray(rawGroups) ? rawGroups : [rawGroups];
      const galleryGroups: GalleryGroup[] = groupsArr
        .filter((g: unknown) => g && typeof g === "object")
        .map((g: { title?: string; gallery?: unknown }) => ({
          title: g.title ?? "Galería",
          images: getMultipleMediaUrls(g.gallery),
        }))
        .filter((g) => g.images.length > 0);

      const galleryImages = galleryGroups.flatMap((g) => g.images);

      return {
        imageBannerUrl: bannerUrl ? buildFullImageUrl(bannerUrl) : null,
        galleryGroups,
        galleryImages,
      };
    }
    return { imageBannerUrl: null, galleryGroups: [], galleryImages: [] };
  } catch (error) {
    console.error("Error fetching gallery from Strapi:", error);
    return { imageBannerUrl: null, galleryGroups: [], galleryImages: [] };
  }
}

/** Tipo para datos de la página About (single type) */
export interface AboutPageData {
  /** Atributos crudos de Strapi para flexibilidad */
  attributes: Record<string, unknown>;
  /** Imagen de banner/hero si existe */
  imageBannerUrl: string | null;
  /** Título principal */
  title?: string;
  /** Subtítulo */
  subtitle?: string;
  /** Descripción/lead */
  description?: string;
  /** Contenido rich text si existe */
  content?: unknown;
  /** Features/items con icono, título, descripción */
  features?: Array<{ icon?: string; title?: string; description?: string }>;
  /** Sección "Who We Are" */
  whoWeAre?: {
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string | null;
  };
  /** Galería de imágenes (What We section) */
  galleryImages?: string[];
  /** CTA final */
  cta?: { title?: string; buttonText?: string; buttonLink?: string };
}

/** Extrae URL de imagen desde cualquier estructura común de Strapi (media) */
function getMediaUrl(media: unknown): string {
  if (!media) return "";
  if (typeof media === "string") return media;
  const m = media as Record<string, unknown>;
  // Strapi v4: data.attributes.url
  const v4 = (m?.data as Record<string, unknown>)?.attributes as
    | Record<string, unknown>
    | undefined;
  if (v4?.url && typeof v4.url === "string") return v4.url;
  // Strapi v4/v5: data.url
  const dataUrl = (m?.data as Record<string, unknown>)?.url;
  if (typeof dataUrl === "string") return dataUrl;
  // Direct url
  if (typeof m?.url === "string") return m.url;
  return "";
}

/** Obtiene datos de la página About (single type) desde Strapi */
export async function fetchAboutPageData(): Promise<AboutPageData> {
  const empty: AboutPageData = {
    attributes: {},
    imageBannerUrl: null,
  };
  try {
    const urls = [
      "/api/about?populate[imageAbout][fields][0]=url&populate[imageBannerAbout][fields][0]=url&populate[imageAboutGallery][fields][0]=url&populate[features][populate]=*",
      "/api/about?populate[imageAbout]=*&populate[imageBannerAbout]=*&populate[imageAboutGallery]=*",
      "/api/about?populate=*",
    ];
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      const attrs = (data?.attributes ?? data ?? {}) as Record<string, unknown>;

      const imageBannerAbout = attrs?.imageBannerAbout ?? attrs?.imageBanner;
      const bannerUrl =
        getMediaUrl(imageBannerAbout) ||
        getImageUrl(imageBannerAbout as StrapiDestinationItem["image"]);
      const imageBannerUrl = bannerUrl ? buildFullImageUrl(bannerUrl) : null;

      const features = Array.isArray(attrs?.features)
        ? (attrs.features as Array<Record<string, unknown>>).map((f) => ({
            icon: String(f?.icon ?? f?.flaticon ?? ""),
            title: String(f?.title ?? f?.name ?? ""),
            description: String(f?.description ?? f?.text ?? ""),
          }))
        : undefined;

      const imageAbout = attrs?.imageAbout ?? attrs?.whoWeAreImage;
      const rawWhoWeUrl =
        getMediaUrl(imageAbout) ||
        getImageUrl(imageAbout as StrapiDestinationItem["image"]);
      const whoWeImgUrl = rawWhoWeUrl ? buildFullImageUrl(rawWhoWeUrl) : null;

      const imageAboutGallery = attrs?.imageAboutGallery;
      const galleryImages = getMultipleMediaUrls(imageAboutGallery);

      const whoWe = attrs?.whoWeAre as Record<string, unknown> | undefined;
      return {
        attributes: attrs,
        imageBannerUrl,
        galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
        title: attrs?.title ? String(attrs.title) : undefined,
        subtitle:
          (attrs?.subtitle ?? attrs?.subTitle)
            ? String(attrs.subtitle ?? attrs.subTitle)
            : undefined,
        description: attrs?.description ? String(attrs.description) : undefined,
        content: attrs?.content,
        features,
        whoWeAre: whoWe
          ? {
              title: whoWe.title ? String(whoWe.title) : undefined,
              subtitle:
                (whoWe.subtitle ?? whoWe.subTitle)
                  ? String(whoWe.subtitle ?? whoWe.subTitle)
                  : undefined,
              description: whoWe.description
                ? String(whoWe.description)
                : undefined,
              imageUrl: whoWeImgUrl,
            }
          : attrs?.imageAbout || attrs?.whoWeAreImage || attrs?.whoWeAre
            ? { imageUrl: whoWeImgUrl }
            : undefined,
        cta:
          attrs?.ctaTitle || attrs?.ctaButtonText
            ? {
                title: attrs.ctaTitle ? String(attrs.ctaTitle) : undefined,
                buttonText: attrs.ctaButtonText
                  ? String(attrs.ctaButtonText)
                  : undefined,
                buttonLink: attrs.ctaButtonLink
                  ? String(attrs.ctaButtonLink)
                  : undefined,
              }
            : undefined,
      };
    }
    return empty;
  } catch (error) {
    console.error("Error fetching about from Strapi:", error);
    return empty;
  }
}

/** Obtiene un tour por slug desde Strapi. Soporta atributos "info" o "Tours". */
export async function fetchTourBySlug(
  slug: string,
): Promise<AdaptedDestinationDetail | null> {
  try {
    const urls = [
      "/api/tour?populate[0]=Tours&populate[1]=Tours.image&populate[2]=Tours.imagesDetails&populate[3]=Tours.itineraryItem&populate[4]=Tours.mapItem",
      "/api/tour?populate[0]=info&populate[1]=info.image&populate[2]=info.imagesDetails&populate[3]=info.itineraryItem&populate[4]=info.mapItem",
      "/api/tour?populate=*",
    ];
    let items: StrapiDestinationItem[] = [];
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      const attributes = data?.attributes ?? data ?? {};
      items = Array.isArray(attributes?.Tours)
        ? attributes.Tours
        : Array.isArray(attributes?.info)
          ? attributes.info
          : [];
      if (items.length > 0) break;
    }

    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
    const item = items.find((d) => {
      const itemSlug = getSlugFromLink(d.link);
      const titleSlug = d.title ? slugify(d.title) : "";
      return (
        itemSlug.toLowerCase() === normalizedSlug ||
        itemSlug.toLowerCase().replace(/\s+/g, "-") === normalizedSlug ||
        titleSlug === normalizedSlug
      );
    });

    if (item) return adaptToDestinationDetail(item);
    return null;
  } catch (error) {
    console.error("Error fetching tour by slug from Strapi:", error);
    return null;
  }
}

/** @deprecated Usar fetchTourBySlug */
export const fetchDestinationBySlug = fetchTourBySlug;

/** Obtiene un destino internacional por slug desde Strapi */
export async function fetchInternationalBySlug(
  slug: string,
): Promise<AdaptedInternationalDetail | null> {
  try {
    const urls = [
      "/api/international?populate[0]=info&populate[1]=info.image&populate[2]=info.imagesDetails&populate[3]=info.includes",
      "/api/international?populate=*",
      "/api/internacional?populate=*",
    ];
    let items: StrapiDestinationItem[] = [];
    for (const url of urls) {
      const response = await fetchStrapi(url);
      if (response?.error) continue;
      const data = response?.data;
      const attributes = data?.attributes ?? data ?? {};
      const list = attributes?.info;
      if (Array.isArray(list) && list.length > 0) {
        items = list;
        break;
      }
    }
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
