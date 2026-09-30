import { after } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnonymousId, getSessionUserId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { monthlyScanLimit } from "@/lib/plans";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { attachIntake, recordIntake } from "@/lib/intakes";
import { executeScan } from "@/lib/scans/run";
import { countScansThisMonth, createScan, updateScan } from "@/lib/store";
import { assertPublicHttpUrl } from "@/lib/ssrf";
import { classifySubmission } from "@/lib/submission";

const bodySchema = z.object({
  url: z.string().min(4),
  authorized: z.literal(true),
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    if (rateLimited(`scan:${clientIp(req)}`, 20, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many checks from this network. Try again later." }, { status: 429 });
    }
    const json = await req.json();
    const rawUrl = typeof json?.url === "string" ? json.url : "";
    const classified = classifySubmission(rawUrl);
    const userId = (await getSessionUserId()) || undefined;
    const anonymousId = await getAnonymousId();
    const intake = await recordIntake({
      raw: classified.raw,
      normalized: classified.normalized,
      host: classified.host,
      kind: classified.kind,
      realistic: classified.realistic,
      note: classified.note,
      outcome: "rejected",
      anonymousId,
      userId,
    });
    const body = bodySchema.parse({ url: classified.normalized || rawUrl, authorized: json?.authorized });
    const url = classified.github ? new URL(classified.github.url) : await assertPublicHttpUrl(body.url);
    const plan = await planForUser(userId);
    const used = await countScansThisMonth({ userId, anonymousId });
    if (used >= monthlyScanLimit(plan)) {
      await attachIntake(intake.id, { rejectReason: "quota" });
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
    await attachIntake(intake.id, { scanId: scan.id, outcome: "started" });
    const run = async () => {
      try {
        await executeScan(scan.id, scan.url, plan);
      } catch {
        await updateScan(scan.id, {
          status: "failed",
          error: "The scan stopped before a report could be produced.",
          progress: { percent: 100, step: "failed", message: "Scan failed." },
        });
      }
    };
    if (process.env.VERCEL) after(run);
    else void run();
    return NextResponse.json({ id: scan.id, status: scan.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid URL and confirm you are authorized to test it." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Could not start scan.";
    const userFacing =
      /valid URL|http and https|not allowed|Private or local|Could not resolve|quota|Production storage is not configured|authorized/i.test(
        message,
      );
    return NextResponse.json({ error: userFacing ? message : "Could not start the check." }, { status: 400 });
  }
}
