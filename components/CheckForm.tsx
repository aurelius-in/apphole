"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

export function CheckForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!authorized) {
      setError("Confirm you own the app or are authorized to test it.");
      return;
    }
    setBusy(true);
    track("ah_url_submit", { url });
    track("ah_scan_authorization_confirmed");
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, authorized: true }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        throw new Error(data.error || "Could not start the check.");
      }
      track("ah_scan_started", { id: data.id });
      router.push(`/scan/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the check.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <label htmlFor="app-url" className="mb-1 block text-sm font-medium">
          App URL
        </label>
        <input
          id="app-url"
          name="url"
          type="url"
          required
          placeholder="https://myapp.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-xl border border-ah-line bg-white px-4 py-3 text-base shadow-sm outline-none ring-ah-blue focus:ring-2"
        />
      </div>
      <label className="flex items-start gap-3 text-sm text-ah-muted">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-ah-blue"
          checked={authorized}
          onChange={(e) => setAuthorized(e.target.checked)}
        />
        <span>
          I own this app or I am authorized to test it. AppHole will fetch public pages only. No destructive actions, no real charges, no exploit attempts.
        </span>
      </label>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-ah-red" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center rounded-full bg-ah-blue px-5 py-3 text-base font-semibold text-white shadow-brand hover:bg-ah-blue-dark disabled:opacity-60 sm:w-auto"
        onClick={() => track("ah_hero_cta_click")}
      >
        {busy ? "Starting check…" : "Check my AppHole"}
      </button>
      <p className="text-xs text-ah-muted">No giant generic checklist. No excuse to disappear into another month of coding.</p>
    </form>
  );
}
