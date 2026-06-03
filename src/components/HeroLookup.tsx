"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalize(raw: string): string {
  let d = raw.trim().toLowerCase();
  if (GUID_RE.test(d)) return d;
  if (d.includes("@")) d = d.split("@")[1] ?? d;
  return d
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
}

/** The hero IS the product: type a domain, land on its tenant page. */
export function HeroLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  function go(raw: string) {
    const q = normalize(raw);
    if (!q) return;
    setBusy(true);
    router.push(`/tenant/${encodeURIComponent(q)}`);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="group relative"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted/70"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Look up any domain or tenant ID…"
          spellCheck={false}
          autoComplete="off"
          className="w-full rounded-2xl border border-white/12 bg-white/[0.05] py-4 pl-12 pr-32 text-[15px] outline-none backdrop-blur transition-all placeholder:text-muted/60 focus:border-accent/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-accent/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_-12px_rgba(0,0,0,0.6)]"
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "…" : "Look up"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
        {["microsoft.com", "heineken.com", "accenture.com"].map((d) => (
          <button
            key={d}
            onClick={() => go(d)}
            className="mono rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 hover:border-white/25 hover:text-foreground transition-colors"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
