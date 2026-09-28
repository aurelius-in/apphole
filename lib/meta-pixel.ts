export const META_PIXEL_ID = "1746612416455864";
export const PIXEL_PRODUCT = "AppHole";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function skipPath(path: string): boolean {
  return path.startsWith("/ops");
}

export function pixelTrack(event: string, params?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;
  if (skipPath(window.location.pathname)) return;
  window.fbq?.("track", event, { content_name: PIXEL_PRODUCT, ...params });
}

export function pixelPageView(): void {
  pixelTrack("PageView");
}

const EVENT_MAP: Record<string, { event: string; params?: Record<string, string | number | boolean> }> = {
  ah_url_submit: { event: "ViewContent", params: { content_category: "scan" } },
  ah_scan_started: { event: "ViewContent", params: { content_category: "scan" } },
  ah_scan_completed: { event: "ViewContent", params: { content_category: "report" } },
  ah_landing_view: { event: "ViewContent", params: { content_category: "landing" } },
  ah_free_signup: { event: "CompleteRegistration" },
  ah_checkout_started: { event: "InitiateCheckout", params: { value: 29, currency: "USD" } },
  ah_subscription_started: { event: "Subscribe", params: { value: 29, currency: "USD" } },
  ah_plug_quote_submit: { event: "Lead", params: { content_category: "plug_quote" } },
  ah_plug_quote_success: { event: "Lead", params: { content_category: "plug_quote" } },
};

export function mirrorPixelEvent(name: string): void {
  if (name === "page_view") return;
  const mapped = EVENT_MAP[name];
  if (!mapped) return;
  pixelTrack(mapped.event, mapped.params);
}
