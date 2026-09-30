import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { customAlphabet } from "nanoid";
import { getConfiguredKv, type Kv } from "@/lib/store-kv";
import type { SubmissionKind } from "@/lib/submission";

export type IntakeOutcome = "started" | "rejected";

export type UrlIntake = {
  id: string;
  ts: string;
  raw: string;
  normalized: string;
  host: string;
  kind: SubmissionKind;
  realistic: boolean;
  note: string;
  outcome: IntakeOutcome;
  rejectReason?: string;
  scanId?: string;
  userId?: string;
  anonymousId: string;
};

const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 12);
const MAX = 500;
let queue: Promise<void> = Promise.resolve();

function dataDir() {
  if (process.env.APPHOLE_DATA_DIR) return process.env.APPHOLE_DATA_DIR;
  return process.env.VERCEL ? path.join("/tmp", "apphole") : path.join(process.cwd(), "data");
}

function filePath() {
  return path.join(dataDir(), "intakes.json");
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readFileIntakes(): Promise<UrlIntake[]> {
  try {
    const parsed = JSON.parse(await readFile(filePath(), "utf8")) as UrlIntake[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileIntakes(rows: UrlIntake[]) {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(filePath(), JSON.stringify(rows.slice(0, MAX), null, 2), "utf8");
}

async function kv(): Promise<Kv | null> {
  return getConfiguredKv();
}

export async function recordIntake(input: Omit<UrlIntake, "id" | "ts">): Promise<UrlIntake> {
  const row: UrlIntake = { ...input, id: nanoid(), ts: new Date().toISOString() };
  return withLock(async () => {
    const store = await kv();
    if (store) {
      await store.set(`intake:${row.id}`, JSON.stringify(row));
      const raw = await store.get("idx-intakes");
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      await store.set("idx-intakes", JSON.stringify([row.id, ...ids.filter((id) => id !== row.id)].slice(0, MAX)));
      return row;
    }
    const rows = await readFileIntakes();
    await writeFileIntakes([row, ...rows.filter((item) => item.id !== row.id)]);
    return row;
  });
}

export async function attachIntake(id: string, patch: Partial<Pick<UrlIntake, "outcome" | "rejectReason" | "scanId">>): Promise<void> {
  await withLock(async () => {
    const store = await kv();
    if (store) {
      const raw = await store.get(`intake:${id}`);
      if (!raw) return;
      const current = JSON.parse(raw) as UrlIntake;
      await store.set(`intake:${id}`, JSON.stringify({ ...current, ...patch }));
      return;
    }
    const rows = await readFileIntakes();
    const idx = rows.findIndex((row) => row.id === id);
    if (idx < 0) return;
    rows[idx] = { ...rows[idx], ...patch };
    await writeFileIntakes(rows);
  });
}

export async function listIntakes(): Promise<UrlIntake[]> {
  const store = await kv();
  if (store) {
    const raw = await store.get("idx-intakes");
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    const rows = await Promise.all(
      ids.map(async (id) => {
        const item = await store.get(`intake:${id}`);
        return item ? (JSON.parse(item) as UrlIntake) : null;
      }),
    );
    return rows.filter((row): row is UrlIntake => Boolean(row));
  }
  return readFileIntakes();
}
