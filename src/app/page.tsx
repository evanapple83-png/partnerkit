import Link from "next/link";
import { GitHubIcon } from "@/components/Brand";
import { HeroLookup } from "@/components/HeroLookup";

const REPO_URL = "https://github.com/evanapple83-png/partnerkit";

interface Tool {
  href: string;
  name: string;
  blurb: string;
  icon: React.ReactNode;
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TOOLS: Tool[] = [
  {
    href: "/tools/tenant-lookup",
    name: "Tenant Lookup",
    blurb:
      "Domain to tenant ID, region, cloud, managed/federated and mail posture. Single, bulk and reverse lookup.",
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    href: "/tools/tenant-lookup",
    name: "Bulk Domain Check",
    blurb:
      "Paste up to 50 domains or drop a CSV. Tenant IDs and Exchange Online status for all of them, exportable.",
    icon: (
      <svg {...iconProps}>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" />
      </svg>
    ),
  },
  {
    href: "/tools/tenant-lookup",
    name: "Company → Domain",
    blurb:
      "Type a company name, get likely domains and see which ones are live Microsoft 365 tenants.",
    icon: (
      <svg {...iconProps}>
        <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11" />
        <path d="M8.5 8h1M8.5 12h1M8.5 16h1" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Backdrop: clean black with one soft Fluent-blue glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[-16rem] h-[30rem] w-[44rem] -translate-x-1/2 rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(76,154,255,0.14), rgba(47,127,232,0.05), transparent)",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-5">
        {/* Hero: the product itself, front and center */}
        <section className="pt-20 sm:pt-28 pb-16 text-center">
          <h1 className="animate-fade-up text-hero mx-auto max-w-2xl text-balance text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.08] tracking-tighter">
            Any Microsoft tenant.
            <br />
            One lookup away.
          </h1>

          <p className="animate-fade-up delay-100 mx-auto mt-5 max-w-md text-balance text-muted text-base leading-relaxed">
            Tenant ID, region, cloud and mail posture for every domain. Free
            for the partner community, nothing stored.
          </p>

          <div className="animate-fade-up delay-200 mt-9">
            <HeroLookup />
          </div>

          <div className="animate-fade-up delay-300 mt-8 flex items-center justify-center gap-5 text-xs text-muted">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <GitHubIcon size={13} />
              Open source, MIT
            </a>
            <span className="h-3 w-px bg-white/15" />
            <Link
              href="/tools/tenant-lookup"
              className="hover:text-foreground transition-colors"
            >
              Bulk &amp; company search
            </Link>
            <span className="h-3 w-px bg-white/15" />
            <a
              href={`${REPO_URL}#free-api`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Free API
            </a>
          </div>
        </section>

        {/* Tool cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-14">
          {TOOLS.map((t) => (
            <Link
              key={t.name}
              href={t.href}
              className="card card-hover group p-6"
            >
              <span className="inline-grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-accent-soft text-accent">
                {t.icon}
              </span>
              <h2 className="mt-4 font-semibold tracking-tight group-hover:text-accent transition-colors">
                {t.name}
              </h2>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">
                {t.blurb}
              </p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                Open tool
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </p>
            </Link>
          ))}
        </section>

        {/* API terminal */}
        <section className="pb-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Scriptable, by design.
              </h2>
              <p className="mt-3 text-muted leading-relaxed">
                Every tool doubles as a free JSON API. Wire tenant lookups into
                your own dashboards, onboarding flows or PSA tooling. No key,
                generous rate limits, honest 429s.
              </p>
              <a
                href={`${REPO_URL}#free-api`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline underline-offset-4"
              >
                Read the API docs
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-xs text-muted mono">terminal</span>
              </div>
              <pre className="mono overflow-x-auto p-5 text-[13px] leading-relaxed">
                <code>
                  <span className="text-muted">$</span>{" "}
                  <span className="text-foreground">curl</span>{" "}
                  <span className="text-accent">
                    &quot;https://partnerkit.vercel.app/api/lookup?domain=contoso.com&quot;
                  </span>
                  {"\n"}
                  <span className="text-muted">{"{"}</span>
                  {"\n  "}
                  <span className="text-good">&quot;tenantId&quot;</span>
                  <span className="text-muted">:</span>{" "}
                  <span className="text-foreground/90">
                    &quot;3f1d2a8e-…&quot;
                  </span>
                  <span className="text-muted">,</span>
                  {"\n  "}
                  <span className="text-good">&quot;namespaceType&quot;</span>
                  <span className="text-muted">:</span>{" "}
                  <span className="text-foreground/90">&quot;Managed&quot;</span>
                  <span className="text-muted">,</span>
                  {"\n  "}
                  <span className="text-good">&quot;regionLabel&quot;</span>
                  <span className="text-muted">:</span>{" "}
                  <span className="text-foreground/90">
                    &quot;Worldwide&quot;
                  </span>
                  <span className="text-muted">,</span>
                  {"\n  "}
                  <span className="text-good">&quot;mail&quot;</span>
                  <span className="text-muted">:</span>{" "}
                  <span className="text-foreground/90">
                    {"{ "}&quot;exchangeOnline&quot;: true{" }"}
                  </span>
                  {"\n"}
                  <span className="text-muted">{"}"}</span>
                </code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
