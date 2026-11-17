import type { MetadataRoute } from "next";
import {
  fetchDestinations,
  fetchPackages,
  getTourDetailHref,
} from "@/lib/strapi";

const SITE_URL = "https://senderosdechiapas.com.mx";

/** Rutas estáticas con URLs públicas (español) según rewrites del proyecto */
const STATIC_ROUTES: MetadataRoute.Sitemap = [
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let tourUrls: MetadataRoute.Sitemap = [];
  let packageUrls: MetadataRoute.Sitemap = [];

  try {
    const [destinations, packages] = await Promise.all([
      fetchDestinations(),
      fetchPackages(),
    ]);

    const tourSlugs = destinations
      .filter((d) => (d.badge || "") !== "oculto")
      .map((d) => getTourDetailHref(d))
      .filter((href) => href !== "/tours");
    tourUrls = tourSlugs.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    packageUrls = packages
      .filter((p) => (p.badge || "") !== "oculto")
      .map((p) => p.link ?? (p.slug ? `/paquete-detalles/${p.slug}` : null))
      .filter((path): path is string => path != null && path !== "")
      .map((path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error("Error building sitemap (tours/packages):", error);
  }

  return [...STATIC_ROUTES, ...tourUrls, ...packageUrls];
}
