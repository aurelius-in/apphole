import { finding } from "@/lib/scans/finding";
import { SECRET_RE } from "@/lib/scans/parse";
import type { GithubRepo } from "@/lib/submission";
import type { Finding } from "@/lib/scans/types";

export type GithubFetch = (url: string) => Promise<{ status: number; body: string }>;

export type GithubInspection = {
  findings: Finding[];
  checked: string[];
  couldNotVerify: string[];
  liveUrl: string | null;
  reachable: boolean;
};

type RepoPayload = {
  private?: boolean;
  archived?: boolean;
  description?: string | null;
  homepage?: string | null;
  license?: { spdx_id?: string | null } | null;
  default_branch?: string;
  message?: string;
  html_url?: string;
};

type ContentItem = { name?: string; type?: string };

const LEAK_NAMES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  "credentials.json",
  "id_rsa",
  "secrets.json",
  "serviceaccount.json",
]);

function decodeReadme(payload: { content?: string; encoding?: string } | null): string {
  if (!payload?.content || payload.encoding !== "base64") return "";
  try {
    return Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf8");
  } catch {
    return "";
  }
}

function externalProductUrl(readme: string, homepage: string): string | null {
  const candidates = [homepage, ...readme.match(/https?:\/\/[^\s)>\]]+/gi) ?? []];
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "github.com" || host.endsWith(".github.com")) continue;
      if (host === "shields.io" || host.endsWith(".shields.io")) continue;
      return url.toString();
    } catch {
      /* skip */
    }
  }
  return null;
}

export async function inspectGithubRepo(repo: GithubRepo, fetchText: GithubFetch): Promise<GithubInspection> {
  const findings: Finding[] = [];
  const checked: string[] = ["Public GitHub repository"];
  const couldNotVerify: string[] = [];
  const headers = `https://api.github.com/repos/${repo.owner}/${repo.repo}`;
  const repoRes = await fetchText(headers);
  if (repoRes.status === 404) {
    findings.push(
      finding({
        category: "core_functionality",
        title: "Public repo was not readable",
        observed: `${repo.url} did not return a public repository. It may be private, renamed, or mistyped.`,
        expected: "A GitHub check needs a public repository AppHole is allowed to read.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.9,
        url: repo.url,
        whyItMatters: "If buyers and this check cannot open the repo, there is no public product to evaluate.",
        recommendedPlug: "Make the repository public, or paste the live app URL instead.",
        evidence: [{ type: "http", label: "status", value: "404", url: repo.url }],
      }),
    );
    return { findings, checked, couldNotVerify, liveUrl: null, reachable: false };
  }
  if (repoRes.status === 403 || repoRes.status === 429) {
    couldNotVerify.push("GitHub API rate limit");
    findings.push(
      finding({
        category: "core_functionality",
        title: "GitHub did not return the repo",
        observed: `GitHub responded ${repoRes.status} for ${repo.owner}/${repo.repo}.`,
        expected: "The public repo API should be readable.",
        disposition: "COULDNT_VERIFY",
        severity: "medium",
        confidence: 0.6,
        url: repo.url,
        whyItMatters: "Without the repo metadata, AppHole cannot tell whether a live app exists.",
        recommendedPlug: "Retry the check later, or paste the live app URL.",
        evidence: [{ type: "http", label: "status", value: String(repoRes.status) }],
      }),
    );
    return { findings, checked, couldNotVerify, liveUrl: null, reachable: false };
  }
  if (repoRes.status >= 400) {
    couldNotVerify.push("GitHub repository metadata");
    return { findings, checked, couldNotVerify, liveUrl: null, reachable: false };
  }

  const meta = JSON.parse(repoRes.body) as RepoPayload;
  findings.push(
    finding({
      category: "core_functionality",
      title: "Public repository is readable",
      observed: `${repo.url} is public${meta.archived ? " and archived" : ""}. ${meta.description ? `Description: ${meta.description}` : "No description is set."}`,
      expected: "The repository AppHole was given should be publicly readable.",
      disposition: "PASS",
      severity: "info",
      confidence: 0.95,
      url: repo.url,
      whyItMatters: "A public repo is the stand-in when the app is not on a website yet.",
      recommendedPlug: "No plug required for repository visibility.",
      evidence: [{ type: "link", label: "repo", value: repo.url, url: repo.url }],
    }),
  );

  const branch = meta.default_branch || "HEAD";
  const [readmeRes, rootRes] = await Promise.all([
    fetchText(`${headers}/readme`),
    fetchText(`${headers}/contents?ref=${encodeURIComponent(branch)}`),
  ]);
  const readme = readmeRes.status === 200 ? decodeReadme(JSON.parse(readmeRes.body) as { content?: string; encoding?: string }) : "";
  checked.push("README");
  if (!readme) {
    findings.push(
      finding({
        category: "copy",
        title: "No README on the public repo",
        observed: `${repo.url} has no readable README.`,
        expected: "A public app repo should say what the product is and where to try it.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "medium",
        confidence: 0.85,
        url: repo.url,
        whyItMatters: "Without a README, a stranger cannot tell what to click, buy, or trust.",
        recommendedPlug: "Add a README with the product, the live URL if one exists, and how a new user starts.",
      }),
    );
  }

  checked.push("Live product URL");
  const liveUrl = externalProductUrl(readme, meta.homepage || "");
  if (!liveUrl) {
    findings.push(
      finding({
        category: "core_functionality",
        title: "No live app URL in the repo",
        observed: "The GitHub homepage field is empty and the README does not link to a site outside GitHub.",
        expected: "Buyers need a public app URL, unless the product is intentionally repo-only.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.8,
        url: repo.url,
        whyItMatters: "A repo is not a product a customer can open. AppHole checked the public files because no website was given.",
        recommendedPlug: "Deploy the app, then put that URL in the repository homepage field and the README.",
        evidence: [{ type: "note", label: "homepage", value: meta.homepage || "(empty)" }],
      }),
    );
  } else {
    findings.push(
      finding({
        category: "core_functionality",
        title: "Repo points at a live URL",
        observed: `Found ${liveUrl} on the repository. AppHole will check that site as the product.`,
        expected: "A GitHub project that names a website should use a public http URL.",
        disposition: "PASS",
        severity: "info",
        confidence: 0.8,
        url: liveUrl,
        whyItMatters: "The live URL is what a customer would actually open.",
        recommendedPlug: "No plug required for having a product URL.",
        evidence: [{ type: "link", label: "live", value: liveUrl, url: liveUrl }],
      }),
    );
  }

  checked.push("License");
  if (!meta.license?.spdx_id) {
    findings.push(
      finding({
        category: "trust",
        title: "No license on the public repo",
        observed: `${repo.owner}/${repo.repo} does not list a license.`,
        expected: "A public repository should say what others may do with the code.",
        disposition: "NOT_BLOCKING_A_SALE",
        severity: "low",
        confidence: 0.7,
        url: repo.url,
        whyItMatters: "Missing license is a trust gap. It does not by itself stop a buyer from paying.",
        recommendedPlug: "Add a license file if the repo is meant to be public.",
      }),
    );
  }

  checked.push("Root files");
  if (rootRes.status === 200) {
    const items = JSON.parse(rootRes.body) as ContentItem[];
    const names = Array.isArray(items) ? items.map((item) => (item.name || "").toLowerCase()) : [];
    const leaked = names.filter((name) => LEAK_NAMES.has(name) || name.endsWith(".pem"));
    if (leaked.length) {
      findings.push(
        finding({
          category: "security",
          title: "Possible secret file in the repo root",
          observed: `Root listing includes ${leaked.join(", ")}.`,
          expected: "Secret files should not be in a public repository.",
          disposition: "FIX_BEFORE_SELLING",
          severity: "critical",
          confidence: 0.75,
          url: repo.url,
          whyItMatters: "A public env file or key can expose the product before anyone becomes a customer.",
          recommendedPlug: "Remove the file from the repo and from git history, rotate the secret, and keep it out of the tree.",
          evidence: leaked.map((name) => ({ type: "note" as const, label: "file", value: name })),
        }),
      );
    }
  } else {
    couldNotVerify.push("Repository root listing");
  }

  if (readme && SECRET_RE.test(readme)) {
    findings.push(
      finding({
        category: "security",
        title: "README contains a secret-shaped value",
        observed: "The README matches a live key or private key pattern.",
        expected: "Public docs should not contain credentials.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "critical",
        confidence: 0.7,
        url: repo.url,
        whyItMatters: "A key in the README is public the moment the repo is.",
        recommendedPlug: "Remove the value, rotate it, and replace it with a placeholder.",
      }),
    );
  }

  return { findings, checked, couldNotVerify, liveUrl, reachable: true };
}

export const githubFetch: GithubFetch = async (url) => {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "AppHole",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    redirect: "manual",
  });
  return { status: res.status, body: await res.text() };
};
