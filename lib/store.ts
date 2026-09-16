import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { customAlphabet } from "nanoid";
import type { PlugLead, ScanRecord, UserRecord } from "@/lib/scans/types";
import { getConfiguredKv, resetKvCache, resolveStoreKind, type Kv } from "@/lib/store-kv";

export { resolveStoreKind, storeNamespace } from "@/lib/store-kv";

type Db = {
  users: UserRecord[];
  scans: ScanRecord[];
  plugLeads: PlugLead[];
};

const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 16);

const memory: { db: Db | null } = { db: null };
let queue: Promise<void> = Promise.resolve();
let loadedPath: string | null = null;

const STORAGE_UNCONFIGURED =
  "Could not save the scan. Production storage is not configured. Set BLOB_READ_WRITE_TOKEN, DATABASE_URL, or KV_REST_API_URL.";

function dataDir() {
  if (process.env.APPHOLE_DATA_DIR) return process.env.APPHOLE_DATA_DIR;
  return process.env.VERCEL ? path.join("/tmp", "apphole") : path.join(process.cwd(), "data");
}

function dbPath() {
  return path.join(dataDir(), "store.json");
}

function normalize(raw: Partial<Db> | null): Db {
  return {
    users: raw?.users ?? [],
    scans: raw?.scans ?? [],
    plugLeads: raw?.plugLeads ?? [],
  };
}

export function resetStoreCache() {
  memory.db = null;
  loadedPath = null;
  queue = Promise.resolve();
  resetKvCache();
}

async function loadFile(): Promise<Db> {
  const file = dbPath();
  if (loadedPath !== file) {
    memory.db = null;
    loadedPath = file;
  }
  try {
    const raw = await readFile(file, "utf8");
    memory.db = normalize(JSON.parse(raw) as Partial<Db>);
  } catch {
    memory.db = normalize(null);
  }
  return memory.db;
}

async function persistFile(db: Db) {
  memory.db = db;
  await mkdir(dataDir(), { recursive: true });
  await writeFile(dbPath(), JSON.stringify(db, null, 2), "utf8");
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readJson<T>(kv: Kv, key: string): Promise<T | undefined> {
  const raw = await kv.get(key);
  if (!raw) return undefined;
  return JSON.parse(raw) as T;
}

async function writeJson(kv: Kv, key: string, value: unknown) {
  await kv.set(key, JSON.stringify(value));
}

async function readIds(kv: Kv, key: string): Promise<string[]> {
  return (await readJson<string[]>(kv, key)) ?? [];
}

async function pushIndexedId(kv: Kv, key: string, id: string) {
  const ids = await readIds(kv, key);
  await writeJson(kv, key, [id, ...ids.filter((item) => item !== id)].slice(0, 400));
}

async function kvOrFile(write: boolean): Promise<{ kv: Kv } | { file: true }> {
  const kv = await getConfiguredKv();
  if (kv) return { kv };
  if (write && process.env.VERCEL && resolveStoreKind() === "file") {
    throw new Error(STORAGE_UNCONFIGURED);
  }
  return { file: true };
}

export async function createUser(input: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
  return withLock(async () => {
    const backend = await kvOrFile(true);
    if ("kv" in backend) {
      const emailKey = `user-email:${input.email.toLowerCase()}`;
      const existingId = await backend.kv.get(emailKey);
      if (existingId) throw new Error("An account with that email already exists.");
      const user: UserRecord = { ...input, id: nanoid(16), createdAt: new Date().toISOString() };
      await writeJson(backend.kv, `user:${user.id}`, user);
      await backend.kv.set(emailKey, user.id);
      if (user.stripeCustomerId) await backend.kv.set(`user-stripe:${user.stripeCustomerId}`, user.id);
      return user;
    }
    const db = await loadFile();
    if (db.users.some((u) => u.email === input.email)) {
      throw new Error("An account with that email already exists.");
    }
    const user: UserRecord = { ...input, id: nanoid(16), createdAt: new Date().toISOString() };
    db.users.push(user);
    await persistFile(db);
    return user;
  });
}

export async function getUserByEmail(email: string): Promise<UserRecord | undefined> {
  const backend = await kvOrFile(false);
  const lower = email.toLowerCase();
  if ("kv" in backend) {
    const id = await backend.kv.get(`user-email:${lower}`);
    if (!id) return undefined;
    return readJson<UserRecord>(backend.kv, `user:${id}`);
  }
  const db = await loadFile();
  return db.users.find((u) => u.email === lower);
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const backend = await kvOrFile(false);
  if ("kv" in backend) return readJson<UserRecord>(backend.kv, `user:${id}`);
  const db = await loadFile();
  return db.users.find((u) => u.id === id);
}

export async function updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord | undefined> {
  return withLock(async () => {
    const backend = await kvOrFile(true);
    if ("kv" in backend) {
      const current = await readJson<UserRecord>(backend.kv, `user:${id}`);
      if (!current) return undefined;
      const next = { ...current, ...patch };
      await writeJson(backend.kv, `user:${next.id}`, next);
      await backend.kv.set(`user-email:${next.email.toLowerCase()}`, next.id);
      if (current.stripeCustomerId && current.stripeCustomerId !== next.stripeCustomerId) {
        await backend.kv.set(`user-stripe:${current.stripeCustomerId}`, "");
      }
      if (next.stripeCustomerId) await backend.kv.set(`user-stripe:${next.stripeCustomerId}`, next.id);
      return next;
    }
    const db = await loadFile();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx < 0) return undefined;
    db.users[idx] = { ...db.users[idx], ...patch };
    await persistFile(db);
    return db.users[idx];
  });
}

export async function getUserByStripeCustomer(customerId: string): Promise<UserRecord | undefined> {
  const backend = await kvOrFile(false);
  if ("kv" in backend) {
    const id = await backend.kv.get(`user-stripe:${customerId}`);
    if (!id) return undefined;
    return readJson<UserRecord>(backend.kv, `user:${id}`);
  }
  const db = await loadFile();
  return db.users.find((u) => u.stripeCustomerId === customerId);
}

export async function createScan(input: Omit<ScanRecord, "id" | "createdAt" | "status" | "progress">): Promise<ScanRecord> {
  return withLock(async () => {
    const backend = await kvOrFile(true);
    const scan: ScanRecord = {
      ...input,
      id: nanoid(16),
      status: "queued",
      createdAt: new Date().toISOString(),
      progress: { percent: 1, step: "queued", message: "Scan queued." },
    };
    if ("kv" in backend) {
      await writeJson(backend.kv, `scan:${scan.id}`, scan);
      if (scan.userId) await pushIndexedId(backend.kv, `idx-user-scans:${scan.userId}`, scan.id);
      await pushIndexedId(backend.kv, `idx-anon-scans:${scan.anonymousId}`, scan.id);
      return scan;
    }
    const db = await loadFile();
    db.scans.unshift(scan);
    db.scans = db.scans.slice(0, 400);
    await persistFile(db);
    return scan;
  });
}

export async function updateScan(id: string, patch: Partial<ScanRecord>): Promise<ScanRecord | undefined> {
  return withLock(async () => {
    const backend = await kvOrFile(true);
    if ("kv" in backend) {
      const current = await readJson<ScanRecord>(backend.kv, `scan:${id}`);
      if (!current) return undefined;
      const next = { ...current, ...patch };
      await writeJson(backend.kv, `scan:${id}`, next);
      return next;
    }
    const db = await loadFile();
    const idx = db.scans.findIndex((s) => s.id === id);
    if (idx < 0) return undefined;
    db.scans[idx] = { ...db.scans[idx], ...patch };
    await persistFile(db);
    return db.scans[idx];
  });
}

export async function getScan(id: string): Promise<ScanRecord | undefined> {
  const backend = await kvOrFile(false);
  if ("kv" in backend) return readJson<ScanRecord>(backend.kv, `scan:${id}`);
  const db = await loadFile();
  return db.scans.find((s) => s.id === id);
}

export function toPublicScan(scan: ScanRecord): Omit<ScanRecord, "userId" | "anonymousId"> {
  const { userId: _userId, anonymousId: _anonymousId, ...rest } = scan;
  return rest;
}

export async function listScansFor(opts: { userId?: string; anonymousId?: string }): Promise<ScanRecord[]> {
  if (!opts.userId && !opts.anonymousId) return [];
  const backend = await kvOrFile(false);
  if ("kv" in backend) {
    const ids = new Set<string>();
    if (opts.userId) for (const id of await readIds(backend.kv, `idx-user-scans:${opts.userId}`)) ids.add(id);
    if (opts.anonymousId) for (const id of await readIds(backend.kv, `idx-anon-scans:${opts.anonymousId}`)) ids.add(id);
    const scans = (
      await Promise.all([...ids].map((id) => readJson<ScanRecord>(backend.kv, `scan:${id}`)))
    ).filter((scan): scan is ScanRecord => Boolean(scan));
    return scans.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  const db = await loadFile();
  return db.scans.filter((s) => {
    if (opts.userId && s.userId === opts.userId) return true;
    if (opts.anonymousId && s.anonymousId === opts.anonymousId) return true;
    return false;
  });
}

export async function countScansThisMonth(opts: { userId?: string; anonymousId?: string }): Promise<number> {
  const scans = await listScansFor(opts);
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 31;
  return scans.filter((s) => new Date(s.createdAt).getTime() > cutoff && s.status !== "failed").length;
}

export async function createPlugLead(input: Omit<PlugLead, "id" | "createdAt">): Promise<PlugLead> {
  return withLock(async () => {
    const backend = await kvOrFile(true);
    const lead: PlugLead = {
      ...input,
      id: nanoid(16),
      createdAt: new Date().toISOString(),
    };
    if ("kv" in backend) {
      await writeJson(backend.kv, `lead:${lead.id}`, lead);
      return lead;
    }
    const db = await loadFile();
    db.plugLeads.unshift(lead);
    db.plugLeads = db.plugLeads.slice(0, 2000);
    await persistFile(db);
    return lead;
  });
}

export async function updatePlugLead(id: string, patch: Partial<PlugLead>): Promise<PlugLead | undefined> {
  return withLock(async () => {
    const backend = await kvOrFile(true);
    if ("kv" in backend) {
      const current = await readJson<PlugLead>(backend.kv, `lead:${id}`);
      if (!current) return undefined;
      const next = { ...current, ...patch };
      await writeJson(backend.kv, `lead:${id}`, next);
      return next;
    }
    const db = await loadFile();
    const idx = db.plugLeads.findIndex((lead) => lead.id === id);
    if (idx < 0) return undefined;
    db.plugLeads[idx] = { ...db.plugLeads[idx], ...patch };
    await persistFile(db);
    return db.plugLeads[idx];
  });
}

export async function getPlugLead(id: string): Promise<PlugLead | undefined> {
  const backend = await kvOrFile(false);
  if ("kv" in backend) return readJson<PlugLead>(backend.kv, `lead:${id}`);
  const db = await loadFile();
  return db.plugLeads.find((lead) => lead.id === id);
}
