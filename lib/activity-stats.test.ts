import { describe, expect, it } from "vitest";
import { buildActivityStats, sanitizeActivity, type ActivityEvent } from "@/lib/activity-stats";

function event(partial: Partial<ActivityEvent> & Pick<ActivityEvent, "name" | "sessionId">): ActivityEvent {
  return {
    id: partial.id || partial.name + partial.sessionId,
    ts: partial.ts || "2026-09-25T18:00:00.000Z",
    visitorId: partial.visitorId || partial.sessionId,
    path: partial.path || "/",
    referrer: partial.referrer || "",
    source: partial.source || "direct",
    medium: "",
    campaign: "",
    dwellMs: partial.dwellMs || 0,
    props: partial.props || {},
    name: partial.name,
    sessionId: partial.sessionId,
  };
}

describe("activity stats", () => {
  it("drops secrets and keeps a check-to-signup trail", () => {
    const clean = sanitizeActivity({
      name: "signup_started",
      visitorId: "v1",
      sessionId: "s1",
      path: "/signup?x=1",
      props: { email: "a@b.com", field: "email" },
    });
    expect(clean?.props.email).toBeUndefined();
    expect(clean?.props.field).toBe("email");
    expect(clean?.path).toBe("/signup");
  });

  it("counts a session that started signup and stopped there", () => {
    const now = Date.parse("2026-09-25T20:00:00.000Z");
    const stats = buildActivityStats(
      [
        event({ name: "page_view", sessionId: "s1", path: "/" }),
        event({ name: "section_seen", sessionId: "s1", props: { section: "example-report" } }),
        event({ name: "check_focused", sessionId: "s1" }),
        event({ name: "ah_scan_started", sessionId: "s1", path: "/scan/abc" }),
        event({ name: "ah_scan_completed", sessionId: "s1", path: "/scan/abc" }),
        event({ name: "page_view", sessionId: "s1", path: "/signup" }),
        event({ name: "signup_started", sessionId: "s1", path: "/signup" }),
        event({ name: "page_dwell", sessionId: "s1", path: "/signup", dwellMs: 12000 }),
        event({ name: "page_view", sessionId: "s2", path: "/" }),
      ],
      "all",
      now,
    );
    expect(stats.sessions).toBe(2);
    expect(stats.signups.started).toBe(1);
    expect(stats.signups.completed).toBe(0);
    expect(stats.signups.leftAfterStart).toBe(1);
    const signup = stats.funnel.find((step) => step.key === "signup_started");
    expect(signup?.sessions).toBe(1);
    expect(stats.pages.find((page) => page.path === "/signup")?.medianDwellLabel).toBe("12s");
    expect(stats.recent[0]?.signup === "started, not finished" || stats.recent[1]?.signup === "started, not finished").toBe(true);
  });
});
