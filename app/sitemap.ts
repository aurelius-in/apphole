import type { MetadataRoute } from "next";

const paths = ["", "/check", "/example", "/pricing", "/methodology", "/privacy", "/terms", "/contact", "/login", "/signup", "/go-pro"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://apphole.pro";
  return paths.map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
