import { NextResponse } from "next/server";
import { clientIp, normalizePlugFindings, notifyPlugLead, plugQuoteRateLimited, plugQuoteSchema } from "@/lib/leads";
import { createPlugLead, updatePlugLead } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (plugQuoteRateLimited(ip)) {
      return NextResponse.json({ error: "Please wait before sending another quote request." }, { status: 429 });
    }

    const json = await req.json();
    const parsed = plugQuoteSchema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Check the form and try again.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const body = parsed.data;
    if (body.website && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const findings = normalizePlugFindings(body);
    const lead = await createPlugLead({
      email: body.email.toLowerCase(),
      description: body.description,
      findings: findings.length ? findings : undefined,
      findingId: findings[0]?.id,
      findingTitle: findings[0]?.title || undefined,
      scanId: body.scanId || undefined,
      scanUrl: body.scanUrl || undefined,
      source: body.source,
    });

    const notify = await notifyPlugLead(lead);
    if (notify.attempted && notify.ok) {
      await updatePlugLead(lead.id, { notifiedAt: new Date().toISOString() });
    } else if (notify.error) {
      await updatePlugLead(lead.id, { notifyError: notify.error.slice(0, 300) });
    }

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the quote request.";
    const userFacing = /valid email|plugged|4000|quote request/i.test(message);
    return NextResponse.json({ error: userFacing ? message : "Could not save the quote request." }, { status: 400 });
  }
}
