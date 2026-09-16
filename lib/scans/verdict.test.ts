import { describe, expect, it } from "vitest";
import { scoreVerdict } from "@/lib/scans/verdict";
import { finding } from "@/lib/scans/finding";
import { isAppHole } from "@/lib/scans/types";
import { assertPublicHttpUrl } from "@/lib/ssrf";
import { exampleReport } from "@/lib/scans/example";

describe("verdict", () => {
  it("calls a single high blocker PLUG THESE FIRST", () => {
    const result = scoreVerdict([
      finding({
        category: "support",
        title: "No support path",
        observed: "None",
        expected: "Contact",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.8,
        whyItMatters: "Customers leave",
        recommendedPlug: "Add contact",
      }),
    ]);
    expect(result.verdict).toBe("PLUG_THESE_FIRST");
    expect(result.blockerCount).toBe(1);
  });

  it("treats a dead homepage as incomplete", () => {
    const result = scoreVerdict([
      finding({
        category: "core_functionality",
        title: "Homepage did not load",
        observed: "500",
        expected: "200",
        disposition: "FIX_BEFORE_SELLING",
        severity: "critical",
        confidence: 0.9,
        whyItMatters: "No encounter",
        recommendedPlug: "Fix hosting",
      }),
    ]);
    expect(result.verdict).toBe("INCOMPLETE_CHECK");
  });

  it("counts only AppHoles, not passes or couldn't-verify", () => {
    const result = scoreVerdict([
      finding({
        category: "support",
        title: "No support path",
        observed: "None",
        expected: "Contact",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.8,
        whyItMatters: "Customers leave",
        recommendedPlug: "Add contact",
      }),
      finding({
        category: "privacy",
        title: "Privacy linked",
        observed: "/privacy",
        expected: "A privacy link",
        disposition: "PASS",
        severity: "info",
        confidence: 0.7,
        whyItMatters: "Trust",
        recommendedPlug: "None",
      }),
      finding({
        category: "browser",
        title: "No browser worker",
        observed: "HTTP only",
        expected: "Browser",
        disposition: "COULDNT_VERIFY",
        severity: "info",
        confidence: 1,
        whyItMatters: "Honesty",
        recommendedPlug: "Enable Playwright",
      }),
    ]);
    expect(result.holeCount).toBe(1);
    expect(result.passCount).toBe(1);
    expect(result.unverifiedCount).toBe(1);
  });
});

describe("isAppHole", () => {
  it("matches the example report headline to numbered holes", () => {
    const holes = exampleReport.findings.filter((f) => isAppHole(f.disposition));
    expect(holes).toHaveLength(exampleReport.holeCount);
    expect(exampleReport.findings.length).toBeGreaterThan(exampleReport.holeCount);
  });
});

describe("ssrf", () => {
  it("rejects localhost", async () => {
    await expect(assertPublicHttpUrl("http://localhost:3000")).rejects.toThrow();
  });

  it("rejects metadata IPs", async () => {
    await expect(assertPublicHttpUrl("http://127.0.0.1")).rejects.toThrow();
  });
});
