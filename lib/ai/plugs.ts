import type { Finding } from "@/lib/scans/types";

function extractMessage(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;
  if (typeof obj.content === "string") return obj.content;
  const choices = obj.choices as Array<{ message?: { content?: string } }> | undefined;
  if (choices?.[0]?.message?.content) return choices[0].message.content;
  const content = obj.content as Array<{ text?: string }> | undefined;
  if (Array.isArray(content) && content[0]?.text) return content[0].text;
  return null;
}

export async function enrichPlugs(findings: Finding[]): Promise<Finding[]> {
  if (process.env.APPHOLE_AI_PLUGS !== "1") return findings;
  const key = process.env.OPENAI_API_KEY;
  const anthropic = process.env.ANTHROPIC_API_KEY;
  if (!key && !anthropic) return findings;

  const actionable = findings.filter((f) => f.disposition !== "PASS").slice(0, 12);
  if (!actionable.length) return findings;

  const prompt = `You help AppHole write short, concrete plugs for app-readiness findings.
Rules:
- Use only the supplied evidence. Do not invent extra failures.
- Keep each recommendedPlug to 1-2 sentences.
- Keep whyItMatters to 1-2 sentences.
- Plain language. No startup jargon.
- Return JSON array: [{"id":"...","whyItMatters":"...","recommendedPlug":"..."}]

Findings:
${JSON.stringify(
  actionable.map((f) => ({
    id: f.id,
    title: f.title,
    observed: f.observed,
    disposition: f.disposition,
    evidence: f.evidence,
  })),
)}`;

  try {
    let text: string | null = null;
    if (key) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            { role: "system", content: "You rewrite plugs. You never add findings." },
            { role: "user", content: prompt },
          ],
        }),
      });
      text = extractMessage(await res.json());
    } else if (anthropic) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropic,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",
          max_tokens: 1200,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      text = extractMessage(await res.json());
    }
    if (!text) return findings;
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start < 0 || end < 0) return findings;
    const parsed = JSON.parse(text.slice(start, end + 1)) as Array<{
      id: string;
      whyItMatters?: string;
      recommendedPlug?: string;
    }>;
    const byId = new Map(parsed.map((row) => [row.id, row]));
    return findings.map((f) => {
      const extra = byId.get(f.id);
      if (!extra) return f;
      return {
        ...f,
        whyItMatters: extra.whyItMatters?.trim() || f.whyItMatters,
        recommendedPlug: extra.recommendedPlug?.trim() || f.recommendedPlug,
      };
    });
  } catch {
    return findings;
  }
}
