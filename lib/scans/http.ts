import { USER_AGENT, SCAN_FETCH_TIMEOUT_MS } from "@/lib/plans";
import { assertPublicHttpUrl, assertPublicRedirect, isRedirectStatus } from "@/lib/ssrf";
import type { PageSnapshot } from "@/lib/scans/types";

const HEADER_KEYS = [
  "content-security-policy",
  "content-type",
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "location",
  "server",
  "cache-control",
];

const MAX_REDIRECTS = 5;

function safeFetchError(error: unknown): string {
  if (error instanceof Error && /not allowed|private|local|resolve|Redirect/i.test(error.message)) {
    return "That URL is not a public address AppHole can fetch.";
  }
  return "Request failed";
}

async function fetchPublic(url: string, init: RequestInit, signal: AbortSignal): Promise<{ res: Response; finalUrl: string }> {
  let current = (await assertPublicHttpUrl(url)).toString();
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const res = await fetch(current, { ...init, redirect: "manual", signal });
    if (isRedirectStatus(res.status)) {
      const location = res.headers.get("location");
      if (!location) return { res, finalUrl: current };
      current = await assertPublicRedirect(current, location);
      continue;
    }
    return { res, finalUrl: res.url || current };
  }
  throw new Error("Too many redirects.");
}

export async function fetchPage(url: string): Promise<{ snapshot: PageSnapshot; body: string }> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SCAN_FETCH_TIMEOUT_MS);
  try {
    const { res, finalUrl } = await fetchPublic(
      url,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.8",
        },
      },
      controller.signal,
    );
    const contentType = res.headers.get("content-type") || "";
    const headers: Record<string, string> = {};
    for (const key of HEADER_KEYS) {
      const value = res.headers.get(key);
      if (value) headers[key] = value;
    }
    let body = "";
    if (/text|json|xml|javascript|svg/i.test(contentType) || !contentType) {
      body = await res.text();
      if (body.length > 750_000) body = body.slice(0, 750_000);
    }
    const snapshot: PageSnapshot = {
      url,
      finalUrl,
      status: res.status,
      ok: res.ok,
      title: "",
      metaDescription: "",
      elapsedMs: Date.now() - started,
      headers,
      contentType,
      bytes: body.length,
    };
    return { snapshot, body };
  } catch (error) {
    return {
      snapshot: {
        url,
        finalUrl: url,
        status: 0,
        ok: false,
        title: "",
        metaDescription: "",
        elapsedMs: Date.now() - started,
        headers: {},
        contentType: "",
        bytes: 0,
        error: safeFetchError(error),
      },
      body: "",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function probeStatus(url: string): Promise<{ url: string; status: number; ok: boolean; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(SCAN_FETCH_TIMEOUT_MS, 8000));
  try {
    const { res, finalUrl } = await fetchPublic(
      url,
      {
        method: "GET",
        headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
      },
      controller.signal,
    );
    return { url: finalUrl, status: res.status, ok: res.ok };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: safeFetchError(error),
    };
  } finally {
    clearTimeout(timer);
  }
}
