export type SubmissionKind = "github_repo" | "product_site" | "common_site" | "invalid";

export type GithubRepo = {
  owner: string;
  repo: string;
  url: string;
};

export type ClassifiedSubmission = {
  raw: string;
  normalized: string;
  host: string;
  kind: SubmissionKind;
  realistic: boolean;
  note: string;
  github?: GithubRepo;
};

const RESERVED_OWNERS = new Set([
  "about",
  "apps",
  "collections",
  "copilot",
  "customer-stories",
  "explore",
  "features",
  "issues",
  "login",
  "marketplace",
  "new",
  "notifications",
  "orgs",
  "organizations",
  "pricing",
  "pulls",
  "readme",
  "security",
  "settings",
  "signup",
  "site",
  "sponsors",
  "topics",
]);

/** Consumer properties people paste when they are poking the form, not testing a product. */
const COMMON_HOSTS = new Set([
  "google.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "amazon.com",
  "wikipedia.org",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "reddit.com",
  "netflix.com",
  "apple.com",
  "microsoft.com",
  "bing.com",
  "yahoo.com",
  "linkedin.com",
  "github.com",
]);

function hostKey(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}

export function normalizeSubmittedUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#]|$)/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function parseGithubRepo(raw: string): GithubRepo | null {
  let url: URL;
  try {
    url = new URL(normalizeSubmittedUrl(raw));
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (hostKey(url.hostname) !== "github.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  if (!owner || !repo) return null;
  if (RESERVED_OWNERS.has(owner.toLowerCase())) return null;
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null;
  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
  };
}

export function classifySubmission(raw: string): ClassifiedSubmission {
  const trimmed = raw.trim();
  const normalized = normalizeSubmittedUrl(trimmed);
  let url: URL | null = null;
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") url = parsed;
  } catch {
    url = null;
  }
  if (!url || !url.hostname) {
    return {
      raw: trimmed,
      normalized,
      host: "",
      kind: "invalid",
      realistic: false,
      note: "Not a usable http URL",
    };
  }
  const host = hostKey(url.hostname);
  const github = parseGithubRepo(normalized);
  if (github) {
    return {
      raw: trimmed,
      normalized: github.url,
      host: "github.com",
      kind: "github_repo",
      realistic: true,
      note: `Public GitHub repo ${github.owner}/${github.repo}`,
      github,
    };
  }
  if (COMMON_HOSTS.has(host) || [...COMMON_HOSTS].some((item) => host.endsWith(`.${item}`))) {
    return {
      raw: trimmed,
      normalized: url.toString(),
      host,
      kind: "common_site",
      realistic: false,
      note: "Common site, not a product under test",
    };
  }
  return {
    raw: trimmed,
    normalized: url.toString(),
    host,
    kind: "product_site",
    realistic: true,
    note: "Looks like a product URL",
  };
}
