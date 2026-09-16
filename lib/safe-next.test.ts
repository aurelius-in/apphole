import { describe, expect, it } from "vitest";
import { safeNextPath, wantsProCheckout, withNextQuery } from "@/lib/safe-next";

describe("safeNextPath", () => {
  it("allows internal paths and rejects off-site next values", () => {
    expect(safeNextPath("/go-pro")).toBe("/go-pro");
    expect(safeNextPath("/dashboard?welcome=1")).toBe("/dashboard?welcome=1");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
  });
});

describe("wantsProCheckout", () => {
  it("treats go-pro as the pay continuation", () => {
    expect(wantsProCheckout("/go-pro")).toBe(true);
    expect(wantsProCheckout("/dashboard")).toBe(false);
  });
});

describe("withNextQuery", () => {
  it("keeps next when it is not the fallback", () => {
    expect(withNextQuery("/login", "/go-pro")).toBe("/login?next=%2Fgo-pro");
    expect(withNextQuery("/login", "/dashboard")).toBe("/login");
  });
});
