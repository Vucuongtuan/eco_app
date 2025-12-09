import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function getRevalidateType(slug: string): "page" | "layout" | undefined {
  if (slug === "/") return "layout";
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    if (
      req.headers.get("authorization") !==
      `Bearer ${process.env.REVALIDATE_SECRET}`
    )
      throw new Error("You are unauthorized to perform this action");

    const { paths = [], tags = [] } = await req
      .json()
      .catch(() => ({ paths: [], tags: [] }));

    for (const p of paths) revalidatePath(p, getRevalidateType(p));
    for (const t of tags) revalidateTag(t);

    // Always revalidate sitemap
    revalidatePath("/sitemap.xml", "layout");

    return NextResponse.json({
      message: "Revalidation successful",
      paths,
      tags,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: (error as Error).message,
        },
      },
      { status: 401 },
    );
  }
}