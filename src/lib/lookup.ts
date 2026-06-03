// PartnerKit core lookup engine.
// Every call here hits an UNAUTHENTICATED, public Microsoft or DNS endpoint.
// No API keys, no Graph consent, no tenant data is stored. All requests run
// server-side so the browser never deals with CORS.

import type { Cloud, MailPosture, NamespaceType, TenantResult } from "./types";

const TIMEOUT_MS = 12_000;

const REGION_LABELS: Record<string, string> = {
  WW: "Worldwide",
  NA: "North America",
  EU: "Europe",
  AS: "Asia",
  OC: "Oceania",
  SA: "South America",
  AF: "Africa",
  JP: "Japan",
  AP: "Asia Pacific",
};

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Strip a URL/email/whitespace down to a bare, lowercased domain. */
export function normalizeDomain(raw: string): string {
  let d = raw.trim().toLowerCase();
  if (!d) return "";
  if (d.includes("@")) d = d.split("@")[1] ?? d;
  d = d.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
  return d.replace(/\.$/, "");
}

export function isGuid(s: string): boolean {
  return GUID_RE.test(s.trim());
}

export function looksLikeDomain(s: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(
    s,
  );
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      // Never send cookies/credentials to these public endpoints.
      cache: "no-store",
    });
  } finally {
    clearTimeout(t);
  }
}

function cloudFromInstance(instance?: string): Cloud {
  if (!instance) return "Unknown";
  const i = instance.toLowerCase();
  if (i.includes("microsoftonline.us")) return "GCC High / DoD";
  if (i.includes("microsoftonline.cn")) return "China (21Vianet)";
  if (i.includes("microsoftonline.com")) return "Commercial";
  return "Unknown";
}

// --- Source 1: OpenID configuration -> tenant GUID, region, cloud ----------

interface OpenIdInfo {
  tenantId?: string;
  region?: string;
  cloud: Cloud;
}

async function getOpenIdConfig(domain: string): Promise<OpenIdInfo | null> {
  try {
    const res = await fetchWithTimeout(
      `https://login.microsoftonline.com/${encodeURIComponent(
        domain,
      )}/v2.0/.well-known/openid-configuration`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const issuer = String(data.issuer ?? "");
    const m = issuer.match(GUID_RE) ?? issuer.match(/([0-9a-f-]{36})/i);
    return {
      tenantId: m?.[0],
      region:
        (data.tenant_region_scope as string) ||
        (data.tenant_region_sub_scope as string) ||
        undefined,
      cloud: cloudFromInstance(data.cloud_instance_name as string),
    };
  } catch {
    return null;
  }
}

// --- Source 2: GetUserRealm -> managed/federated + brand name --------------

interface RealmInfo {
  namespaceType: NamespaceType;
  displayName?: string;
  federationBrand?: string;
  cloud: Cloud;
}

async function getUserRealm(domain: string): Promise<RealmInfo | null> {
  try {
    const res = await fetchWithTimeout(
      `https://login.microsoftonline.com/getuserrealm.srf?login=${encodeURIComponent(
        "info@" + domain,
      )}&xml=1`,
    );
    if (!res.ok) return null;
    const xml = await res.text();
    const pick = (tag: string) =>
      xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`, "i"))?.[1];
    const ns = (pick("NameSpaceType") || "").toLowerCase();
    const namespaceType: NamespaceType =
      ns === "managed" ? "Managed" : ns === "federated" ? "Federated" : "Unknown";
    return {
      namespaceType,
      displayName: pick("FederationBrandName") || undefined,
      federationBrand:
        namespaceType === "Federated"
          ? pick("AuthURL")?.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
          : undefined,
      cloud: cloudFromInstance(pick("CloudInstanceName")),
    };
  } catch {
    return null;
  }
}

// --- Source 3: ODC federation provider -> tenant GUID cross-check ----------

async function getFederationProvider(domain: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `https://odc.officeapps.live.com/odc/v2.1/federationprovider?domain=${encodeURIComponent(
        domain,
      )}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return (data.tenantId as string) || null;
  } catch {
    return null;
  }
}

// --- Source 4: DNS-over-HTTPS -> M365 mail posture -------------------------

interface DnsAnswer {
  name: string;
  type: number;
  data: string;
}

async function dohQuery(name: string, type: string): Promise<DnsAnswer[]> {
  try {
    const res = await fetchWithTimeout(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
        name,
      )}&type=${type}`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { Answer?: DnsAnswer[] };
    return data.Answer ?? [];
  } catch {
    return [];
  }
}

async function getMailPosture(domain: string): Promise<MailPosture> {
  const [mxAns, txtAns, dmarcAns] = await Promise.all([
    dohQuery(domain, "MX"),
    dohQuery(domain, "TXT"),
    dohQuery(`_dmarc.${domain}`, "TXT"),
  ]);

  const mx = mxAns
    .map((a) => a.data.replace(/^\d+\s+/, "").replace(/\.$/, "").trim())
    .filter(Boolean);
  const exchangeOnline = mx.some((h) =>
    /\.mail\.protection\.outlook\.com$/i.test(h),
  );

  const spf = txtAns
    .map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s+"/g, ""))
    .find((t) => /^v=spf1/i.test(t));
  const spfMicrosoft = !!spf && /spf\.protection\.outlook\.com/i.test(spf);

  const dmarcTxt = dmarcAns
    .map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s+"/g, ""))
    .find((t) => /^v=dmarc1/i.test(t));
  const dmarcPolicy = dmarcTxt?.match(/\bp=([a-z]+)/i)?.[1];

  return {
    exchangeOnline,
    mx,
    spfMicrosoft,
    spf,
    dmarc: !!dmarcTxt,
    dmarcPolicy,
  };
}

// --- Combiner: full tenant lookup for one domain ---------------------------

export async function lookupTenant(input: string): Promise<TenantResult> {
  const domain = normalizeDomain(input);
  const result: TenantResult = {
    input,
    domain,
    found: false,
    namespaceType: "Unknown",
    cloud: "Unknown",
    notes: [],
  };

  if (!domain || !looksLikeDomain(domain)) {
    result.error = "Not a valid domain.";
    return result;
  }

  const [openId, realm, odcTenant, mail] = await Promise.all([
    getOpenIdConfig(domain),
    getUserRealm(domain),
    getFederationProvider(domain),
    getMailPosture(domain),
  ]);

  result.tenantId = openId?.tenantId ?? odcTenant ?? undefined;
  result.region = openId?.region;
  result.regionLabel = openId?.region
    ? REGION_LABELS[openId.region] ?? openId.region
    : undefined;
  result.cloud =
    openId?.cloud && openId.cloud !== "Unknown"
      ? openId.cloud
      : realm?.cloud ?? "Unknown";

  if (realm) {
    result.namespaceType = realm.namespaceType;
    result.displayName = realm.displayName;
    result.federationBrand = realm.federationBrand;
  }

  result.mail = mail;
  result.found = !!result.tenantId;

  if (!result.found) {
    if (mail.exchangeOnline) {
      result.notes.push(
        "Domain is on Exchange Online but no tenant ID was returned (rare config).",
      );
    } else {
      result.notes.push("No Microsoft 365 / Entra ID tenant found for this domain.");
    }
  }
  if (openId?.tenantId && odcTenant && openId.tenantId !== odcTenant) {
    result.notes.push("Tenant ID sources disagree; showing OpenID value.");
  }

  return result;
}

/** Run an async mapper over items with a bounded concurrency. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

export const BULK_LIMIT = 50;

/** Look up many domains at once, de-duplicated, bounded concurrency. */
export async function lookupMany(inputs: string[]): Promise<TenantResult[]> {
  const seen = new Set<string>();
  const domains: string[] = [];
  for (const raw of inputs) {
    const d = normalizeDomain(raw);
    if (!d) continue;
    if (seen.has(d)) continue;
    seen.add(d);
    domains.push(d);
    if (domains.length >= BULK_LIMIT) break;
  }
  return mapLimit(domains, 8, (d) => lookupTenant(d));
}

// --- Company name -> domains (free Clearbit autocomplete + enrichment) -----

export interface CompanyMatch {
  companyName: string;
  logo?: string;
  /** Where this candidate came from. */
  source: "directory" | "tld-variant";
  result: TenantResult;
}

interface ClearbitSuggestion {
  name: string;
  domain: string;
  logo: string | null;
}

/** Total candidate domains checked per discovery run. */
export const DISCOVER_LIMIT = 15;

// Common ccTLDs/registrations for multinationals; used to widen the candidate
// list beyond what the company directory returns (regional tenants often live
// on their own ccTLD domain, like the Heineken NL vs MX split).
const TLD_VARIANTS = [
  "com",
  "nl",
  "de",
  "co.uk",
  "fr",
  "be",
  "it",
  "es",
  "se",
  "ch",
  "com.au",
  "ca",
  "us",
  "ie",
  "at",
  "dk",
  "no",
  "pl",
];

/** Resolve a company name to candidate domains, each enriched with a tenant lookup. */
export async function discoverByCompany(name: string): Promise<{
  query: string;
  checked: number;
  matches: CompanyMatch[];
  note?: string;
}> {
  const query = name.trim();
  if (!query)
    return { query, checked: 0, matches: [], note: "Enter a company name." };

  let suggestions: ClearbitSuggestion[] = [];
  try {
    const res = await fetchWithTimeout(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
        query,
      )}`,
    );
    if (res.ok) suggestions = (await res.json()) as ClearbitSuggestion[];
  } catch {
    return {
      query,
      checked: 0,
      matches: [],
      note: "Company directory is unavailable right now. Try a domain instead.",
    };
  }

  // De-dupe directory hits, keep first label per domain.
  const seen = new Set<string>();
  const picks = suggestions.filter(
    (s) => s.domain && !seen.has(s.domain) && seen.add(s.domain),
  );

  if (picks.length === 0) {
    return { query, checked: 0, matches: [], note: "No companies matched that name." };
  }

  // Widen with ccTLD variants of the top match's base label, up to the cap.
  // heineken.com -> heineken.nl, heineken.de, heineken.co.uk, ...
  const top = picks[0];
  const base = top.domain.split(".")[0];
  const variants: ClearbitSuggestion[] = [];
  if (base.length >= 3) {
    for (const tld of TLD_VARIANTS) {
      if (picks.length + variants.length >= DISCOVER_LIMIT) break;
      const domain = `${base}.${tld}`;
      if (seen.has(domain)) continue;
      seen.add(domain);
      variants.push({ name: top.name, domain, logo: null });
    }
  }

  const candidates = [
    ...picks.slice(0, DISCOVER_LIMIT).map((s) => ({ s, source: "directory" as const })),
    ...variants.map((s) => ({ s, source: "tld-variant" as const })),
  ].slice(0, DISCOVER_LIMIT);

  const matches = await mapLimit(candidates, 8, async ({ s, source }) => ({
    companyName: s.name,
    logo: s.logo ?? undefined,
    source,
    result: await lookupTenant(s.domain),
  }));

  // Live tenants first; within each group directory hits before variants.
  matches.sort((a, b) => {
    if (a.result.found !== b.result.found) return a.result.found ? -1 : 1;
    if (a.source !== b.source) return a.source === "directory" ? -1 : 1;
    return a.companyName.localeCompare(b.companyName);
  });

  return { query, checked: matches.length, matches };
}

// --- Many company names -> best domain + tenant per company ----------------

export const COMPANY_BULK_LIMIT = 10;
/** Directory candidates checked per company in bulk mode. */
const BEST_OF = 3;

export interface CompanyBest {
  /** The name as the user typed it. */
  query: string;
  /** How many candidate domains were tenant-checked. */
  candidatesChecked: number;
  /** Best match: first live tenant in directory order, else the top hit. */
  best?: CompanyMatch;
  note?: string;
}

async function clearbitSuggest(query: string): Promise<ClearbitSuggestion[]> {
  const res = await fetchWithTimeout(
    `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
      query,
    )}`,
  );
  if (!res.ok) return [];
  return (await res.json()) as ClearbitSuggestion[];
}

/**
 * Resolve up to COMPANY_BULK_LIMIT company names to their most likely
 * domain + tenant. Directory order is Clearbit's relevance ranking, so the
 * first candidate with a live tenant wins.
 */
export async function discoverBestForCompanies(
  names: string[],
): Promise<CompanyBest[]> {
  // Trim, drop empties, de-dupe case-insensitively, cap.
  const seen = new Set<string>();
  const queries: string[] = [];
  for (const raw of names) {
    const q = raw.trim();
    if (!q) continue;
    const key = q.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    queries.push(q);
    if (queries.length >= COMPANY_BULK_LIMIT) break;
  }

  return mapLimit(queries, 3, async (query) => {
    let suggestions: ClearbitSuggestion[];
    try {
      suggestions = await clearbitSuggest(query);
    } catch {
      return {
        query,
        candidatesChecked: 0,
        note: "Company directory unavailable.",
      };
    }

    const dedup = new Set<string>();
    const picks = suggestions
      .filter((s) => s.domain && !dedup.has(s.domain) && dedup.add(s.domain))
      .slice(0, BEST_OF);

    if (picks.length === 0) {
      return { query, candidatesChecked: 0, note: "No company matched." };
    }

    const matches = await mapLimit(picks, BEST_OF, async (s) => ({
      companyName: s.name,
      logo: s.logo ?? undefined,
      source: "directory" as const,
      result: await lookupTenant(s.domain),
    }));

    // Prefer a live tenant whose company name exactly matches the query,
    // then the first live tenant in directory (relevance) order.
    const found = matches.filter((m) => m.result.found);
    const exact = found.find(
      (m) => m.companyName.toLowerCase() === query.toLowerCase(),
    );
    const best = exact ?? found[0] ?? matches[0];
    return { query, candidatesChecked: matches.length, best };
  });
}

/** Validate a tenant GUID by resolving its OpenID config (reverse lookup). */
export async function lookupTenantById(input: string): Promise<TenantResult> {
  const id = input.trim().toLowerCase();
  const result: TenantResult = {
    input,
    domain: id,
    found: false,
    namespaceType: "Unknown",
    cloud: "Unknown",
    notes: [],
  };
  if (!isGuid(id)) {
    result.error = "Not a valid tenant GUID.";
    return result;
  }
  const openId = await getOpenIdConfig(id);
  if (openId?.tenantId) {
    result.found = true;
    result.tenantId = openId.tenantId;
    result.region = openId.region;
    result.regionLabel = openId.region
      ? REGION_LABELS[openId.region] ?? openId.region
      : undefined;
    result.cloud = openId.cloud;
    result.notes.push(
      "GUID resolves to a live tenant. A GUID cannot be reversed to its domains (no public index exists).",
    );
  } else {
    result.notes.push("No live tenant resolves for this GUID.");
  }
  return result;
}
