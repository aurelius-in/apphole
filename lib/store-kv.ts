export type StoreKind = "postgres" | "redis" | "blob" | "file";

export type Kv = {
  name: Exclude<StoreKind, "file">;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
};

type Env = Record<string, string | undefined>;

export function storeNamespace(env: Env = process.env): string {
  if (env.APPHOLE_STORE_NS?.trim()) return env.APPHOLE_STORE_NS.trim();
  if (env.VERCEL_ENV === "production") return "prod";
  if (env.VERCEL_ENV === "preview") return "preview";
  return "local";
}

export function resolveStoreKind(env: Env = process.env): StoreKind {
  if (env.DATABASE_URL?.trim()) return "postgres";
  const redisUrl = env.KV_REST_API_URL?.trim() || env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = env.KV_REST_API_TOKEN?.trim() || env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (redisUrl && redisToken) return "redis";
  if (env.BLOB_READ_WRITE_TOKEN?.trim() || env.BLOB_STORE_ID?.trim()) return "blob";
  return "file";
}

function namespacedKey(key: string): string {
  return `apphole:${storeNamespace()}:${key}`;
}

async function redisCommand(url: string, token: string, command: string[]): Promise<unknown> {
  const res = await fetch(url.replace(/\/$/, ""), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (!res.ok || json.error) {
    throw new Error(json.error || `Redis store ${res.status}`);
  }
  return json.result ?? null;
}

function redisKv(url: string, token: string): Kv {
  return {
    name: "redis",
    async get(key: string) {
      const result = await redisCommand(url, token, ["GET", namespacedKey(key)]);
      return typeof result === "string" ? result : null;
    },
    async set(key: string, value: string) {
      await redisCommand(url, token, ["SET", namespacedKey(key), value]);
    },
  };
}

async function blobKv(): Promise<Kv> {
  const { get, put, BlobNotFoundError } = await import("@vercel/blob");
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const auth = token ? { token } : {};
  const pathnameFor = (key: string) =>
    `apphole/${storeNamespace()}/${key.replace(/:/g, "/").replace(/[^a-zA-Z0-9._/-]+/g, "_")}.json`;

  return {
    name: "blob",
    async get(key: string) {
      try {
        const result = await get(pathnameFor(key), {
          access: "private",
          useCache: false,
          ...auth,
        });
        if (!result || result.statusCode !== 200 || !result.stream) return null;
        return await new Response(result.stream).text();
      } catch (error) {
        if (error instanceof BlobNotFoundError) return null;
        throw error;
      }
    },
    async set(key: string, value: string) {
      await put(pathnameFor(key), value, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
        ...auth,
      });
    },
  };
}

async function postgresKv(): Promise<Kv> {
  const postgres = (await import("postgres")).default;
  const sql = postgres(process.env.DATABASE_URL!, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  await sql`CREATE TABLE IF NOT EXISTS apphole_kv (key text PRIMARY KEY, value text NOT NULL)`;
  return {
    name: "postgres",
    async get(key: string) {
      const rows = await sql<{ value: string }[]>`SELECT value FROM apphole_kv WHERE key = ${namespacedKey(key)}`;
      return rows[0]?.value ?? null;
    },
    async set(key: string, value: string) {
      await sql`
        INSERT INTO apphole_kv (key, value)
        VALUES (${namespacedKey(key)}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    },
  };
}

let cached: Promise<Kv | null> | null = null;
let logged = false;

export function resetKvCache() {
  cached = null;
  logged = false;
}

export function getConfiguredKv(): Promise<Kv | null> {
  if (!cached) cached = openKv();
  return cached;
}

async function openKv(): Promise<Kv | null> {
  const kind = resolveStoreKind();
  if (kind === "file") return null;
  const kv =
    kind === "postgres" ? await postgresKv() : kind === "redis" ? redisKv(
          (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)!.trim(),
          (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)!.trim(),
        ) : await blobKv();
  if (!logged) {
    logged = true;
    console.info(`[apphole] durable store: ${kv.name} (ns=${storeNamespace()})`);
  }
  return kv;
}
