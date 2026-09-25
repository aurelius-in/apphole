/**
 * Founder activity rollup. Pure: no I/O.
 * AppHole's commitment is a free check, then an optional account.
 */

export type ActivityRange = "today" | "7d" | "month" | "all";

export const ACTIVITY_RANGES: { id: ActivityRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Past week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

export type ActivityEvent = {
  id: string;
  name: string;
  ts: string;
  visitorId: string;
  sessionId: string;
  path: string;
  referrer: string;
  source: string;
  medium: string;
  campaign: string;
  dwellMs: number;
  props: Record<string, string | number | boolean>;
};

export type FunnelStep = {
  key: string;
  label: string;
  hint: string;
  sessions: number;
  continuePct: number | null;
};

export type StopRow = {
  key: string;
  label: string;
  sessions: number;
  sharePct: number | null;
};

export type PageRow = {
  path: string;
  views: number;
  sessions: number;
  medianDwellLabel: string;
  totalDwellLabel: string;
};

export type SessionRow = {
  id: string;
  when: string;
  source: string;
  durationLabel: string;
  trail: string;
  stopped: string;
  signup: string;
};

export type DailyKpi = { label: string; value: string };

export function dailyKpis(stats: ActivityStats): DailyKpi[] {
  return [
    { label: "Sessions", value: String(stats.sessions) },
    { label: "Checks started", value: String(stats.checks.started) },
    { label: "Signups unfinished", value: String(stats.signups.leftAfterStart) },
  ];
}

export type Insight = {
  severity: "critical" | "warn" | "info";
  title: string;
  detail: string;
};

export type ActivityStats = {
  checkedAt: string;
  range: ActivityRange;
  rangeLabel: string;
  headline: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  medianSessionLabel: string;
  funnel: FunnelStep[];
  stops: StopRow[];
  pages: PageRow[];
  sections: { name: string; sessions: number }[];
  sources: { source: string; sessions: number }[];
  events: { name: string; count: number }[];
  signups: {
    sawForm: number;
    started: number;
    submitted: number;
    completed: number;
    failed: number;
    leftAfterStart: number;
  };
  checks: {
    focused: number;
    submitted: number;
    started: number;
    completed: number;
    failed: number;
    reportViews: number;
    exampleViews: number;
    proClicks: number;
    checkoutStarts: number;
    plugQuotes: number;
  };
  traffic: { label: string; sessions: number }[];
  recent: SessionRow[];
  insights: Insight[];
};

const FUNNEL: { key: string; label: string; hint: string; test: (names: Set<string>, paths: Set<string>) => boolean }[] = [
  { key: "landed", label: "Landed", hint: "Any page", test: () => true },
  { key: "home", label: "Home", hint: "Opened the homepage", test: (_n, paths) => paths.has("/") },
  {
    key: "engaged",
    label: "Looked around",
    hint: "Example, pricing, FAQ, anatomy, or a section below the hero",
    test: (names, paths) =>
      [...names].some((name) => name.startsWith("section:") && name !== "section:hero") ||
      names.has("ah_faq_expand") ||
      names.has("ah_example_report_viewed") ||
      paths.has("/example") ||
      paths.has("/pricing") ||
      paths.has("/methodology"),
  },
  {
    key: "check",
    label: "Started a check",
    hint: "Focused the URL field or submitted a URL",
    test: (names) => names.has("check_focused") || names.has("ah_url_submit") || names.has("ah_hero_cta_click"),
  },
  {
    key: "scan",
    label: "Scan running",
    hint: "A check actually started",
    test: (names, paths) => names.has("ah_scan_started") || [...paths].some((p) => p.startsWith("/scan/")),
  },
  {
    key: "report",
    label: "Saw a result",
    hint: "Scan finished or a report was opened",
    test: (names) => names.has("ah_scan_completed") || names.has("ah_report_viewed"),
  },
  {
    key: "signup_seen",
    label: "Saw signup",
    hint: "Opened the account form",
    test: (names, paths) => names.has("signup_view") || paths.has("/signup"),
  },
  {
    key: "signup_started",
    label: "Started signup",
    hint: "Typed into the account form",
    test: (names) => names.has("signup_started") || names.has("signup_submitted"),
  },
  {
    key: "account",
    label: "Account created",
    hint: "Signup succeeded",
    test: (names) => names.has("signup_completed") || names.has("ah_free_signup"),
  },
  {
    key: "pro",
    label: "Pro / checkout",
    hint: "Clicked Pro or opened checkout",
    test: (names, paths) =>
      names.has("ah_pro_click") ||
      names.has("ah_checkout_started") ||
      paths.has("/go-pro"),
  },
];

export function parseActivityRange(raw: string | undefined | null): ActivityRange {
  if (raw === "today" || raw === "7d" || raw === "month" || raw === "all") return raw;
  return "7d";
}

export function rangeStartMs(range: ActivityRange, now = Date.now()): number | null {
  if (range === "all") return null;
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (range === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

export function normalizePath(path: string): string {
  const base = path.split("?")[0] || "/";
  if (base.startsWith("/scan/")) return "/scan/:id";
  if (base.startsWith("/ops/")) return base;
  return base || "/";
}

function hostOf(value: string): string {
  if (!value) return "";
  try {
    return new URL(value).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const BLOCKED_PROP = /email|password|token|secret|authorization|cookie/i;

export function sanitizeActivity(input: unknown, now = Date.now()): ActivityEvent | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const name = clip(raw.name, 64);
  if (!/^[a-z0-9_:-]+$/i.test(name)) return null;
  const visitorId = clip(raw.visitorId, 80);
  const sessionId = clip(raw.sessionId, 80);
  if (!visitorId || !sessionId) return null;
  const propsIn = raw.props && typeof raw.props === "object" ? (raw.props as Record<string, unknown>) : {};
  const props: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(propsIn).slice(0, 12)) {
    if (BLOCKED_PROP.test(key)) continue;
    if (typeof value === "boolean" || typeof value === "number") props[clip(key, 40)] = value;
    else if (typeof value === "string") props[clip(key, 40)] = clip(value, 160);
  }
  const dwell = typeof raw.dwellMs === "number" && raw.dwellMs > 0 ? Math.min(raw.dwellMs, 30 * 60 * 1000) : 0;
  const ts = typeof raw.ts === "string" && !Number.isNaN(Date.parse(raw.ts)) ? raw.ts : new Date(now).toISOString();
  return {
    id: clip(raw.id, 40) || `e_${now.toString(36)}`,
    name,
    ts,
    visitorId,
    sessionId,
    path: normalizePath(clip(raw.path, 180) || "/"),
    referrer: hostOf(typeof raw.referrer === "string" ? raw.referrer : ""),
    source: clip(raw.source, 80),
    medium: clip(raw.medium, 80),
    campaign: clip(raw.campaign, 80),
    dwellMs: dwell,
    props,
  };
}

function clip(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function formatDuration(ms: number | null): string {
  if (ms === null || ms <= 0) return "n/a";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  if (min < 60) return rem ? `${min}m ${rem}s` : `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function pct(part: number, whole: number): number | null {
  if (!whole) return null;
  return Math.round((part / whole) * 100);
}

type SessionBag = {
  id: string;
  visitorId: string;
  events: ActivityEvent[];
  names: Set<string>;
  paths: Set<string>;
  start: number;
  end: number;
  source: string;
};

function bagSessions(events: ActivityEvent[]): SessionBag[] {
  const map = new Map<string, SessionBag>();
  for (const event of events) {
    let bag = map.get(event.sessionId);
    const t = Date.parse(event.ts);
    if (!bag) {
      bag = {
        id: event.sessionId,
        visitorId: event.visitorId,
        events: [],
        names: new Set(),
        paths: new Set(),
        start: t,
        end: t,
        source: event.source || event.referrer || "direct",
      };
      map.set(event.sessionId, bag);
    }
    bag.events.push(event);
    bag.names.add(event.name);
    if (event.path) bag.paths.add(event.path);
    if (event.name === "section_seen" && typeof event.props.section === "string") {
      bag.names.add(`section:${event.props.section}`);
    }
    if (t < bag.start) bag.start = t;
    if (t > bag.end) bag.end = t;
    if (!bag.source && (event.source || event.referrer)) bag.source = event.source || event.referrer;
  }
  return [...map.values()];
}

function furthest(bag: SessionBag): number {
  let index = 0;
  for (let i = 1; i < FUNNEL.length; i++) {
    if (FUNNEL[i].test(bag.names, bag.paths)) index = i;
  }
  return index;
}

function signupState(bag: SessionBag): string {
  if (bag.names.has("signup_completed") || bag.names.has("ah_free_signup")) return "created";
  if (bag.names.has("signup_failed")) return "failed";
  if (bag.names.has("signup_submitted")) return "submitted";
  if (bag.names.has("signup_started")) return "started, not finished";
  if (bag.names.has("signup_view") || bag.paths.has("/signup")) return "saw the form";
  return "no signup";
}

export function buildActivityStats(events: ActivityEvent[], range: ActivityRange, now = Date.now()): ActivityStats {
  const start = rangeStartMs(range, now);
  const windowed = events.filter((event) => {
    const t = Date.parse(event.ts);
    return !Number.isNaN(t) && (start === null || t >= start);
  });
  const sessions = bagSessions(windowed);
  const visitors = new Set(sessions.map((s) => s.visitorId)).size;
  const pageViews = windowed.filter((e) => e.name === "page_view").length;

  const funnel: FunnelStep[] = FUNNEL.map((step, index) => {
    const reached = index === 0 ? sessions.length : sessions.filter((bag) => step.test(bag.names, bag.paths)).length;
    return {
      key: step.key,
      label: step.label,
      hint: step.hint,
      sessions: reached,
      continuePct: null as number | null,
    };
  });
  for (let i = 1; i < funnel.length; i++) {
    funnel[i].continuePct = pct(funnel[i].sessions, funnel[i - 1].sessions);
  }

  const stopCounts = FUNNEL.map(() => 0);
  for (const bag of sessions) stopCounts[furthest(bag)] += 1;
  const stops: StopRow[] = FUNNEL.map((step, i) => ({
    key: step.key,
    label: step.label,
    sessions: stopCounts[i],
    sharePct: pct(stopCounts[i], sessions.length),
  })).filter((row) => row.sessions > 0);

  const pageMap = new Map<string, { views: number; sessions: Set<string>; dwells: number[] }>();
  for (const event of windowed) {
    if (event.name !== "page_view" && event.name !== "page_dwell") continue;
    const row = pageMap.get(event.path) ?? { views: 0, sessions: new Set<string>(), dwells: [] };
    if (event.name === "page_view") {
      row.views += 1;
      row.sessions.add(event.sessionId);
    }
    if (event.name === "page_dwell" && event.dwellMs > 0) row.dwells.push(event.dwellMs);
    pageMap.set(event.path, row);
  }
  const pages: PageRow[] = [...pageMap.entries()]
    .map(([path, row]) => ({
      path,
      views: row.views,
      sessions: row.sessions.size,
      medianDwellLabel: formatDuration(median(row.dwells)),
      totalDwellLabel: formatDuration(row.dwells.reduce((sum, n) => sum + n, 0)),
    }))
    .sort((a, b) => b.views - a.views || b.sessions - a.sessions)
    .slice(0, 12);

  const sectionMap = new Map<string, Set<string>>();
  for (const event of windowed) {
    if (event.name !== "section_seen") continue;
    const section = String(event.props.section || "unknown");
    const set = sectionMap.get(section) ?? new Set<string>();
    set.add(event.sessionId);
    sectionMap.set(section, set);
  }
  const sections = [...sectionMap.entries()]
    .map(([name, set]) => ({ name, sessions: set.size }))
    .sort((a, b) => b.sessions - a.sessions);

  const sourceMap = new Map<string, number>();
  for (const bag of sessions) sourceMap.set(bag.source || "direct", (sourceMap.get(bag.source || "direct") ?? 0) + 1);
  const sources = [...sourceMap.entries()]
    .map(([source, count]) => ({ source, sessions: count }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  const eventMap = new Map<string, number>();
  for (const event of windowed) {
    if (event.name === "page_view" || event.name === "page_dwell" || event.name === "section_seen") continue;
    eventMap.set(event.name, (eventMap.get(event.name) ?? 0) + 1);
  }
  const named = [...eventMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);

  const countName = (name: string) => windowed.filter((e) => e.name === name).length;
  const sawForm = sessions.filter((b) => b.paths.has("/signup") || b.names.has("signup_view")).length;
  const started = sessions.filter((b) => b.names.has("signup_started") || b.names.has("signup_submitted")).length;
  const submitted = sessions.filter((b) => b.names.has("signup_submitted") || b.names.has("signup_completed") || b.names.has("ah_free_signup")).length;
  const completed = sessions.filter((b) => b.names.has("signup_completed") || b.names.has("ah_free_signup")).length;
  const failed = sessions.filter((b) => b.names.has("signup_failed")).length;
  const leftAfterStart = sessions.filter(
    (b) => (b.names.has("signup_started") || b.names.has("signup_submitted")) && !b.names.has("signup_completed") && !b.names.has("ah_free_signup"),
  ).length;

  const durations = sessions.map((b) => Math.max(0, b.end - b.start));
  const dwellFallback = windowed.filter((e) => e.name === "page_dwell").map((e) => e.dwellMs);
  const medianSession = median(durations.filter((n) => n > 0).length ? durations : dwellFallback);

  const grain = range === "today" ? "hour" : "day";
  const buckets = new Map<string, Set<string>>();
  for (const bag of sessions) {
    const d = new Date(bag.start);
    const key = grain === "hour" ? `${d.getHours()}:00` : d.toISOString().slice(0, 10);
    const set = buckets.get(key) ?? new Set<string>();
    set.add(bag.id);
    buckets.set(key, set);
  }
  const traffic = [...buckets.entries()].map(([label, set]) => ({ label, sessions: set.size }));

  const recent: SessionRow[] = [...sessions]
    .sort((a, b) => b.start - a.start)
    .slice(0, 14)
    .map((bag) => {
      const trail = [...new Set(bag.events.filter((e) => e.name === "page_view").map((e) => e.path))].slice(0, 6);
      const stop = FUNNEL[furthest(bag)];
      return {
        id: bag.id.slice(0, 8),
        when: new Date(bag.start).toLocaleString(),
        source: bag.source || "direct",
        durationLabel: formatDuration(Math.max(bag.end - bag.start, 0)),
        trail: trail.join(" → ") || bag.events[0]?.path || "/",
        stopped: stop?.label ?? "Landed",
        signup: signupState(bag),
      };
    });

  const insights = buildInsights(sessions, funnel, leftAfterStart, completed);
  const homeStops = stopCounts[1] ?? 0;
  const rangeLabel = ACTIVITY_RANGES.find((r) => r.id === range)?.label ?? "Past week";
  const headline =
    sessions.length === 0
      ? "No activity in this window yet. Visits, check starts, and signup attempts will show up here."
      : `${visitors} visitor${visitors === 1 ? "" : "s"}, ${sessions.length} session${sessions.length === 1 ? "" : "s"}. ${completed} account${completed === 1 ? "" : "s"} created. ${leftAfterStart} started signup and did not finish. ${homeStops} session${homeStops === 1 ? "" : "s"} stopped on the homepage.`;

  return {
    checkedAt: new Date(now).toISOString(),
    range,
    rangeLabel,
    headline,
    visitors,
    sessions: sessions.length,
    pageViews,
    medianSessionLabel: formatDuration(medianSession),
    funnel,
    stops,
    pages,
    sections,
    sources,
    events: named,
    signups: { sawForm, started, submitted, completed, failed, leftAfterStart },
    checks: {
      focused: countName("check_focused"),
      submitted: countName("ah_url_submit"),
      started: countName("ah_scan_started"),
      completed: countName("ah_scan_completed"),
      failed: countName("ah_scan_failed"),
      reportViews: countName("ah_report_viewed"),
      exampleViews: countName("ah_example_report_viewed"),
      proClicks: countName("ah_pro_click"),
      checkoutStarts: countName("ah_checkout_started"),
      plugQuotes: countName("ah_plug_quote_success") + countName("ah_plug_quote_submit"),
    },
    traffic,
    recent,
    insights,
  };
}

function buildInsights(sessions: SessionBag[], funnel: FunnelStep[], leftAfterStart: number, completed: number): Insight[] {
  const tips: Insight[] = [];
  if (!sessions.length) return tips;
  const byKey = (key: string) => funnel.find((step) => step.key === key);
  const check = byKey("check");
  const scan = byKey("scan");
  const report = byKey("report");
  const signup = byKey("signup_seen");
  if (check && scan && check.sessions >= 3 && (scan.continuePct ?? 100) < 50) {
    tips.push({
      severity: "critical",
      title: "People start a check and do not reach a scan",
      detail: `${scan.sessions} of ${check.sessions} check-intent sessions actually started a scan. The URL field, authorization checkbox, or the request itself is where they stall.`,
    });
  }
  if (report && signup && report.sessions >= 2 && signup.sessions === 0) {
    tips.push({
      severity: "warn",
      title: "Reports are landing, accounts are not",
      detail: `${report.sessions} session${report.sessions === 1 ? "" : "s"} saw a result and none opened signup. The free check may be answering the question before an account feels necessary.`,
    });
  }
  if (leftAfterStart > 0) {
    tips.push({
      severity: leftAfterStart > completed ? "critical" : "warn",
      title: "Signups start and stop",
      detail: `${leftAfterStart} session${leftAfterStart === 1 ? "" : "s"} typed into the account form and did not finish. ${completed} finished.`,
    });
  }
  const home = byKey("home");
  const engaged = byKey("engaged");
  if (home && engaged && home.sessions >= 5 && (engaged.continuePct ?? 100) < 40) {
    tips.push({
      severity: "warn",
      title: "Most homepage sessions never look past the hero",
      detail: `${engaged.sessions} of ${home.sessions} homepage sessions reached an example, pricing, FAQ, or a lower section.`,
    });
  }
  if (!tips.length) {
    tips.push({
      severity: "info",
      title: "No single stall stands out yet",
      detail: "Keep watching where sessions stop relative to the check, the report, and the signup form.",
    });
  }
  return tips;
}
