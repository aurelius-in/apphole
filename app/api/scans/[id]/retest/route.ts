import { after } from "next/server";
import { NextResponse } from "next/server";
import { getAnonymousId, getSessionUserId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { executeScan } from "@/lib/scans/run";
import { createScan, getScan, updateScan } from "@/lib/store";

export const maxDuration = 60;

function ownsScan(scan: { userId?: string; anonymousId: string }, userId: string | null, anonymousId: string) {
  if (userId && scan.userId && scan.userId === userId) return true;
  if (scan.anonymousId && scan.anonymousId === anonymousId) return true;
  return false;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (rateLimited(`retest:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many retests from this network. Try again later." }, { status: 429 });
  }
  const { id } = await params;
  const existing = await getScan(id);
  if (!existing) return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  const userId = await getSessionUserId();
  const anonymousId = await getAnonymousId();
  if (!ownsScan(existing, userId, anonymousId)) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }
  const plan = await planForUser(userId);
  if (plan !== "pro") {
    return NextResponse.json({ error: "Retest is an AppHole Pro feature." }, { status: 402 });
  }
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
    } catch {
      await updateScan(scan.id, {
        status: "failed",
        error: "The scan stopped before a report could be produced.",
        progress: { percent: 100, step: "failed", message: "Retest failed." },
      });
    }
  };
  if (process.env.VERCEL) after(run);
  else void run();
  return NextResponse.json({ id: scan.id });
}
