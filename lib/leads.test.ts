import { describe, expect, it } from "vitest";
import { descriptionFromFinding, formatLeadEmail, normalizePlugFindings, plugQuoteSchema } from "@/lib/leads";
import { exampleReport } from "@/lib/scans/example";

describe("plug quote schema", () => {
  it("accepts a valid request", () => {
    const parsed = plugQuoteSchema.parse({
      email: "founder@example.com",
      description: "Checkout fails on mobile. Paste from the report.",
      source: "example",
    });
    expect(parsed.email).toBe("founder@example.com");
  });

  it("rejects a missing description", () => {
    const result = plugQuoteSchema.safeParse({
      email: "founder@example.com",
      description: "too short",
      source: "report",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = plugQuoteSchema.safeParse({
      email: "not-an-email",
      description: "Checkout fails on every phone we tried this week.",
      source: "pricing",
    });
    expect(result.success).toBe(false);
  });

  it("accepts several picked holes", () => {
    const parsed = plugQuoteSchema.parse({
      email: "founder@example.com",
      description: "Quote the mobile checkout and password reset leaks together.",
      source: "example",
      findings: [
        { id: "ex_1", title: "Checkout fails on mobile" },
        { id: "ex_3", title: "Password reset link is broken" },
      ],
    });
    expect(parsed.findings).toHaveLength(2);
    expect(parsed.findings?.[0].id).toBe("ex_1");
  });

  it("still accepts a single findingId from older clients", () => {
    const parsed = plugQuoteSchema.parse({
      email: "founder@example.com",
      description: "Quote the mobile checkout leak from this report.",
      source: "example",
      findingId: "ex_1",
      findingTitle: "Checkout fails on mobile",
    });
    expect(parsed.findingId).toBe("ex_1");
    expect(parsed.findings).toBeUndefined();
  });
});

describe("normalizePlugFindings", () => {
  it("prefers the findings array and keeps ids plus titles", () => {
    const holes = normalizePlugFindings({
      findings: [
        { id: "ex_1", title: "Checkout fails on mobile" },
        { id: "ex_2", title: "New users land on an empty dashboard" },
      ],
      findingId: "legacy_only",
      findingTitle: "Should be ignored",
    });
    expect(holes).toEqual([
      { id: "ex_1", title: "Checkout fails on mobile" },
      { id: "ex_2", title: "New users land on an empty dashboard" },
    ]);
  });

  it("falls back to a single findingId", () => {
    expect(
      normalizePlugFindings({
        findingId: "ex_1",
        findingTitle: "Checkout fails on mobile",
      }),
    ).toEqual([{ id: "ex_1", title: "Checkout fails on mobile" }]);
  });
});

describe("finding prefill", () => {
  it("includes observed and plug text", () => {
    const hole = exampleReport.findings[0];
    const text = descriptionFromFinding(hole);
    expect(text).toContain(hole.title);
    expect(text).toContain("Observed:");
    expect(text).toContain("Suggested plug:");
  });
});

describe("notify email body", () => {
  it("marks the request as a quote, not a charge", () => {
    const body = formatLeadEmail({
      id: "lead_test",
      email: "founder@example.com",
      description: "Mobile checkout errors before Stripe opens.",
      source: "report",
      createdAt: "2026-09-15T16:00:00.000Z",
    });
    expect(body).toContain("founder@example.com");
    expect(body).toContain("quote request, not a charge");
  });

  it("lists several picked holes with ids and titles", () => {
    const body = formatLeadEmail({
      id: "lead_multi",
      email: "founder@example.com",
      description: "Please quote both leaks.",
      source: "example",
      createdAt: "2026-09-16T16:00:00.000Z",
      findings: [
        { id: "ex_1", title: "Checkout fails on mobile" },
        { id: "ex_3", title: "Password reset link is broken" },
      ],
    });
    expect(body).toContain("Picked holes:");
    expect(body).toContain("Checkout fails on mobile (ex_1)");
    expect(body).toContain("Password reset link is broken (ex_3)");
  });
});
