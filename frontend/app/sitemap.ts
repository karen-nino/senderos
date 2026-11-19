import type { MetadataRoute } from "next";
import {
  fetchDestinations,
  fetchPackages,
  getTourDetailHref,
} from "@/lib/strapi";
import { LANGS, localizePath, type Lang } from "@/lib/i18n";

const SITE_URL = "https://senderosdechiapas.com.mx";

/** Rutas estáticas con su URL pública en español; la versión en inglés sale de localizePath */
const STATIC_ROUTES_ES: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${SITE_URL}/nosotros`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/contacto`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/preguntas-frecuentes`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/politica-de-privacidad`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    url: `${SITE_URL}/paquetes`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/experiencias`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${SITE_URL}/internacional`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${SITE_URL}/tours`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
];

/** Cada página estática en los dos idiomas, enlazadas entre sí con hreflang. */
const STATIC_ROUTES: MetadataRoute.Sitemap = STATIC_ROUTES_ES.flatMap((route) => {
  const esPath = route.url.slice(SITE_URL.length) || "/";
  const languages = Object.fromEntries(
    LANGS.map((lang) => [lang, `${SITE_URL}${localizePath(lang, esPath)}`.replace(/\/$/, "")]),
  );
  return LANGS.map((lang) => ({
    ...route,
    url: languages[lang],
    alternates: { languages },
  }));
});

/** Tours y paquetes de un idioma (en inglés, con los títulos traducidos si ya existen en Strapi). */
async function detailUrls(lang: Lang): Promise<MetadataRoute.Sitemap> {
  let tourUrls: MetadataRoute.Sitemap = [];
  let packageUrls: MetadataRoute.Sitemap = [];

  try {
    const [destinations, packages] = await Promise.all([
      fetchDestinations(lang),
      fetchPackages(lang),
    ]);

    const tourSlugs = destinations
      .filter((d) => (d.badge || "") !== "oculto")
      .map((d) => getTourDetailHref(d))
      .filter((href) => href !== "/tours");
    tourUrls = tourSlugs.map((path) => ({
      url: `${SITE_URL}${localizePath(lang, path)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    packageUrls = packages
      .filter((p) => (p.badge || "") !== "oculto")
      .map((p) => p.link ?? (p.slug ? `/paquete-detalles/${p.slug}` : null))
      .filter((path): path is string => path != null && path !== "")
      .map((path) => ({
        url: `${SITE_URL}${localizePath(lang, path)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error("Error building sitemap (tours/packages):", error);
  }

  return [...tourUrls, ...packageUrls];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const details = await Promise.all(LANGS.map(detailUrls));
  return [...STATIC_ROUTES, ...details.flat()];
}
