import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getConfiguredKv, resolveStoreKind, storeNamespace } from "@/lib/store-kv";
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

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

function eventPrefix() {
  return `apphole/${storeNamespace()}/activity/`;
}

/** One private blob per event. Never touches the shared store, so it cannot race scans or users. */
async function appendBlobEvent(event: ActivityEvent): Promise<boolean> {
  const { put } = await import("@vercel/blob");
  const now = Date.parse(event.ts) || Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  const id = `${now}-${Math.random().toString(36).slice(2, 8)}`;
  await put(`${eventPrefix()}${day}/${id}.json`, JSON.stringify(event), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    token: blobToken(),
  });
  return true;
}

async function loadBlobEvents(sinceMs: number | null): Promise<ActivityEvent[]> {
  const { list, get } = await import("@vercel/blob");
  const firstDay = sinceMs === null ? "" : new Date(sinceMs - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const paths: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: eventPrefix(), cursor, limit: 1000, token: blobToken() });
    for (const blob of page.blobs) {
      const day = blob.pathname.slice(eventPrefix().length, eventPrefix().length + 10);
      if (day >= firstDay) paths.push(blob.pathname);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && paths.length < MAX_EVENTS * 2);
  const recent = paths.sort().slice(-MAX_EVENTS);
  const events: ActivityEvent[] = [];
  for (let i = 0; i < recent.length; i += 25) {
    const batch = await Promise.all(
      recent.slice(i, i + 25).map(async (pathname) => {
        try {
          const result = await get(pathname, { access: "private", useCache: false, token: blobToken() });
          if (!result || result.statusCode !== 200 || !result.stream) return null;
          return JSON.parse(await new Response(result.stream).text()) as ActivityEvent;
        } catch {
          return null;
        }
      }),
    );
    for (const event of batch) if (event) events.push(event);
  }
  return events;
}

export async function appendActivity(input: unknown): Promise<boolean> {
  const event = sanitizeActivity(input);
  if (!event) return false;
  if (resolveStoreKind() === "blob" && blobToken()) return appendBlobEvent(event);
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

/** Only fetches days on or after `sinceMs` on the blob store, so short ranges stay fast. */
export async function loadActivity(sinceMs: number | null = null): Promise<ActivityEvent[]> {
  const kv = await getConfiguredKv();
  if (resolveStoreKind() === "blob" && blobToken()) {
    const [fresh, older] = await Promise.all([loadBlobEvents(sinceMs), kv ? readKv(kv) : Promise.resolve([])]);
    return [...older, ...fresh];
  }
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
