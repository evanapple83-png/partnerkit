"use client";

import { useState } from "react";
import type { CompanyMatch } from "@/lib/lookup";
import { CopyButton } from "@/components/CopyButton";

export function CompanyLookup() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<CompanyMatch[] | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const q = name.trim();
    if (!q || loading) return;
    setLoading(true);
    setNote(null);
    setMatches(null);
    try {
      const res = await fetch(`/api/discover?company=${encodeURIComponent(q)}`);
      const data = (await res.json()) as {
        matches?: CompanyMatch[];
        note?: string;
        error?: string;
      };
      setMatches(data.matches ?? []);
      setNote(data.note ?? data.error ?? null);
    } catch {
      setNote("Discovery failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={run} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company name, e.g. Heineken"
          spellCheck={false}
          autoComplete="off"
          autoFocus
          className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/20 placeholder:text-muted/70"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
        >
          {loading ? "Searching…" : "Find"}
        </button>
      </form>

      <p className="text-xs text-muted">
        Resolves a company name to likely domains, then checks which are live
        Microsoft 365 tenants. Domains with a tenant are listed first.
      </p>

      {loading && (
        <div className="card p-5 animate-pulse">
          <div className="h-4 w-48 rounded bg-surface-2 mb-3" />
          <div className="h-3 w-full rounded bg-surface-2" />
        </div>
      )}

      {note && (!matches || matches.length === 0) && (
        <div className="card p-4">
          <p className="text-sm text-muted">{note}</p>
        </div>
      )}

      {matches && matches.length > 0 && (
        <div className="space-y-2.5">
          {matches.map((m) => {
            const r = m.result;
            return (
              <div
                key={r.domain}
                className="card p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{m.companyName}</span>
                    {r.found ? (
                      <span className="text-[10px] uppercase tracking-wide text-good border border-good/30 bg-good/10 rounded-full px-1.5 py-0.5">
                        tenant
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wide text-muted border border-border rounded-full px-1.5 py-0.5">
                        no tenant
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mono truncate mt-0.5">
                    {r.domain}
                    {r.tenantId ? ` · ${r.tenantId}` : ""}
                  </p>
                </div>
                {r.tenantId && (
                  <CopyButton value={r.tenantId} label="tenant ID" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
