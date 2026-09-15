import { after } from "next/server";
import { NextResponse } from "next/server";
import { getAnonymousId, getSessionUserId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { executeScan } from "@/lib/scans/run";
import { createScan, getScan, updateScan } from "@/lib/store";

export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getScan(id);
  if (!existing) return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  const userId = await getSessionUserId();
  const plan = await planForUser(userId);
  if (plan !== "pro") {
    return NextResponse.json({ error: "Retest is an AppHole Pro feature." }, { status: 402 });
  }
  const anonymousId = await getAnonymousId();
  const scan = await createScan({
    url: existing.url,
    authorized: true,
    plan,
    userId: userId || undefined,
    anonymousId,
    parentScanId: existing.id,
  });
  const run = async () => {
    try {
      await executeScan(scan.id, scan.url, plan);
    } catch (error) {
      await updateScan(scan.id, {
        status: "failed",
        error: error instanceof Error ? error.message : "Retest failed",
        progress: { percent: 100, step: "failed", message: "Retest failed." },
      });
    }
  };
  if (process.env.VERCEL) after(run);
  else void run();
  return NextResponse.json({ id: scan.id });
}
