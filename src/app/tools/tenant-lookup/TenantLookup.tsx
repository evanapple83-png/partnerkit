"use client";

import { useState } from "react";
import type { TenantResult } from "@/lib/types";
import { ResultCard } from "@/components/ResultCard";

export function TenantLookup() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TenantResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const isGuid = /^[0-9a-f-]{36}$/i.test(q);
      const param = isGuid ? "id" : "domain";
      const res = await fetch(
        `/api/lookup?${param}=${encodeURIComponent(q)}`,
      );
      const data = (await res.json()) as TenantResult;
      setResult(data);
    } catch {
      setError("Lookup failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={run} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="contoso.com  or  user@contoso.com  or  a tenant GUID"
          spellCheck={false}
          autoComplete="off"
          autoFocus
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm outline-none transition-all focus:border-accent/60 focus:ring-4 focus:ring-accent/15 focus:bg-white/[0.06] placeholder:text-muted/60"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Looking up…" : "Look up"}
        </button>
      </form>

      {!result && !error && !loading && (
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="text-muted/70">Try:</span>
          {["microsoft.com", "stanford.edu", "softwareone.com"].map((d) => (
            <button
              key={d}
              onClick={() => setQuery(d)}
              className="rounded-md border border-border px-2 py-1 hover:text-foreground hover:border-accent/60 transition-colors mono"
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="card p-5 animate-pulse">
          <div className="h-4 w-40 rounded bg-surface-2 mb-3" />
          <div className="h-3 w-full rounded bg-surface-2 mb-2" />
          <div className="h-3 w-2/3 rounded bg-surface-2" />
        </div>
      )}

      {error && (
        <div className="card p-5">
          <p className="text-bad text-sm">{error}</p>
        </div>
      )}

      {result && (
        <>
          <ResultCard result={result} />
          {!result.error && (
            <p className="text-xs text-muted">
              Share this result:{" "}
              <a
                href={`/tenant/${encodeURIComponent(result.domain)}`}
                className="mono text-accent hover:underline"
              >
                /tenant/{result.domain}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}
