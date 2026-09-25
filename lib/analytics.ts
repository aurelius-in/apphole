export type AnalyticsEvent =
  | "ah_landing_view"
  | "ah_hero_cta_click"
  | "ah_url_submit"
  | "ah_scan_authorization_confirmed"
  | "ah_scan_started"
  | "ah_scan_completed"
  | "ah_scan_failed"
  | "ah_report_viewed"
  | "ah_finding_expanded"
  | "ah_disposition_viewed"
  | "ah_example_report_viewed"
  | "ah_free_signup"
  | "ah_pro_click"
  | "ah_checkout_started"
  | "ah_subscription_started"
  | "ah_retest_started"
  | "ah_plug_quote_submit"
  | "ah_plug_quote_success"
  | "ah_faq_expand";

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const payload = { event, props: props ?? {}, t: Date.now() };
  try {
    const key = "ah_events";
    const prev = JSON.parse(window.sessionStorage.getItem(key) || "[]") as unknown[];
    window.sessionStorage.setItem(key, JSON.stringify([...prev, payload].slice(-80)));
  } catch {
    // ignore quota
  }
  window.dispatchEvent(new CustomEvent("ah:event", { detail: payload }));
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload.props)) {
    if (typeof value === "string") safe[key] = value.slice(0, 160);
    else if (typeof value === "number" || typeof value === "boolean") safe[key] = value;
  }
  void import("@/lib/activity-client").then(({ trackActivity }) => trackActivity(event, safe));
}
