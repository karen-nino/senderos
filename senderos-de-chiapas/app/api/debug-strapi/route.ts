import { fetchStrapi } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url =
      "/api/tour?populate[0]=info&populate[1]=info.image&populate[2]=imageBanner";
    const response = await fetchStrapi(url);
    const doc = response?.data ?? {};
    const tours = Array.isArray((doc as Record<string, unknown>).Tours)
      ? (doc as Record<string, unknown>).Tours
      : [];
    return NextResponse.json(
      {
        raw: response,
        hasData: !!response?.data,
        hasTours: Array.isArray(tours),
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
