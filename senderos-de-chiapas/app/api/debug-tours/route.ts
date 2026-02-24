import { fetchStrapi } from "@/lib/strapi";
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
        "No hay tours en la respuesta. Crea un tour en Strapi y publícalo (no en borrador).";
    }

    return NextResponse.json(
      {
        baseUrl,
        toursUrl: `${baseUrl}/api/tours?${TOURS_POPULATE}`,
        hasError: !!response?.error,
        error: response?.error ?? null,
        dataIsArray: isArray,
        count,
        firstItemKeys,
        firstItem: firstItem,
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
