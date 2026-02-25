import { fetchTourPageData, fetchStrapi } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOURS_POPULATE = "populate=*";

export async function GET() {
  try {
    const baseUrl =
      process.env.STRAPI_URL ||
      process.env.NEXT_PUBLIC_STRAPI_URL ||
      "http://localhost:1337";

    const response = await fetchStrapi(
      `/api/tours?${TOURS_POPULATE}`,
      { useToken: false }
    );

    const rawData = response?.data;
    const responseKeys = response ? Object.keys(response) : [];
    const isArray = Array.isArray(rawData);
    const count = isArray ? (rawData as unknown[]).length : 0;
    const firstItem = isArray && count > 0 ? (rawData as unknown[])[0] : null;
    const firstItemKeys =
      firstItem && typeof firstItem === "object"
        ? Object.keys(firstItem as object)
        : [];

    const err = response?.error as { status?: number; message?: string } | undefined;
    let fixHint: string | null = null;
    if (err?.status === 403 || err?.status === 401) {
      fixHint =
        "En Strapi → Settings → Users & Permissions → Roles → Public → Tour → marcar 'find' y 'findOne'.";
    } else if (!response?.error && count === 0) {
      fixHint =
        "No hay tours en la respuesta. Revisa: 1) Tour publicado (no borrador), 2) Permisos Public → Tour → find.";
    }

    const pageData = await fetchTourPageData();
    const adaptedCount = pageData.destinations.length;
    const adaptedAfterBadgeFilter = pageData.destinations.filter(
      (d) => (d.badge || "").toLowerCase() !== "hide"
    );

    // Debug banner: populate=imageBanner (sin =* para evitar "Invalid key related at imageBanner.related")
    const toursPageResPlural = await fetchStrapi(
      "/api/tours-pages?populate=imageBanner&status=published",
      { useToken: false }
    ).catch(() => null);
    const toursPageResSingular = await fetchStrapi(
      "/api/tours-page?populate=imageBanner&status=published",
      { useToken: false }
    ).catch(() => null);
    const toursPageRaw =
      toursPageResSingular?.data ??
      toursPageResPlural?.data ??
      toursPageResSingular?.error ??
      toursPageResPlural?.error ??
      null;

    return NextResponse.json(
      {
        baseUrl,
        toursUrl: `${baseUrl}/api/tours?${TOURS_POPULATE}`,
        responseKeys,
        hasError: !!response?.error,
        error: response?.error ?? null,
        dataIsArray: isArray,
        count,
        firstItemKeys,
        firstItem: firstItem,
        adaptedCount,
        adaptedAfterBadgeFilter: adaptedAfterBadgeFilter.length,
        adaptedFirst: adaptedAfterBadgeFilter[0] ?? null,
        imageBannerUrl: pageData.imageBannerUrl,
        toursPageRaw,
        toursPageSingularError: toursPageResSingular?.error ?? null,
        toursPagePluralError: toursPageResPlural?.error ?? null,
        rawData,
        fixHint,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Error debugging tours from Strapi" },
      { status: 500 }
    );
  }
}
