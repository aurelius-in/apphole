import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google.com",
  "instance-data",
  "kubernetes.default.svc",
]);

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  const ranges: Array<[number, number]> = [
    [ipv4ToInt("0.0.0.0"), ipv4ToInt("0.255.255.255")],
    [ipv4ToInt("10.0.0.0"), ipv4ToInt("10.255.255.255")],
    [ipv4ToInt("100.64.0.0"), ipv4ToInt("100.127.255.255")],
    [ipv4ToInt("127.0.0.0"), ipv4ToInt("127.255.255.255")],
    [ipv4ToInt("169.254.0.0"), ipv4ToInt("169.254.255.255")],
    [ipv4ToInt("172.16.0.0"), ipv4ToInt("172.31.255.255")],
    [ipv4ToInt("192.168.0.0"), ipv4ToInt("192.168.255.255")],
    [ipv4ToInt("198.18.0.0"), ipv4ToInt("198.19.255.255")],
    [ipv4ToInt("224.0.0.0"), ipv4ToInt("255.255.255.255")],
  ];
  return ranges.some(([start, end]) => n >= start && n <= end);
}

function ipv4MappedFromV6(ip: string): string | null {
  const lower = ip.toLowerCase();
  const dotted = lower.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dotted?.[1]) return dotted[1];
  const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!hex) return null;
  const hi = Number.parseInt(hex[1], 16);
  const lo = Number.parseInt(hex[2], 16);
  return `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80")) return true;
  const mapped = ipv4MappedFromV6(lower);
  if (mapped) return isPrivateIPv4(mapped);
  return false;
}

export function isBlockedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true;
}

function normalizeHost(hostname: string): string {
  return hostname.replace(/^\[|\]$/g, "").replace(/\.+$/g, "").toLowerCase();
}

function hostIsBlockedName(host: string): boolean {
  if (!host) return true;
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host.endsWith(".localdomain")) return true;
  return false;
}

export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("Enter a valid URL, including https://");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs can be checked.");
  }
  const host = normalizeHost(url.hostname);
  if (hostIsBlockedName(host)) {
    throw new Error("That host is not allowed. AppHole only checks public apps you authorize.");
  }
  if (host === "0.0.0.0" || isIP(host)) {
    if (isBlockedIp(host)) {
      throw new Error("Private or local addresses cannot be scanned.");
    }
  } else {
    const records = await lookup(host, { all: true });
    if (!records.length) throw new Error("Could not resolve that hostname.");
    for (const record of records) {
      if (isBlockedIp(record.address)) {
        throw new Error("That hostname resolves to a private address and cannot be scanned.");
      }
    }
  }
  return url;
}

export async function assertPublicRedirect(from: string, location: string): Promise<string> {
  let next: URL;
  try {
    next = new URL(location, from);
  } catch {
    throw new Error("Redirect location is not a valid URL.");
  }
  const allowed = await assertPublicHttpUrl(next.toString());
  return allowed.toString();
}

export function isRedirectStatus(status: number): boolean {
  return REDIRECT_STATUS.has(status);
}

export async function tryPublicHttpUrl(raw: string): Promise<string | null> {
  try {
    return (await assertPublicHttpUrl(raw)).toString();
  } catch {
    return null;
  }
}

export function sameOrigin(a: string, b: string): boolean {
  try {
    const left = new URL(a);
    const right = new URL(b);
    return left.origin === right.origin;
  } catch {
    return false;
  }
}

export function absolutize(from: string, href: string): string | null {
  try {
    const url = new URL(href, from);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
