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
      <div className="inline-flex rounded-lg border border-border bg-surface p-1 mb-6">
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
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-accent text-white"
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
