import { describe, expect, it } from "vitest";
import { scoreVerdict } from "@/lib/scans/verdict";
import { finding } from "@/lib/scans/finding";
import { assertPublicHttpUrl } from "@/lib/ssrf";

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
});

describe("ssrf", () => {
  it("rejects localhost", async () => {
    await expect(assertPublicHttpUrl("http://localhost:3000")).rejects.toThrow();
  });

  it("rejects metadata IPs", async () => {
    await expect(assertPublicHttpUrl("http://127.0.0.1")).rejects.toThrow();
  });
});
