import { NextResponse } from "next/server";
import { activityGate } from "@/lib/activity-gate";
import { loadActivity } from "@/lib/activity-log";
import { buildActivityStats, dailyKpis, parseActivityRange } from "@/lib/activity-stats";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gate = activityGate(url.searchParams.get("key") ?? undefined);
  if (!gate.ok) {
    const status = gate.reason === "unconfigured" ? 503 : 401;
    return NextResponse.json({ error: gate.reason }, { status });
  }
  const range = parseActivityRange(url.searchParams.get("range"));
  const stats = buildActivityStats(await loadActivity(), range);
  return NextResponse.json({
    product: "AppHole",
    range: stats.rangeLabel,
    kpis: dailyKpis(stats),
    activityPath: "/ops/activity",
  });
}
