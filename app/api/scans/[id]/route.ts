import { NextResponse } from "next/server";
import { getScan, toPublicScan } from "@/lib/store";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || id.length > 80) return json({ error: "Scan not found." }, 404);
    const scan = await getScan(id);
    if (!scan) return json({ error: "Scan not found." }, 404);
    return json(toPublicScan(scan));
  } catch (error) {
    console.error("[apphole] get scan failed", error);
    return json({ error: "Could not load scan." }, 500);
  }
}
