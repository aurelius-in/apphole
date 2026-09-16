import { describe, expect, it } from "vitest";
import { descriptionFromFinding, formatLeadEmail, plugQuoteSchema } from "@/lib/leads";
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
});
