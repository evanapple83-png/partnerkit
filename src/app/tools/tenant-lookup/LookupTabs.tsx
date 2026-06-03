"use client";

import { useState } from "react";
import { TenantLookup } from "./TenantLookup";
import { BulkLookup } from "./BulkLookup";
import { CompanyLookup } from "./CompanyLookup";

type Tab = "single" | "bulk" | "company";

export function LookupTabs() {
  const [tab, setTab] = useState<Tab>("single");

  return (
    <div>
      <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 mb-6 backdrop-blur">
        {(
          [
            ["single", "Single"],
            ["bulk", "Bulk"],
            ["company", "Company"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4.5 py-1.5 text-sm font-medium transition-all duration-300 ${
              tab === key
                ? "bg-white/[0.1] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.3)]"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "single" && <TenantLookup />}
      {tab === "bulk" && <BulkLookup />}
      {tab === "company" && <CompanyLookup />}
    </div>
  );
}
