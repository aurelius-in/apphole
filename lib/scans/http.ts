import { USER_AGENT, SCAN_FETCH_TIMEOUT_MS } from "@/lib/plans";
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

export async function fetchPage(url: string): Promise<{ snapshot: PageSnapshot; body: string }> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SCAN_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.8",
      },
    });
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
      finalUrl: res.url || url,
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
    const message = error instanceof Error ? error.message : "Request failed";
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
        error: message,
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
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
    });
    return { url: res.url || url, status: res.status, ok: res.ok };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  } finally {
    clearTimeout(timer);
  }
}
