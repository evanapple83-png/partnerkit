import type { TenantResult } from "@/lib/types";
import { CopyButton } from "./CopyButton";

function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "good" | "warn" | "bad" | "muted" | "accent";
}) {
  const tones: Record<string, string> = {
    good: "bg-good/10 text-good border-good/30",
    warn: "bg-warn/10 text-warn border-warn/30",
    bad: "bg-bad/10 text-bad border-bad/30",
    accent: "bg-accent/10 text-accent border-accent/30",
    muted: "bg-surface-2 text-muted border-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  copyable,
  mono,
}: {
  label: string;
  value?: string;
  copyable?: boolean;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted shrink-0">{label}</span>
      <span className="flex items-center gap-2 min-w-0">
        <span className={`truncate ${mono ? "mono text-sm" : "text-sm"}`}>
          {value}
        </span>
        {copyable && <CopyButton value={value} label={label} />}
      </span>
    </div>
  );
}

export function ResultCard({ result }: { result: TenantResult }) {
  if (result.error) {
    return (
      <div className="card p-5">
        <p className="text-bad text-sm">
          <span className="font-medium">{result.input}</span>: {result.error}
        </p>
      </div>
    );
  }

  const m = result.mail;
  const mailTone = m?.exchangeOnline ? "good" : "muted";

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 bg-surface-2/50 border-b border-border">
        <div className="min-w-0">
          <p className="font-semibold truncate">
            {result.displayName || result.domain}
          </p>
          <p className="text-xs text-muted mono truncate">{result.domain}</p>
        </div>
        {result.found ? (
          <Badge tone="good">Tenant found</Badge>
        ) : (
          <Badge tone="warn">No tenant</Badge>
        )}
      </div>

      <div className="px-5 py-1">
        <Field label="Tenant ID" value={result.tenantId} copyable mono />
        <Field label="Organization" value={result.displayName} copyable />
        <Field
          label="Namespace"
          value={
            result.namespaceType !== "Unknown"
              ? result.namespaceType
              : undefined
          }
        />
        <Field label="Federation host" value={result.federationBrand} mono />
        <Field
          label="Region"
          value={
            result.regionLabel
              ? `${result.regionLabel}${
                  result.region && result.region !== result.regionLabel
                    ? ` (${result.region})`
                    : ""
                }`
              : undefined
          }
        />
        <Field
          label="Cloud"
          value={result.cloud !== "Unknown" ? result.cloud : undefined}
        />
      </div>

      {m && (
        <div className="px-5 py-4 border-t border-border bg-surface-2/30">
          <p className="text-xs uppercase tracking-wide text-muted mb-2.5">
            Mail / Exchange Online
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone={mailTone}>
              {m.exchangeOnline ? "On Exchange Online" : "Not on EXO"}
            </Badge>
            {m.spfMicrosoft && <Badge tone="good">SPF → Microsoft</Badge>}
            {m.dmarc ? (
              <Badge tone={m.dmarcPolicy === "reject" ? "good" : "warn"}>
                DMARC: {m.dmarcPolicy ?? "set"}
              </Badge>
            ) : (
              <Badge tone="bad">No DMARC</Badge>
            )}
          </div>
          {m.mx.length > 0 && (
            <p className="mt-2.5 text-xs text-muted mono break-all">
              MX: {m.mx.join(", ")}
            </p>
          )}
        </div>
      )}

      {result.notes.length > 0 && (
        <div className="px-5 py-3 border-t border-border/60">
          {result.notes.map((n, i) => (
            <p key={i} className="text-xs text-muted">
              · {n}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
