import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const scrypt = promisify(scryptCb);
const COOKIE = "ah_session";

export function authSecretConfigured(): boolean {
  return (process.env.AUTH_SECRET?.trim().length || 0) >= 16;
}

function productionAuthRequired(): boolean {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}

function secretBytes() {
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 16) return new TextEncoder().encode(fromEnv);
  if (productionAuthRequired()) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  const fallback = createHash("sha256").update("apphole-local-dev-only").digest();
  return new Uint8Array(fallback);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const hash = Buffer.from(hashHex, "hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  if (derived.length !== hash.length) return false;
  return timingSafeEqual(derived, hash);
}

export async function setSession(userId: string) {
  if (productionAuthRequired() && !authSecretConfigured()) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretBytes());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  if (productionAuthRequired() && !authSecretConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretBytes());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getAnonymousId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get("ah_anon")?.value;
  if (existing) return existing;
  const id = randomBytes(12).toString("hex");
  jar.set("ah_anon", id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

export async function readAnonymousId(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get("ah_anon")?.value;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3333").replace(/\/$/, "");
}
