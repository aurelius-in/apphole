"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackActivity } from "@/lib/activity-client";

const seenSections = new Set<string>();

export function ActivityTracker() {
  const pathname = usePathname();
  const entered = useRef(Date.now());
  const pathRef = useRef(pathname);

  useEffect(() => {
    if (pathname.startsWith("/ops")) return;
    const previous = pathRef.current;
    const elapsed = Date.now() - entered.current;
    if (previous && previous !== pathname && elapsed > 400) {
      trackActivity("page_dwell", {}, elapsed, previous);
    }
    pathRef.current = pathname;
    entered.current = Date.now();
    trackActivity("page_view", { page: pathname });
    if (pathname === "/signup") trackActivity("signup_view");
    if (pathname === "/example") trackActivity("ah_example_report_viewed");
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/ops")) return;
    const started = Date.now();
    const path = pathname;
    function leave() {
      const elapsed = Date.now() - started;
      if (elapsed > 400) trackActivity("page_dwell", {}, elapsed, path);
    }
    const onHide = () => {
      if (document.visibilityState === "hidden") leave();
    };
    window.addEventListener("pagehide", leave);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", leave);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/ops")) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-track-section]"));
    if (!nodes.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.45) continue;
          const section = (entry.target as HTMLElement).dataset.trackSection || "";
          const key = `${pathname}:${section}`;
          if (!section || seenSections.has(key)) continue;
          seenSections.add(key);
          trackActivity("section_seen", { section });
        }
      },
      { threshold: [0.45] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
