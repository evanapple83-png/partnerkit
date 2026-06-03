import type { TenantResult } from "./types";

/** Pull domain-ish tokens out of pasted text or CSV content. */
export function parseDomains(text: string): string[] {
  return text
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function csvCell(v: string | undefined): string {
  const s = v ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS: { header: string; get: (r: TenantResult) => string }[] = [
  { header: "domain", get: (r) => r.domain },
  { header: "found", get: (r) => String(r.found) },
  { header: "tenant_id", get: (r) => r.tenantId ?? "" },
  { header: "organization", get: (r) => r.displayName ?? "" },
  { header: "namespace", get: (r) => (r.namespaceType !== "Unknown" ? r.namespaceType : "") },
  { header: "region", get: (r) => r.regionLabel ?? r.region ?? "" },
  { header: "cloud", get: (r) => (r.cloud !== "Unknown" ? r.cloud : "") },
  { header: "exchange_online", get: (r) => (r.mail ? String(r.mail.exchangeOnline) : "") },
  { header: "dmarc", get: (r) => r.mail?.dmarcPolicy ?? (r.mail?.dmarc ? "set" : "") },
  { header: "mx", get: (r) => r.mail?.mx.join(" ") ?? "" },
];

export function resultsToCsv(results: TenantResult[]): string {
  const head = COLUMNS.map((c) => c.header).join(",");
  const rows = results.map((r) => COLUMNS.map((c) => csvCell(c.get(r))).join(","));
  return [head, ...rows].join("\n");
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
