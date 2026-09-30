import { describe, expect, it } from "vitest";
import { inspectGithubRepo } from "@/lib/scans/github";
import { classifySubmission, parseGithubRepo } from "@/lib/submission";

describe("classifySubmission", () => {
  it("treats a GitHub repo as a realistic target, including tree links", () => {
    expect(parseGithubRepo("github.com/acme/widget")).toMatchObject({ owner: "acme", repo: "widget" });
    const tree = classifySubmission("https://github.com/acme/widget/tree/main");
    expect(tree.kind).toBe("github_repo");
    expect(tree.realistic).toBe(true);
    expect(tree.github?.url).toBe("https://github.com/acme/widget");
  });

  it("does not treat a GitHub profile or google.com as a product test", () => {
    expect(classifySubmission("https://github.com/acme").kind).toBe("common_site");
    const google = classifySubmission("google.com");
    expect(google.kind).toBe("common_site");
    expect(google.realistic).toBe(false);
  });

  it("keeps a normal product URL", () => {
    const site = classifySubmission("https://myapp.example");
    expect(site.kind).toBe("product_site");
    expect(site.realistic).toBe(true);
  });
});

describe("inspectGithubRepo", () => {
  it("flags a public repo with no live URL and a root env file", async () => {
    const fetchText = async (url: string) => {
      if (url.endsWith("/readme")) return { status: 404, body: "" };
      if (url.includes("/contents")) {
        return { status: 200, body: JSON.stringify([{ name: ".env", type: "file" }, { name: "README.md", type: "file" }]) };
      }
      return {
        status: 200,
        body: JSON.stringify({
          description: "A thing",
          homepage: "",
          default_branch: "main",
          license: null,
        }),
      };
    };
    const report = await inspectGithubRepo({ owner: "acme", repo: "widget", url: "https://github.com/acme/widget" }, fetchText);
    expect(report.liveUrl).toBeNull();
    expect(report.findings.some((item) => item.title === "No live app URL in the repo")).toBe(true);
    expect(report.findings.some((item) => item.title === "Possible secret file in the repo root")).toBe(true);
  });

  it("returns the live URL named by the repo", async () => {
    const fetchText = async (url: string) => {
      if (url.endsWith("/readme")) {
        return {
          status: 200,
          body: JSON.stringify({ encoding: "base64", content: Buffer.from("Try https://myapp.example").toString("base64") }),
        };
      }
      if (url.includes("/contents")) return { status: 200, body: "[]" };
      return { status: 200, body: JSON.stringify({ homepage: "", default_branch: "main", license: { spdx_id: "MIT" } }) };
    };
    const report = await inspectGithubRepo({ owner: "acme", repo: "widget", url: "https://github.com/acme/widget" }, fetchText);
    expect(report.liveUrl).toBe("https://myapp.example/");
  });
});
