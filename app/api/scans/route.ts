import { after } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnonymousId, getSessionUserId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { monthlyScanLimit } from "@/lib/plans";
import { executeScan } from "@/lib/scans/run";
import { countScansThisMonth, createScan, updateScan } from "@/lib/store";
import { assertPublicHttpUrl } from "@/lib/ssrf";

const bodySchema = z.object({
  url: z.string().min(4),
  authorized: z.literal(true),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);
    const url = await assertPublicHttpUrl(body.url);
    const userId = (await getSessionUserId()) || undefined;
    const anonymousId = await getAnonymousId();
    const plan = await planForUser(userId);
    const used = await countScansThisMonth({ userId, anonymousId });
    if (used >= monthlyScanLimit(plan)) {
      return NextResponse.json(
        {
          error:
            plan === "pro"
              ? "Monthly Pro scan quota reached."
              : "Free monthly scan quota reached. Sign in and Go Pro to retest and run more checks.",
        },
        { status: 402 },
      );
    }
    const scan = await createScan({
      url: url.toString(),
      authorized: true,
      plan,
      userId,
      anonymousId,
    });
    const run = async () => {
      try {
        await executeScan(scan.id, scan.url, plan);
      } catch (error) {
        await updateScan(scan.id, {
          status: "failed",
          error: error instanceof Error ? error.message : "Scan failed",
          progress: { percent: 100, step: "failed", message: "Scan failed." },
        });
      }
    };
    if (process.env.VERCEL) after(run);
    else void run();
    return NextResponse.json({ id: scan.id, status: scan.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start scan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
