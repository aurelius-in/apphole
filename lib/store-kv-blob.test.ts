import { describe, expect, it } from "vitest";
import { blobKeyPath } from "@/lib/store-kv";

describe("blob key paths", () => {
  it("gives every key its own namespaced file with no characters get() would re-encode", () => {
    const env = { VERCEL_ENV: "production" };
    const paths = ["scan:abc", "scan:abd", "user-email:a+b@x.com", "idx-anon-scans:9a2d"].map((k) => blobKeyPath(k, env));
    for (const p of paths) {
      expect(p.startsWith("apphole/prod/kv/")).toBe(true);
      expect(p).toMatch(/^[A-Za-z0-9/_.-]+$/);
    }
    expect(new Set(paths).size).toBe(paths.length);
  });
});
