# Contributing to PartnerKit

Thanks for helping build a free toolbox for the Microsoft partner community.
PRs and issues are welcome, from typo fixes to whole new tools.

## Ground rules

1. **Public endpoints only.** Every lookup must run against public,
   unauthenticated Microsoft or DNS endpoints. No API keys, no Graph consent,
   no scraping behind logins.
2. **Nothing stored.** PartnerKit keeps no databases of queried tenants or
   visitors. Don't add persistence of lookup data.
3. **Be honest in the UI.** If Microsoft closes an endpoint (like Autodiscover
   `GetFederationInformation` domain enumeration), we say so instead of
   shipping results that look complete but aren't.
4. **No trademark trouble.** The brand stays neutral ("PartnerKit"), and the
   footer keeps the "not affiliated with Microsoft" disclaimer.

## Dev setup

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # must stay green before a PR
```

Stack: Next.js (App Router), React, Tailwind 4, TypeScript. No backend
services; everything runs in route handlers.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/lookup.ts` | Core engine: all Microsoft/DNS calls |
| `src/lib/types.ts` | `TenantResult` and friends |
| `src/lib/rate-limit.ts` | Public API rate limiting |
| `src/app/api/*` | Public JSON API routes |
| `src/app/tools/*` | Tool UIs (one folder per tool) |
| `src/app/tenant/[domain]` | Shareable permalink pages |

## Adding a new tool

1. Open an issue first describing the tool and the **exact public endpoints**
   it would use. That discussion doubles as the tool's documentation.
2. Engine logic goes in `src/lib/`, UI under `src/app/tools/<tool-name>/`,
   API (if any) under `src/app/api/`.
3. Apply the rate limiter to any new public API route.

## Good first issues

Looking for a place to start? These are deliberately small:

- Add more example domains/companies to the empty states
- Export bulk results as Excel (`.xlsx`) next to CSV/JSON
- Add a dark/light theme toggle (currently dark only)
- Show a small history of recent lookups (client-side only, localStorage)
- Add `?format=csv` to the bulk API
- Translate region codes we don't map yet (see `REGION_LABELS` in `lookup.ts`)

Check the [issue tracker](../../issues) for ones labelled `good first issue`.

## License

By contributing you agree your work is released under the MIT license.
