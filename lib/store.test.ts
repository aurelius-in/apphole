import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveStoreKind } from "@/lib/store-kv";
import {
  countScansThisMonth,
  createPlugLead,
  createScan,
  createUser,
  getPlugLead,
  getScan,
  getUserByEmail,
  listScansFor,
  resetStoreCache,
  toPublicScan,
  updateScan,
} from "@/lib/store";

function clearRemoteEnv() {
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  delete process.env.DATABASE_URL;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  delete process.env.APPHOLE_STORE_NS;
}

describe("resolveStoreKind", () => {
  it("prefers postgres, then redis, then blob, then file", () => {
    expect(resolveStoreKind({})).toBe("file");
    expect(resolveStoreKind({ DATABASE_URL: "postgres://localhost/apphole" })).toBe("postgres");
    expect(
      resolveStoreKind({
        KV_REST_API_URL: "https://kv.example",
        KV_REST_API_TOKEN: "token",
      }),
    ).toBe("redis");
    expect(resolveStoreKind({ BLOB_READ_WRITE_TOKEN: "vercel_blob_rw" })).toBe("blob");
    expect(resolveStoreKind({ BLOB_STORE_ID: "store_123" })).toBe("blob");
  });
});

describe("file store", () => {
  let dir = "";

  beforeEach(async () => {
    clearRemoteEnv();
    dir = await mkdtemp(path.join(os.tmpdir(), "apphole-store-"));
    process.env.APPHOLE_DATA_DIR = dir;
    resetStoreCache();
  });

  afterEach(async () => {
    resetStoreCache();
    delete process.env.APPHOLE_DATA_DIR;
    delete process.env.VERCEL;
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it("creates a scan that can be read back by id", async () => {
    const scan = await createScan({
      url: "https://example.com",
      authorized: true,
      plan: "free",
      anonymousId: "anon-1",
    });
    const found = await getScan(scan.id);
    expect(found?.id).toBe(scan.id);
    expect(found?.status).toBe("queued");
    expect(found?.url).toBe("https://example.com");
  });

  it("updates scan progress without losing the record", async () => {
    const scan = await createScan({
      url: "https://example.com",
      authorized: true,
      plan: "free",
      anonymousId: "anon-1",
    });
    await updateScan(scan.id, {
      status: "running",
      progress: { percent: 40, step: "crawl", message: "Reading pages." },
    });
    const found = await getScan(scan.id);
    expect(found?.status).toBe("running");
    expect(found?.progress.percent).toBe(40);
  });

  it("counts recent scans for quota", async () => {
    await createScan({ url: "https://example.com", authorized: true, plan: "free", anonymousId: "anon-1" });
    await createScan({ url: "https://example.org", authorized: true, plan: "free", anonymousId: "anon-1" });
    expect(await countScansThisMonth({ anonymousId: "anon-1" })).toBe(2);
    expect(await countScansThisMonth({ anonymousId: "someone-else" })).toBe(0);
    expect(await listScansFor({})).toEqual([]);
  });

  it("stores users and plug leads", async () => {
    const user = await createUser({
      email: "founder@example.com",
      passwordHash: "salt:hash",
      plan: "free",
      planStatus: "inactive",
    });
    expect((await getUserByEmail("FOUNDER@example.com"))?.id).toBe(user.id);
    await expect(
      createUser({
        email: "founder@example.com",
        passwordHash: "salt:hash",
        plan: "free",
        planStatus: "inactive",
      }),
    ).rejects.toThrow(/already exists/);

    const lead = await createPlugLead({
      email: "founder@example.com",
      description: "Checkout fails on mobile before Stripe opens.",
      source: "report",
      scanId: "scan_1",
      findings: [
        { id: "ex_1", title: "Checkout fails on mobile" },
        { id: "ex_3", title: "Password reset link is broken" },
      ],
      findingId: "ex_1",
      findingTitle: "Checkout fails on mobile",
    });
    const stored = await getPlugLead(lead.id);
    expect(stored?.email).toBe("founder@example.com");
    expect(stored?.findings).toHaveLength(2);
    expect(stored?.findings?.[1].id).toBe("ex_3");
  });

  it("omits owner ids from the public scan payload", async () => {
    const scan = await createScan({
      url: "https://example.com",
      authorized: true,
      plan: "free",
      anonymousId: "anon-secret",
      userId: "user-secret",
    });
    const pub = toPublicScan({
      ...scan,
      error: "ECONNREFUSED 127.0.0.1:5432 at /var/task/lib/store.ts",
    });
    expect(pub.id).toBe(scan.id);
    expect("anonymousId" in pub).toBe(false);
    expect("userId" in pub).toBe(false);
    expect(pub.error).toBe("The scan stopped before a report could be produced.");
  });

  it("refuses file writes on Vercel when no durable store is configured", async () => {
    process.env.VERCEL = "1";
    resetStoreCache();
    await expect(
      createScan({
        url: "https://example.com",
        authorized: true,
        plan: "free",
        anonymousId: "anon-1",
      }),
    ).rejects.toThrow(/Production storage is not configured/);
  });
});
