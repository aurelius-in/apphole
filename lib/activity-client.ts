"use client";

const VISITOR_KEY = "ah_visitor";
const SESSION_KEY = "ah_session";
const UTM_KEY = "ah_utm";

type TrackProps = Record<string, string | number | boolean | null | undefined>;

function id(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readId(storage: Storage, key: string): string {
  let value = storage.getItem(key);
  if (!value) {
    value = id();
    storage.setItem(key, value);
  }
  return value;
}

function utm(): { source: string; medium: string; campaign: string } {
  const empty = { source: "", medium: "", campaign: "" };
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
    };
    if (fromUrl.source || fromUrl.medium || fromUrl.campaign) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const saved = sessionStorage.getItem(UTM_KEY);
    if (saved) return JSON.parse(saved) as { source: string; medium: string; campaign: string };
  } catch {
    /* ignore */
  }
  return empty;
}

export function trackActivity(name: string, props: TrackProps = {}, dwellMs = 0, path?: string) {
  if (typeof window === "undefined") return;
  let visitorId = "";
  let sessionId = "";
  try {
    visitorId = readId(localStorage, VISITOR_KEY);
    sessionId = readId(sessionStorage, SESSION_KEY);
  } catch {
    return;
  }
  const campaign = utm();
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") clean[key] = value;
  }
  const body = JSON.stringify({
    name,
    path: path ?? window.location.pathname,
    referrer: document.referrer || "",
    visitorId,
    sessionId,
    source: campaign.source,
    medium: campaign.medium,
    campaign: campaign.campaign,
    dwellMs,
    props: clean,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/activity", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through */
  }
  void fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
