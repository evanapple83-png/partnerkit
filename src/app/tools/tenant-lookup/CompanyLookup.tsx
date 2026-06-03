"use client";

import { useState } from "react";
import type { CompanyBest, CompanyMatch } from "@/lib/lookup";
import { CopyButton } from "@/components/CopyButton";

type Mode = "one" | "list";

export function CompanyLookup() {
  const [mode, setMode] = useState<Mode>("one");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs">
        {(
          [
            ["one", "One company"],
            ["list", "List (up to 10)"],
          ] as [Mode, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`rounded-full border px-3 py-1.5 font-medium transition-colors ${
              mode === key
                ? "border-accent/50 bg-accent-soft text-accent"
                : "border-white/10 bg-white/[0.03] text-muted hover:text-foreground hover:border-white/25"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "one" ? <OneCompany /> : <CompanyList />}
    </div>
  );
}

// --- One company -> all candidate domains -----------------------------------

function OneCompany() {
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

// --- Many companies -> best domain + tenant each -----------------------------

const LIST_LIMIT = 10;

function parseCompanies(text: string): string[] {
  return text
    .split(/[\n;,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function CompanyList() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompanyBest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const companies = parseCompanies(text);
  const count = Math.min(companies.length, LIST_LIMIT);

  async function run() {
    if (!count || loading) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/discover/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companies }),
      });
      const data = (await res.json()) as {
        results?: CompanyBest[];
        error?: string;
      };
      if (data.error) setError(data.error);
      else setResults(data.results ?? []);
    } catch {
      setError("Bulk discovery failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const foundCount =
    results?.filter((r) => r.best?.result.found).length ?? 0;

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        spellCheck={false}
        placeholder={"One company name per line (or comma separated), up to 10.\n\nHeineken\nASML\nRabobank"}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition-all focus:border-accent/60 focus:ring-4 focus:ring-accent/15 focus:bg-white/[0.06] placeholder:text-muted/60 resize-y"
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted">
          {count} compan{count === 1 ? "y" : "ies"}
          {companies.length > LIST_LIMIT && (
            <span className="text-warn"> (capped at {LIST_LIMIT})</span>
          )}
          {" · "}best domain + tenant per company
        </p>
        <button
          onClick={run}
          disabled={loading || !count}
          className="btn-primary rounded-xl px-5 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `Resolving ${count}…` : `Resolve ${count || ""}`}
        </button>
      </div>

      {error && (
        <div className="card p-4">
          <p className="text-bad text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="card p-5 animate-pulse">
          <div className="h-4 w-48 rounded bg-surface-2 mb-3" />
          <div className="h-3 w-full rounded bg-surface-2 mb-2" />
          <div className="h-3 w-2/3 rounded bg-surface-2" />
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            <span className="text-good font-medium">{foundCount}</span> of{" "}
            {results.length} resolved to a live tenant
          </p>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="font-medium px-4 py-2.5">You typed</th>
                  <th className="font-medium px-4 py-2.5">Best match</th>
                  <th className="font-medium px-4 py-2.5">Tenant ID</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const b = r.best;
                  return (
                    <tr
                      key={r.query}
                      className="border-b border-border/50 last:border-0 hover:bg-surface-2/40"
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {r.query}
                      </td>
                      <td className="px-4 py-2.5">
                        {b ? (
                          <div className="min-w-0">
                            <p className="truncate">{b.companyName}</p>
                            <a
                              href={`/tenant/${encodeURIComponent(b.result.domain)}`}
                              className="mono text-xs text-accent hover:underline"
                            >
                              {b.result.domain}
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted">
                            {r.note ?? "no match"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {b?.result.tenantId ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="mono text-xs">
                              {b.result.tenantId}
                            </span>
                            <CopyButton
                              value={b.result.tenantId}
                              label="tenant ID"
                            />
                          </span>
                        ) : (
                          <span className="text-muted">not found</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
