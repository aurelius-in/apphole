import { z } from "zod";
import type { PlugLead, PlugLeadFinding } from "@/lib/scans/types";
import { clientIp, rateLimited } from "@/lib/rate-limit";

export { clientIp };

const plugFindingSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: z.string().trim().max(200).optional().default(""),
});

export const plugQuoteSchema = z.object({
  email: z.string().trim().email("Enter a valid email.").max(200),
  description: z
    .string()
    .trim()
    .min(10, "Describe the hole you want plugged (at least a sentence).")
    .max(4000, "Keep the description under 4000 characters."),
  findings: z.array(plugFindingSchema).max(40).optional(),
  findingId: z.string().trim().max(80).optional(),
  findingTitle: z.string().trim().max(200).optional(),
  scanId: z.string().trim().max(80).optional(),
  scanUrl: z.string().trim().max(500).optional(),
  source: z.enum(["report", "example", "pricing"]),
  website: z.string().max(200).optional(),
});

export type PlugQuoteInput = z.infer<typeof plugQuoteSchema>;

export function normalizePlugFindings(input: {
  findings?: { id: string; title?: string }[];
  findingId?: string;
  findingTitle?: string;
}): PlugLeadFinding[] {
  const fromArray: PlugLeadFinding[] = [];
  const seen = new Set<string>();
  for (const item of input.findings ?? []) {
    const id = item.id.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    fromArray.push({ id, title: (item.title ?? "").trim() });
  }
  if (fromArray.length) return fromArray;

  const legacyId = input.findingId?.trim();
  if (!legacyId) return [];
  return [{ id: legacyId, title: input.findingTitle?.trim() || "" }];
}

export function descriptionFromFinding(finding: {
  title: string;
  url?: string;
  observed: string;
  whyItMatters: string;
  recommendedPlug: string;
}): string {
  return [
    finding.title,
    finding.url ? `URL: ${finding.url}` : "",
    `Observed: ${finding.observed}`,
    `Why it matters: ${finding.whyItMatters}`,
    `Suggested plug: ${finding.recommendedPlug}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function pickedHolesForEmail(lead: PlugLead): PlugLeadFinding[] {
  if (lead.findings?.length) return lead.findings;
  if (lead.findingId) return [{ id: lead.findingId, title: lead.findingTitle || "" }];
  return [];
}

export function formatLeadEmail(lead: PlugLead): string {
  const holes = pickedHolesForEmail(lead);
  const picked =
    holes.length === 0
      ? ""
      : holes.length === 1
        ? `Picked hole: ${holes[0].title || holes[0].id} (${holes[0].id})`
        : `Picked holes:\n${holes.map((hole) => `- ${hole.title || hole.id} (${hole.id})`).join("\n")}`;
  const lines = [
    "New AppHole Pro plug-quote request.",
    "",
    `Lead id: ${lead.id}`,
    `Email: ${lead.email}`,
    `Source: ${lead.source}`,
    lead.scanUrl ? `App URL: ${lead.scanUrl}` : "",
    lead.scanId ? `Scan id: ${lead.scanId}` : "",
    picked,
    "",
    "Description:",
    lead.description,
    "",
    "This is a quote request, not a charge. Reply with a price and scope to plug the hole.",
  ];
  return lines.filter((line, i) => line !== "" || lines[i - 1] !== "").join("\n");
}

export function plugQuoteRateLimited(ip: string, limit = 8, windowMs = 60 * 60 * 1000): boolean {
  return rateLimited(`plug:${ip}`, limit, windowMs);
}

export function notifyConfigured(): boolean {
  const to = process.env.PLUG_LEAD_NOTIFY_EMAIL?.trim();
  const key = process.env.RESEND_API_KEY?.trim();
  const webhook = process.env.PLUG_LEAD_WEBHOOK_URL?.trim();
  return Boolean(webhook || (to && key));
}

export async function notifyPlugLead(lead: PlugLead): Promise<{ ok: boolean; attempted: boolean; error?: string }> {
  const to = process.env.PLUG_LEAD_NOTIFY_EMAIL?.trim();
  const webhook = process.env.PLUG_LEAD_WEBHOOK_URL?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const errors: string[] = [];
  let attempted = false;

  if (webhook) {
    attempted = true;
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "apphole.plug_lead", lead }),
      });
      if (!res.ok) errors.push(`webhook ${res.status}`);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "webhook failed");
    }
  }

  if (resendKey && to) {
    attempted = true;
    const from = process.env.PLUG_LEAD_FROM_EMAIL?.trim() || "AppHole <hello@apphole.pro>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: lead.email,
          subject: `Plug quote request from ${lead.email}`,
          text: formatLeadEmail(lead),
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        errors.push(`resend ${res.status}: ${body.slice(0, 180)}`);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "resend failed");
    }
  }

  if (!attempted) {
    console.info(
      `[apphole] plug lead ${lead.id} stored. Set PLUG_LEAD_NOTIFY_EMAIL and RESEND_API_KEY (or PLUG_LEAD_WEBHOOK_URL) to notify the inbox.`,
    );
    return { ok: true, attempted: false };
  }

  if (errors.length) {
    console.error(`[apphole] plug lead ${lead.id} notify failed: ${errors.join("; ")}`);
    return { ok: false, attempted: true, error: errors.join("; ") };
  }
  return { ok: true, attempted: true };
}
