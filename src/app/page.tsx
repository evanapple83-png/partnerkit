import Link from "next/link";

interface Tool {
  href: string;
  name: string;
  blurb: string;
  status: "live" | "soon";
}

const TOOLS: Tool[] = [
  {
    href: "/tools/tenant-lookup",
    name: "Tenant Lookup",
    blurb:
      "Domain → tenant ID, region, cloud, managed/federated and mail posture. Single, bulk and reverse lookup.",
    status: "live",
  },
  {
    href: "/tools/tenant-lookup",
    name: "Bulk Domain Check",
    blurb:
      "Paste up to 50 domains or drop a CSV. Tenant IDs and Exchange Online status for all of them, exportable.",
    status: "live",
  },
  {
    href: "/tools/tenant-lookup",
    name: "Company → Domain",
    blurb:
      "Type a company name, get likely domains and which ones are live Microsoft 365 tenants.",
    status: "live",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="py-16 sm:py-20 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-good" />
          Free · open source · no login
        </p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
          Tools for the Microsoft
          <br className="hidden sm:block" /> partner community
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted leading-relaxed">
          A growing toolbox for everyone working in Partner Center, CSP and
          Microsoft 365. Fast lookups built on public Microsoft endpoints, with
          no accounts, no API keys, nothing stored.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            href="/tools/tenant-lookup"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Open Tenant Lookup
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:border-accent/60 transition-colors"
          >
            Star on GitHub
          </a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
        {TOOLS.map((t) => (
          <Link
            key={t.name}
            href={t.href}
            className="card p-5 group hover:border-accent/50 transition-colors relative"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold group-hover:text-accent transition-colors">
                {t.name}
              </h2>
              {t.status === "soon" && (
                <span className="text-[10px] uppercase tracking-wide text-muted border border-border rounded-full px-2 py-0.5">
                  soon
                </span>
              )}
            </div>
            <p className="text-sm text-muted leading-relaxed">{t.blurb}</p>
          </Link>
        ))}
      </section>

      <section className="pb-16">
        <div className="card p-5 text-sm text-muted">
          <p>
            <span className="text-foreground font-medium">Free API.</span> Every
            tool is scriptable.{" "}
            <code className="mono text-accent">
              GET /api/lookup?domain=contoso.com
            </code>{" "}
            returns JSON. Build it into your own dashboards.
          </p>
        </div>
      </section>
    </div>
  );
}
