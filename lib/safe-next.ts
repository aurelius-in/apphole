export function safeNextPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  return raw;
}

export function wantsProCheckout(next: string): boolean {
  return next === "/go-pro" || next.startsWith("/go-pro?") || next.startsWith("/api/stripe/checkout");
}

export function withNextQuery(href: string, next: string, fallback = "/dashboard"): string {
  if (!next || next === fallback) return href;
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}next=${encodeURIComponent(next)}`;
}
