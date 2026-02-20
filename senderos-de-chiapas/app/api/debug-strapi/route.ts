import { fetchStrapi } from "@/lib/strapi";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url =
      "/api/tour?populate[0]=info&populate[1]=info.image&populate[2]=imageBanner";
    const response = await fetchStrapi(url);
    return NextResponse.json(
      {
        raw: response,
        hasData: !!response?.data,
        hasInfo: !!response?.data?.info || !!response?.data?.attributes?.info,
        infoLength: Array.isArray(response?.data?.info)
          ? response.data.info.length
          : Array.isArray(response?.data?.attributes?.info)
            ? response.data.attributes.info.length
            : 0,
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
