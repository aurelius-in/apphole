"use client";

import { FormEvent, useId, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import type { PlugLeadSource } from "@/lib/scans/types";

export type PlugFindingOption = {
  id: string;
  label: string;
  title: string;
  description: string;
};

const HEADLINE = "Got a leak? Let us plug your app hole.";

export function PlugQuoteForm({
  findings = [],
  scanId,
  scanUrl,
  source,
  compact = false,
}: {
  findings?: PlugFindingOption[];
  scanId?: string;
  scanUrl?: string;
  source: PlugLeadSource;
  compact?: boolean;
}) {
  const formId = useId();
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const emailId = `${formId}-email`;
  const descId = `${formId}-description`;
  const errorId = `${formId}-error`;
  const useSelect = findings.length > 8;
  const picked = findings.find((item) => item.id === selectedId);
  const descriptionOptional = Boolean(picked || scanId || scanUrl);

  function pickFinding(id: string) {
    setSelectedId((current) => (current === id ? "" : id));
  }

  function quoteDescription(): string {
    const typed = description.trim();
    if (typed.length >= 10) return typed;
    if (picked?.description.trim()) return picked.description.trim();
    if (scanUrl) return `Quote request to plug holes from this AppHole report: ${scanUrl}`;
    if (scanId) return `Quote request to plug holes from scan ${scanId}.`;
    return typed;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedDescription = quoteDescription();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email.");
      return;
    }
    if (trimmedDescription.length < 10) {
      setError("Describe the hole you want plugged (at least a sentence).");
      return;
    }
    setBusy(true);
    track("ah_plug_quote_submit", { source, scanId, findingId: picked?.id });
    try {
      const res = await fetch("/api/plug-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          description: trimmedDescription,
          findingId: picked?.id,
          findingTitle: picked?.title,
          scanId,
          scanUrl,
          source,
          website,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Could not send the quote request.");
      }
      track("ah_plug_quote_success", { source, scanId });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the quote request.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section
        id="plug-quote"
        className="rounded-3xl border-2 border-ah-green bg-white p-5 shadow-card sm:p-6"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-ah-green-dark">Quote request received</p>
        <h2 className={`mt-2 font-bold ${compact ? "text-xl" : "text-2xl"}`}>Got it. We will email you a quote.</h2>
        <p className="mt-2 text-sm leading-6 text-ah-muted">
          A human will look at the leak you flagged and send a price to plug it. This request does not mean the hole is
          already fixed.
        </p>
      </section>
    );
  }

  return (
    <section id="plug-quote" className="rounded-3xl border-2 border-ah-green bg-white p-5 shadow-card sm:p-6">
      <h2 className={`font-bold tracking-tight ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
        {HEADLINE}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ah-muted sm:text-base">
        {findings.length > 0
          ? "We will email a price to plug the leak you pick."
          : "We will email a price to plug the leak."}
      </p>

      <form onSubmit={onSubmit} className={`relative ${compact ? "mt-4 space-y-3" : "mt-5 space-y-4"}`}>
        <div className="absolute -left-[10000px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor={`${formId}-website`}>Website</label>
          <input
            id={`${formId}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {findings.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium" id={`${formId}-holes`}>
              Pick a hole from this report (optional)
            </p>
            {useSelect ? (
              <select
                aria-labelledby={`${formId}-holes`}
                className="w-full rounded-xl border border-ah-line bg-white px-4 py-3 text-sm outline-none ring-ah-green focus:ring-2"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Skip for now</option>
                {findings.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${formId}-holes`}>
                {findings.map((item) => {
                  const selected = selectedId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => pickFinding(item.id)}
                      className={`max-w-full break-words rounded-full border px-3 py-1.5 text-left text-xs font-semibold sm:text-sm ${
                        selected
                          ? "border-ah-green bg-emerald-50 text-ah-green-dark"
                          : "border-ah-line bg-ah-bg text-ah-ink hover:border-ah-green"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <label htmlFor={emailId} className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error?.toLowerCase().includes("email") || undefined}
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-xl border border-ah-line bg-white px-4 py-3 text-base shadow-sm outline-none ring-ah-green focus:ring-2"
          />
        </div>

        {error && (
          <p id={errorId} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-ah-red" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center rounded-full bg-ah-green px-5 py-3 text-base font-semibold text-ah-ink shadow-sm hover:bg-ah-green-dark hover:text-white disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Sending..." : "Get a quote"}
        </button>

        <div>
          <label htmlFor={descId} className="mb-1 block text-sm font-medium text-ah-muted">
            {descriptionOptional ? "More detail (optional)" : "Describe the hole"}
          </label>
          <textarea
            id={descId}
            name="description"
            required={!descriptionOptional}
            minLength={descriptionOptional ? undefined : 10}
            rows={compact ? 3 : 4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              descriptionOptional ? "Optional note." : "What leaks, where it happens, and who it blocks."
            }
            aria-invalid={error?.toLowerCase().includes("describe") || undefined}
            aria-describedby={error ? errorId : undefined}
            className="w-full resize-y rounded-xl border border-ah-line bg-ah-bg px-4 py-3 text-sm shadow-sm outline-none ring-ah-green focus:ring-2"
          />
        </div>

        <p className="text-xs leading-5 text-ah-muted">
          We will only use this to quote the job. See{" "}
          <Link href="/privacy" className="font-semibold text-ah-blue hover:underline">
            Privacy
          </Link>
          .
        </p>
      </form>
    </section>
  );
}
