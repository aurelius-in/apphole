import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { customAlphabet } from "nanoid";
import type { ScanRecord, UserRecord } from "@/lib/scans/types";

type Db = {
  users: UserRecord[];
  scans: ScanRecord[];
};

const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 16);

const memory: { db: Db | null } = { db: null };
let queue: Promise<void> = Promise.resolve();

function dataDir() {
  return process.env.VERCEL ? path.join("/tmp", "apphole") : path.join(process.cwd(), "data");
}

function dbPath() {
  return path.join(dataDir(), "store.json");
}

async function load(): Promise<Db> {
  try {
    const raw = await readFile(dbPath(), "utf8");
    memory.db = JSON.parse(raw) as Db;
  } catch {
    memory.db = memory.db ?? { users: [], scans: [] };
  }
  return memory.db;
}

async function persist(db: Db) {
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

export async function createUser(input: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
  return withLock(async () => {
    const db = await load();
    if (db.users.some((u) => u.email === input.email)) {
      throw new Error("An account with that email already exists.");
    }
    const user: UserRecord = { ...input, id: nanoid(16), createdAt: new Date().toISOString() };
    db.users.push(user);
    await persist(db);
    return user;
  });
}

export async function getUserByEmail(email: string): Promise<UserRecord | undefined> {
  const db = await load();
  return db.users.find((u) => u.email === email.toLowerCase());
}

export async function getUserById(id: string): Promise<UserRecord | undefined> {
  const db = await load();
  return db.users.find((u) => u.id === id);
}

export async function updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord | undefined> {
  return withLock(async () => {
    const db = await load();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx < 0) return undefined;
    db.users[idx] = { ...db.users[idx], ...patch };
    await persist(db);
    return db.users[idx];
  });
}

export async function getUserByStripeCustomer(customerId: string): Promise<UserRecord | undefined> {
  const db = await load();
  return db.users.find((u) => u.stripeCustomerId === customerId);
}

export async function createScan(input: Omit<ScanRecord, "id" | "createdAt" | "status" | "progress">): Promise<ScanRecord> {
  return withLock(async () => {
    const db = await load();
    const scan: ScanRecord = {
      ...input,
      id: nanoid(16),
      status: "queued",
      createdAt: new Date().toISOString(),
      progress: { percent: 1, step: "queued", message: "Scan queued." },
    };
    db.scans.unshift(scan);
    db.scans = db.scans.slice(0, 400);
    await persist(db);
    return scan;
  });
}

export async function updateScan(id: string, patch: Partial<ScanRecord>): Promise<ScanRecord | undefined> {
  return withLock(async () => {
    const db = await load();
    const idx = db.scans.findIndex((s) => s.id === id);
    if (idx < 0) return undefined;
    db.scans[idx] = { ...db.scans[idx], ...patch };
    await persist(db);
    return db.scans[idx];
  });
}

export async function getScan(id: string): Promise<ScanRecord | undefined> {
  const db = await load();
  return db.scans.find((s) => s.id === id);
}

export async function listScansFor(opts: { userId?: string; anonymousId?: string }): Promise<ScanRecord[]> {
  const db = await load();
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
