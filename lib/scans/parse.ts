import * as cheerio from "cheerio";
import { absolutize, sameOrigin } from "@/lib/ssrf";
import type { PageSnapshot } from "@/lib/scans/types";

export type ParsedPage = {
  snapshot: PageSnapshot;
  html: string;
  $: cheerio.CheerioAPI;
  links: string[];
  ctaTexts: string[];
  imagesMissingAlt: number;
  imageCount: number;
  forms: Array<{ action: string; method: string; inputs: string[]; unlabeled: number }>;
  text: string;
};

const ROLE_HINTS: Record<string, RegExp> = {
  signup: /\b(sign\s?up|register|create account|join)\b/i,
  login: /\b(log\s?in|sign\s?in|account)\b/i,
  pricing: /\b(pricing|plans|upgrade)\b/i,
  checkout: /\b(checkout|buy|subscribe|purchase|add to cart|start trial)\b/i,
  privacy: /\bprivacy\b/i,
  terms: /\b(terms|tos|legal)\b/i,
  support: /\b(support|help|contact|status)\b/i,
};

export function parseHtml(snapshot: PageSnapshot, html: string): ParsedPage {
  const $ = cheerio.load(html);
  snapshot.title = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content")?.trim() || "";
  snapshot.metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    const abs = absolutize(snapshot.finalUrl, $(el).attr("href") || "");
    if (abs && sameOrigin(snapshot.finalUrl, abs)) links.add(abs.split("#")[0]);
  });

  const ctaTexts: string[] = [];
  $("a, button").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text && text.length < 80) ctaTexts.push(text);
  });

  let imageCount = 0;
  let imagesMissingAlt = 0;
  $("img").each((_, el) => {
    imageCount += 1;
    const alt = ($(el).attr("alt") || "").trim();
    if (!alt) imagesMissingAlt += 1;
  });

  const forms = $("form")
    .toArray()
    .map((form) => {
      const $form = $(form);
      const inputs = $form
        .find("input, textarea, select")
        .toArray()
        .map((input) => ($(input).attr("name") || $(input).attr("id") || $(input).attr("type") || "").toString());
      let unlabeled = 0;
      $form.find("input, textarea, select").each((__, input) => {
        const $input = $(input);
        const type = ($input.attr("type") || "").toLowerCase();
        if (["hidden", "submit", "button", "image"].includes(type)) return;
        const id = $input.attr("id");
        const aria = $input.attr("aria-label") || $input.attr("aria-labelledby");
        const hasLabel = Boolean(aria) || Boolean(id && $(`label[for="${id}"]`).length) || $input.closest("label").length > 0;
        if (!hasLabel) unlabeled += 1;
      });
      return {
        action: $form.attr("action") || "",
        method: ($form.attr("method") || "get").toLowerCase(),
        inputs,
        unlabeled,
      };
    });

  const bodyClone = $("body").clone();
  bodyClone.find("script, style, noscript, template").remove();
  const text = bodyClone.text().replace(/\s+/g, " ").trim().slice(0, 20000);

  return { snapshot, html, $, links: [...links], ctaTexts, imagesMissingAlt, imageCount, forms, text };
}

export function classifyLink(url: string, text = ""): string | null {
  const hay = `${url} ${text}`.toLowerCase();
  for (const [role, pattern] of Object.entries(ROLE_HINTS)) {
    if (pattern.test(hay)) return role;
  }
  return null;
}

export function pickNextUrls(origin: string, discovered: string[], max: number): string[] {
  const scored = discovered
    .filter((url) => sameOrigin(origin, url))
    .map((url) => {
      const role = classifyLink(url);
      const weight =
        role === "checkout" || role === "pricing"
          ? 10
          : role === "signup" || role === "login"
            ? 9
            : role === "privacy" || role === "terms" || role === "support"
              ? 8
              : /\/(app|dashboard|onboard|start|docs)/i.test(url)
                ? 6
                : 3;
      return { url, weight };
    })
    .sort((a, b) => b.weight - a.weight);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of scored) {
    const key = item.url.replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item.url);
    if (out.length >= max) break;
  }
  return out;
}

export const PLACEHOLDER_RE =
  /\b(lorem ipsum|todo:|fixme|placeholder|tbd\b|coming soon|your name here|test@test\.com|password123|xxx-xxx)\b/i;
export const LOCAL_LEAK_RE = /\b(localhost:\d+|127\.0\.0\.1|0\.0\.0\.0:\d+|staging\.|dev\.|ngrok\.|vercel\.app\/_debug)\b/i;
export const SECRET_RE =
  /\b(sk_live_[0-9a-zA-Z]{10,}|sk_test_[0-9a-zA-Z]{10,}|AKIA[0-9A-Z]{16}|ghp_[0-9A-Za-z]{20,}|xox[baprs]-[0-9A-Za-z-]{20,}|-----BEGIN (RSA |OPENSSH )?PRIVATE KEY-----)\b/;
export const STRIPE_TEST_RE = /\b(pk_test_|sk_test_)\w+/;
