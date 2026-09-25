import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getConfiguredKv } from "@/lib/store-kv";
import { sanitizeActivity, type ActivityEvent } from "@/lib/activity-stats";

const MAX_EVENTS = 4000;
const KV_KEY = "activity:events";

let queue: Promise<void> = Promise.resolve();

function dataDir() {
  if (process.env.APPHOLE_DATA_DIR) return process.env.APPHOLE_DATA_DIR;
  return process.env.VERCEL ? path.join("/tmp", "apphole") : path.join(process.cwd(), "data");
}

function filePath() {
  return path.join(dataDir(), "activity.json");
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readFileEvents(): Promise<ActivityEvent[]> {
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as ActivityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileEvents(events: ActivityEvent[]) {
  await mkdir(dataDir(), { recursive: true });
  await writeFile(filePath(), JSON.stringify(events), "utf8");
}

export async function appendActivity(input: unknown): Promise<boolean> {
  const event = sanitizeActivity(input);
  if (!event) return false;
  return withLock(async () => {
    const kv = await getConfiguredKv();
    if (kv) {
      const existing = await readKv(kv);
      existing.push(event);
      await kv.set(KV_KEY, JSON.stringify(existing.slice(-MAX_EVENTS)));
      return true;
    }
    if (process.env.VERCEL) return false;
    const existing = await readFileEvents();
    existing.push(event);
    await writeFileEvents(existing.slice(-MAX_EVENTS));
    return true;
  });
}

export async function loadActivity(): Promise<ActivityEvent[]> {
  const kv = await getConfiguredKv();
  if (kv) return readKv(kv);
  return readFileEvents();
}

async function readKv(kv: { get(key: string): Promise<string | null> }): Promise<ActivityEvent[]> {
  const raw = await kv.get(KV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ActivityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
