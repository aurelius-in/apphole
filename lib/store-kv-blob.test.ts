import { describe, expect, it } from "vitest";
import { blobKeyPath } from "@/lib/store-kv";

describe("blob key paths", () => {
  it("gives every key its own namespaced file, safe for emails and colons", () => {
    expect(blobKeyPath("scan:abc", { VERCEL_ENV: "production" })).toBe("apphole/prod/kv/scan%3Aabc");
    expect(blobKeyPath("user-email:a+b@x.com", { VERCEL_ENV: "production" })).toBe("apphole/prod/kv/user-email%3Aa%2Bb%40x.com");
    expect(blobKeyPath("scan:abc", { VERCEL_ENV: "production" })).not.toBe(blobKeyPath("scan:abd", { VERCEL_ENV: "production" }));
  });
});
