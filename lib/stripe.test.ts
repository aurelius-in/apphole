import { describe, expect, it } from "vitest";
import { wantsJsonCheckout } from "@/lib/stripe";

describe("wantsJsonCheckout", () => {
  it("treats Accept application/json as a JSON checkout client", () => {
    expect(wantsJsonCheckout(new Request("http://localhost/api/stripe/checkout", { headers: { Accept: "application/json" } }))).toBe(
      true,
    );
  });

  it("treats a normal browser navigation as a redirect client", () => {
    expect(
      wantsJsonCheckout(
        new Request("http://localhost/api/stripe/checkout", { headers: { Accept: "text/html,application/xhtml+xml" } }),
      ),
    ).toBe(false);
  });
});
