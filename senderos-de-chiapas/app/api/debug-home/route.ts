import { fetchHome, fetchHomeHeroSlides, fetchStrapi, parseHomeHeroSlides, STRAPI_HOME_URL } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const baseUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

    const response = await fetchHome();
    const home = (response?.data ?? {}) as Record<string, unknown>;
    const heroSlidesParsed = parseHomeHeroSlides(home);
    const heroSlidesResolved = await fetchHomeHeroSlides(home);
    const rawSlides = Array.isArray(home?.heroSlides) ? home.heroSlides : [];
    const firstSlide = rawSlides[0] as Record<string, unknown> | undefined;
    const firstSlideKeys = firstSlide ? Object.keys(firstSlide) : [];
    const firstSlideImage = firstSlide?.image;

    const tryHome = await fetchStrapi("/api/home?populate=*&status=published", { useToken: false });
    const tryHomes = await fetchStrapi("/api/homes?populate=*&status=published", { useToken: false });

    const tryHomeStatus = (tryHome?.error as { status?: number } | undefined)?.status;
    let fixHint: string | null = null;
    if (tryHomeStatus === 401) {
      fixHint = "401: En Strapi → Settings → Users & Permissions → Roles → Public → Home → marcar 'find'.";
    } else if (firstSlide && firstSlideKeys.length > 0) {
      const hasImageField = "image" in firstSlide;
      const imageVal = firstSlide.image;
      if (!hasImageField || imageVal == null) {
        fixHint = "Los slides no traen 'image'. En Strapi → Settings → Users & Permissions → Roles → Public → activa 'find' en 'Upload' (plugin) para que se devuelva la media o su id. Así el front puede pedir /api/upload/files/:id.";
      } else if (typeof imageVal === "number" || (typeof imageVal === "object" && "id" in (imageVal as object))) {
        fixHint = "El slide trae image como id. El front debería resolver la URL con /api/upload/files/:id. Revisa que Public tenga 'find' en Upload.";
      }
    }

    return NextResponse.json(
      {
        baseUrl,
        whichWorked: response?.data ? "fetchHome() returned data" : "no data",
        homeUrlTried: STRAPI_HOME_URL,
        hasData: !!response?.data,
        keysInData: response?.data ? Object.keys(response.data as object) : [],
        heroSlidesRaw: home?.heroSlides,
        firstSlideKeys,
        firstSlideImage,
        heroSlidesRawType: Array.isArray(home?.heroSlides) ? "array" : typeof home?.heroSlides,
        heroSlidesParsedLength: heroSlidesParsed.length,
        heroSlidesParsed: heroSlidesParsed,
        heroSlidesResolvedLength: heroSlidesResolved.length,
        heroSlidesResolved: heroSlidesResolved,
        tryApiHome: {
          hasData: !!tryHome?.data,
          error: tryHome?.error ?? null,
        },
        tryApiHomes: {
          hasData: !!tryHomes?.data,
          error: tryHomes?.error ?? null,
        },
        rawDataSample: response?.data
          ? {
              documentId: (response.data as Record<string, unknown>)?.documentId,
              heroSlides: (response.data as Record<string, unknown>)?.heroSlides,
            }
          : null,
        fixHint,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Error debugging home from Strapi" },
      { status: 500 }
    );
  }
}
