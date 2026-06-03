"use client";

import { useState } from "react";
import type { CompanyMatch } from "@/lib/lookup";
import { CopyButton } from "@/components/CopyButton";

export function CompanyLookup() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<CompanyMatch[] | null>(null);
  const [checked, setChecked] = useState(0);
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
        checked?: number;
        note?: string;
        error?: string;
      };
      setMatches(data.matches ?? []);
      setChecked(data.checked ?? data.matches?.length ?? 0);
      setNote(data.note ?? data.error ?? null);
    } catch {
      setNote("Discovery failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const foundCount = matches?.filter((m) => m.result.found).length ?? 0;

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
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm outline-none transition-all focus:border-accent/60 focus:ring-4 focus:ring-accent/15 focus:bg-white/[0.06] placeholder:text-muted/60"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Searching…" : "Find"}
        </button>
      </form>

      <p className="text-xs text-muted">
        Resolves a company name to likely domains (directory matches plus
        regional ccTLD variants), then checks which are live Microsoft 365
        tenants. Domains with a tenant are listed first.
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
          <p className="text-sm text-muted">
            <span className="text-good font-medium">{foundCount}</span> live
            tenant{foundCount === 1 ? "" : "s"} across {checked} checked
            domain{checked === 1 ? "" : "s"}
          </p>
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
                    {m.source === "tld-variant" && (
                      <span className="text-[10px] uppercase tracking-wide text-muted/80 border border-border rounded-full px-1.5 py-0.5">
                        regional
                      </span>
                    )}
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
