import { NextResponse } from "next/server";
import { appendActivity } from "@/lib/activity-log";
import { clientIp, rateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (rateLimited(`activity:${clientIp(req)}`, 120, 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const saved = await appendActivity(body).catch(() => false);
  return NextResponse.json({ ok: saved });
}
