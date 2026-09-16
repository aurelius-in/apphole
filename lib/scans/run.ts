import { SCAN_GAP_MS, pagesForPlan, type Plan } from "@/lib/plans";
import { runDeterministicChecks, sensitivePaths } from "@/lib/scans/checks";
import { fetchPage, probeStatus } from "@/lib/scans/http";
import { parseHtml, pickNextUrls } from "@/lib/scans/parse";
import { sortFindings, scoreVerdict } from "@/lib/scans/verdict";
import { enrichPlugs } from "@/lib/ai/plugs";
import { updateScan } from "@/lib/store";
import { assertPublicHttpUrl, tryPublicHttpUrl } from "@/lib/ssrf";
import type { ParsedPage } from "@/lib/scans/parse";
import type { ScanReport } from "@/lib/scans/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeScan(scanId: string, rawUrl: string, plan: Plan): Promise<ScanReport> {
  const startedAt = new Date().toISOString();
  await updateScan(scanId, {
    status: "running",
    startedAt,
    progress: { percent: 5, step: "preflight", message: "Checking that the URL is public and reachable." },
  });

  const url = await assertPublicHttpUrl(rawUrl);
  if (url.protocol === "http:") {
    url.protocol = "https:";
  }
  const origin = `${url.protocol}//${url.host}`;
  const homeUrl = url.toString();

  await updateScan(scanId, {
    progress: { percent: 12, step: "homepage", message: "Fetching the homepage." },
  });

  const homeFetch = await fetchPage(homeUrl);
  const home = parseHtml(homeFetch.snapshot, homeFetch.body || "<html></html>");
  const pages: ParsedPage[] = [home];

  const maxPages = pagesForPlan(plan);
  const discovered = pickNextUrls(home.snapshot.finalUrl || homeUrl, home.links, maxPages * 2);

  await updateScan(scanId, {
    progress: { percent: 28, step: "crawl", message: `Following ${Math.min(discovered.length, maxPages - 1)} public routes.` },
  });

  for (const next of discovered) {
    if (pages.length >= maxPages) break;
    if (pages.some((p) => p.snapshot.finalUrl.replace(/\/$/, "") === next.replace(/\/$/, ""))) continue;
    const publicNext = await tryPublicHttpUrl(next);
    if (!publicNext) continue;
    await sleep(SCAN_GAP_MS);
    const fetched = await fetchPage(publicNext);
    pages.push(parseHtml(fetched.snapshot, fetched.body || "<html></html>"));
    await updateScan(scanId, {
      progress: {
        percent: 28 + Math.round((pages.length / maxPages) * 40),
        step: "crawl",
        message: `Read ${pages.length} page${pages.length === 1 ? "" : "s"}.`,
      },
    });
  }

  await updateScan(scanId, {
    progress: { percent: 72, step: "probes", message: "Probing important public paths." },
  });

  const navCandidates = [...new Set(pages.flatMap((p) => p.links))].slice(0, plan === "pro" ? 20 : 10);
  const extras = sensitivePaths(origin);
  const probes = [];
  for (const candidate of navCandidates) {
    const publicCandidate = await tryPublicHttpUrl(candidate);
    if (!publicCandidate) continue;
    await sleep(80);
    probes.push(await probeStatus(publicCandidate));
  }
  const sensitiveProbes = [];
  for (const candidate of extras) {
    const publicCandidate = await tryPublicHttpUrl(candidate);
    if (!publicCandidate) continue;
    await sleep(80);
    sensitiveProbes.push(await probeStatus(publicCandidate));
  }

  await updateScan(scanId, {
    progress: { percent: 84, step: "analyze", message: "Classifying holes. Not inventing extras." },
  });

  const { findings, checked, couldNotVerify } = await runDeterministicChecks({
    origin,
    home,
    pages,
    probes,
    sensitiveProbes,
  });
  const withPlugs = await enrichPlugs(findings);
  const ranked = sortFindings(withPlugs);
  const scored = scoreVerdict(ranked);

  const completedAt = new Date().toISOString();
  const report: ScanReport = {
    url: homeUrl,
    startedAt,
    completedAt,
    plan,
    mode: "http",
    pagesCrawled: pages.map((p) => p.snapshot),
    findings: ranked,
    verdict: scored.verdict,
    verdictSummary: scored.summary,
    holeCount: scored.holeCount,
    blockerCount: scored.blockerCount,
    testBeforeCount: scored.testBeforeCount,
    notBlockingCount: scored.notBlockingCount,
    unverifiedCount: scored.unverifiedCount,
    passCount: scored.passCount,
    checked,
    couldNotVerify,
  };

  await updateScan(scanId, {
    status: "complete",
    completedAt,
    report,
    progress: { percent: 100, step: "done", message: "Report ready." },
  });

  return report;
}
