import { fetchStrapi } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Solo para desarrollo: en producción no debe exponer la URL de Strapi ni respuestas crudas
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });

  try {
    const url = "/api/tour";
    const response = await fetchStrapi(url);
    const doc = (response?.data ?? {}) as Record<string, unknown>;
    const rawTours = doc.Tours;
    const tours: unknown[] = Array.isArray(rawTours) ? rawTours : [];
    return NextResponse.json(
      {
        raw: response,
        hasData: !!response?.data,
        hasTours: tours.length > 0,
        toursLength: tours.length,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: String(error), message: "Error fetching from Strapi" },
      { status: 500 }
    );
  }
}
