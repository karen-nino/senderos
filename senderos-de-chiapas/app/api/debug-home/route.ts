import { fetchStrapi, STRAPI_HOME_URL, parseHomeHeroSlides } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const baseUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

    const [responseCurrent, responseStar] = await Promise.all([
      fetchStrapi(STRAPI_HOME_URL),
      fetchStrapi("/api/homes?populate=*"),
    ]);

    const home = (responseCurrent?.data ?? {}) as Record<string, unknown>;
    const homeStar = (responseStar?.data ?? {}) as Record<string, unknown>;
    const heroSlidesParsed = parseHomeHeroSlides(home);
    const heroSlidesFromStar = parseHomeHeroSlides(homeStar);

    return NextResponse.json(
      {
        baseUrl,
        currentUrl: STRAPI_HOME_URL,
        hasData: !!responseCurrent?.data,
        hasError: !!responseCurrent?.error,
        keysInData: responseCurrent?.data ? Object.keys(responseCurrent.data as object) : [],
        heroSlidesRaw: home?.heroSlides,
        heroSlidesRawType: Array.isArray(home?.heroSlides) ? "array" : typeof home?.heroSlides,
        heroSlidesParsedLength: heroSlidesParsed.length,
        heroSlidesParsed: heroSlidesParsed,
        withPopulateStar: {
          keysInData: responseStar?.data ? Object.keys(responseStar.data as object) : [],
          heroSlidesRaw: homeStar?.heroSlides,
          heroSlidesParsedLength: heroSlidesFromStar.length,
          heroSlidesParsed: heroSlidesFromStar,
        },
        rawDataSample: responseCurrent?.data
          ? {
              documentId: (responseCurrent.data as Record<string, unknown>)?.documentId,
              heroSlides: (responseCurrent.data as Record<string, unknown>)?.heroSlides,
            }
          : null,
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
