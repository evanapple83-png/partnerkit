import type { Metadata } from "next";
import Link from "next/link";
import { ResultCard } from "@/components/ResultCard";
import {
  isGuid,
  lookupTenant,
  lookupTenantById,
  normalizeDomain,
} from "@/lib/lookup";

// Shareable permalink: /tenant/contoso.com (or /tenant/<tenant-guid>).
// Rendered server-side with a live lookup on every request.

interface Props {
  params: Promise<{ domain: string }>;
}

function cleanParam(raw: string): string {
  const decoded = decodeURIComponent(raw);
  return isGuid(decoded) ? decoded.trim().toLowerCase() : normalizeDomain(decoded);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const q = cleanParam((await params).domain);
  return {
    title: `Tenant ID for ${q}`,
    description: `Microsoft 365 / Entra ID tenant ID, region, cloud and mail posture for ${q}. Free and open source.`,
  };
}

export default async function TenantPermalink({ params }: Props) {
  const q = cleanParam((await params).domain);
  const result = isGuid(q) ? await lookupTenantById(q) : await lookupTenant(q);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold mono break-all">{q}</h1>
        <p className="text-muted mt-1.5 text-sm leading-relaxed">
          Live Microsoft 365 / Entra ID tenant lookup. Share this page with its
          URL, or{" "}
          <Link
            href="/tools/tenant-lookup"
            className="text-accent hover:underline"
          >
            check another domain
          </Link>
          .
        </p>
      </div>

      <ResultCard result={result} />

      <p className="mt-5 text-xs text-muted">
        Need this as JSON?{" "}
        <a
          href={`/api/lookup?${isGuid(q) ? "id" : "domain"}=${encodeURIComponent(q)}`}
          className="mono text-accent hover:underline"
        >
          /api/lookup?{isGuid(q) ? "id" : "domain"}={q}
        </a>
      </p>
    </div>
  );
}
