import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google.com",
  "instance-data",
]);

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  const ranges: Array<[number, number]> = [
    [ipv4ToInt("0.0.0.0"), ipv4ToInt("0.255.255.255")],
    [ipv4ToInt("10.0.0.0"), ipv4ToInt("10.255.255.255")],
    [ipv4ToInt("127.0.0.0"), ipv4ToInt("127.255.255.255")],
    [ipv4ToInt("169.254.0.0"), ipv4ToInt("169.254.255.255")],
    [ipv4ToInt("172.16.0.0"), ipv4ToInt("172.31.255.255")],
    [ipv4ToInt("192.168.0.0"), ipv4ToInt("192.168.255.255")],
    [ipv4ToInt("224.0.0.0"), ipv4ToInt("255.255.255.255")],
  ];
  return ranges.some(([start, end]) => n >= start && n <= end);
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  return (
    lower === "::1" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80") ||
    lower.startsWith("::ffff:127.") ||
    lower.startsWith("::ffff:10.") ||
    lower.startsWith("::ffff:192.168.")
  );
}

export function isBlockedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true;
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
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
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
