"use client";

import { useRef, useState } from "react";
import type { TenantResult } from "@/lib/types";
import { CopyButton } from "@/components/CopyButton";
import { download, parseDomains, resultsToCsv } from "@/lib/csv";

const LIMIT = 50;

export function BulkLookup() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TenantResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const domains = parseDomains(text);
  const count = Math.min(domains.length, LIMIT);

  async function onFile(file: File) {
    const content = await file.text();
    setText((prev) => (prev ? prev + "\n" : "") + content);
  }

  async function run() {
    if (!count || loading) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/lookup/bulk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domains }),
      });
      const data = (await res.json()) as { results?: TenantResult[]; error?: string };
      if (data.error) setError(data.error);
      else setResults(data.results ?? []);
    } catch {
      setError("Bulk lookup failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const foundCount = results?.filter((r) => r.found).length ?? 0;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          spellCheck={false}
          placeholder={"Paste domains, one per line or comma / space separated.\nDrop a .csv or .txt file anywhere here.\n\ncontoso.com\nfabrikam.com\nuser@adventure-works.com"}
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/20 placeholder:text-muted/60 mono resize-y"
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>
            {count} domain{count === 1 ? "" : "s"}
            {domains.length > LIMIT && (
              <span className="text-warn"> (capped at {LIMIT})</span>
            )}
          </span>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-border px-2 py-1 hover:text-foreground hover:border-accent/60 transition-colors"
          >
            Upload CSV / TXT
          </button>
          {(text || results) && (
            <button
              onClick={() => {
                setText("");
                setResults(null);
                setError(null);
              }}
              className="hover:text-foreground"
            >
              Clear
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </div>

        <button
          onClick={run}
          disabled={loading || !count}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
        >
          {loading ? `Looking up ${count}…` : `Look up ${count || ""}`}
        </button>
      </div>

      {error && (
        <div className="card p-4">
          <p className="text-bad text-sm">{error}</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted">
              <span className="text-good font-medium">{foundCount}</span> of{" "}
              {results.length} resolved to a tenant
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  download("partnerkit-tenants.csv", resultsToCsv(results), "text/csv")
                }
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:text-foreground hover:border-accent/60 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() =>
                  download(
                    "partnerkit-tenants.json",
                    JSON.stringify(results, null, 2),
                    "application/json",
                  )
                }
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:text-foreground hover:border-accent/60 transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="font-medium px-4 py-2.5">Domain</th>
                  <th className="font-medium px-4 py-2.5">Organization</th>
                  <th className="font-medium px-4 py-2.5">Tenant ID</th>
                  <th className="font-medium px-4 py-2.5">Region</th>
                  <th className="font-medium px-4 py-2.5">EXO</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr
                    key={r.domain}
                    className="border-b border-border/50 last:border-0 hover:bg-surface-2/40"
                  >
                    <td className="px-4 py-2.5 mono whitespace-nowrap">{r.domain}</td>
                    <td className="px-4 py-2.5 text-muted">
                      {r.displayName ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.tenantId ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="mono text-xs">{r.tenantId}</span>
                          <CopyButton value={r.tenantId} label="tenant ID" />
                        </span>
                      ) : (
                        <span className="text-muted">not found</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted whitespace-nowrap">
                      {r.regionLabel ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.mail?.exchangeOnline ? (
                        <span className="text-good">✓</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results && results.length === 0 && !error && (
        <div className="card p-4">
          <p className="text-sm text-muted">No valid domains to look up.</p>
        </div>
      )}
    </div>
  );
}
