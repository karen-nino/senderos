import { fetchFaqPageData, fetchStrapi } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const baseUrl =
      process.env.STRAPI_URL ||
      process.env.NEXT_PUBLIC_STRAPI_URL ||
      "http://localhost:1337";

    const resFaq = await fetchStrapi("/api/faq?populate=*", { useToken: false }).catch(
      (e) => ({ error: String(e) })
    );
    const items = await fetchFaqPageData();

    return NextResponse.json({
      baseUrl,
      faqUrl: `${baseUrl}/api/faq?populate=*`,
      parsedItemsCount: items.length,
      parsedItems: items.length > 0 ? items : null,
      rawResponse: resFaq?.data ?? resFaq?.error ?? resFaq,
      hint:
        items.length === 0
          ? "Comprueba: 1) FAQ publicado en Strapi Admin, 2) Permisos Public → Faq → find, 3) Que el single type tenga ítems en el componente 'faq'."
          : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
