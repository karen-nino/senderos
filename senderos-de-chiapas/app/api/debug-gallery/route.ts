import { fetchGalleryPageData, fetchStrapi } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const baseUrl =
      process.env.STRAPI_URL ||
      process.env.NEXT_PUBLIC_STRAPI_URL ||
      "http://localhost:1337";

    // Probar variantes de populate (populate[galleryGroup][populate]=gallery da 500)
    const resGalleryNested = await fetchStrapi(
      "/api/gallery?populate=imageBanner&populate[galleryGroup][populate][gallery]=true&status=published",
      { useToken: false }
    ).catch(() => null);
    const resGallerySimple = await fetchStrapi(
      "/api/gallery?populate=imageBanner&populate=galleryGroup&status=published",
      { useToken: false }
    ).catch(() => null);

    const pageData = await fetchGalleryPageData();

    // Resumen del primer grupo para ver estructura (sin volcar todas las URLs)
    const firstGroup = pageData.galleryGroups[0];
    const firstGroupSummary = firstGroup
      ? {
          title: firstGroup.title,
          imageCount: firstGroup.images.length,
          firstImageUrl: firstGroup.images[0] ?? null,
        }
      : null;

    return NextResponse.json(
      {
        baseUrl,
        galleryUrlNested: `${baseUrl}/api/gallery?populate=imageBanner&populate[galleryGroup][populate][gallery]=true&status=published`,
        pageData: {
          imageBannerUrl: pageData.imageBannerUrl,
          galleryGroupsCount: pageData.galleryGroups.length,
          galleryImagesCount: pageData.galleryImages.length,
          firstGroupSummary,
        },
        rawGalleryNested: resGalleryNested?.data ?? resGalleryNested?.error ?? null,
        rawGalleryNestedError: resGalleryNested?.error ?? null,
        rawGallerySimple: resGallerySimple?.data ?? resGallerySimple?.error ?? null,
        rawGallerySimpleError: resGallerySimple?.error ?? null,
        fixHint:
          !pageData.imageBannerUrl && pageData.galleryGroups.length === 0
            ? "Revisa: 1) Experiencias publicado en Strapi, 2) Public → Gallery (find), 3) Public → Upload (find) para que vengan las URLs de las imágenes."
            : null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: String(error),
        message: "Error debugging gallery from Strapi",
      },
      { status: 500 }
    );
  }
}
