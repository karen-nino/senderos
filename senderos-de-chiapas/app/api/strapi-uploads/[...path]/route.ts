import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  if (!path?.length) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }
  const pathStr = path.join("/");
  const base = STRAPI_URL.replace(/\/$/, "");
  const url = `${base}/uploads/${pathStr}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Image not found", status: res.status },
        { status: res.status }
      );
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const blob = await res.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    console.error("[strapi-uploads]", url, e);
    return NextResponse.json(
      { error: "Proxy error", details: String(e) },
      { status: 502 }
    );
  }
}
