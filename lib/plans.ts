export const FREE_MAX_PAGES = 8;
export const PRO_MAX_PAGES = 24;
export const FREE_MAX_SCANS_PER_MONTH = 3;
export const PRO_MAX_SCANS_PER_MONTH = 40;
export const SCAN_FETCH_TIMEOUT_MS = 12000;
export const SCAN_GAP_MS = 220;
export const USER_AGENT =
  "AppHoleBot/0.1 (+https://apphole.pro; authorized pre-customer readiness check)";

export type Plan = "free" | "pro";

export function pagesForPlan(plan: Plan): number {
  return plan === "pro" ? PRO_MAX_PAGES : FREE_MAX_PAGES;
}

export function monthlyScanLimit(plan: Plan): number {
  return plan === "pro" ? PRO_MAX_SCANS_PER_MONTH : FREE_MAX_SCANS_PER_MONTH;
}
