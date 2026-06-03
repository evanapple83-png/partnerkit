# PartnerKit

**Free, open-source tools for the Microsoft partner community.**

A growing toolbox for everyone working in Partner Center, CSP and Microsoft 365.
Every tool runs against **public, unauthenticated** Microsoft and DNS endpoints —
no accounts, no API keys, no Graph consent, nothing stored.

> Independent community project. Not affiliated with or endorsed by Microsoft.

## Tools

| Tool | Status | What it does |
| --- | --- | --- |
| **Tenant Lookup** | ✅ Live | Domain → tenant ID, region, cloud, managed/federated, org name, mail posture. Reverse GUID validation. |
| **Bulk Domain Check** | ✅ Live | Paste many domains / drop a CSV → results table + CSV/JSON export. |
| **Company → Domain** | ✅ Live | Company name → likely domains → which are live M365 tenants. |

Every result has a shareable permalink: `/tenant/<domain>` (also accepts a tenant GUID).

## How it works

PartnerKit only reads what Microsoft already exposes publicly:

| Source | Gives |
| --- | --- |
| `login.microsoftonline.com/{domain}/v2.0/.well-known/openid-configuration` | Tenant GUID, region, cloud instance |
| `login.microsoftonline.com/getuserrealm.srf` | Managed vs Federated, org brand name |
| `odc.officeapps.live.com/.../federationprovider` | Tenant GUID cross-check |
| DNS-over-HTTPS (MX / TXT / `_dmarc`) | Exchange Online status, SPF, DMARC |

> **Note on "all tenant domains":** Microsoft hardened the Autodiscover
> `GetFederationInformation` endpoint — it now returns only the queried domain,
> so no tool can reliably enumerate every domain in a tenant from one domain.
> PartnerKit does not pretend otherwise.

## Free API

Every tool is scriptable. No key required.

```bash
# Single lookup (domain or tenant GUID)
curl "https://partnerkit.vercel.app/api/lookup?domain=contoso.com"
curl "https://partnerkit.vercel.app/api/lookup?id=<tenant-guid>"

# Bulk (max 50 domains, deduped)
curl -X POST "https://partnerkit.vercel.app/api/lookup/bulk" \
  -H "content-type: application/json" \
  -d '{"domains": ["contoso.com", "fabrikam.com"]}'

# Company name -> candidate domains, each tenant-checked
curl "https://partnerkit.vercel.app/api/discover?company=Heineken"
```

Single lookups return a JSON `TenantResult` (see `src/lib/types.ts`); bulk
returns `{ count, results }`.

**Rate limits:** 60 request units per minute per IP. A single lookup costs 1
unit, a discover 4, a bulk call 10. Over the limit you get a `429` with a
`Retry-After` header. Limits are intentionally generous for interactive and
script use; please don't hammer the API in tight loops.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Built with Next.js (App Router) + Tailwind. Deploys cleanly to Vercel.

## Contributing

Issues and PRs welcome — this is meant to be a community toolbox. Good first
issues are labelled. Each tool documents the exact public endpoints it uses, so
the repo doubles as a reference for how Microsoft identity discovery works.

## License

MIT — see [LICENSE](./LICENSE).
