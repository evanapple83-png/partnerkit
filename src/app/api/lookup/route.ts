import { NextRequest, NextResponse } from "next/server";
import { isGuid, lookupTenant, lookupTenantById } from "@/lib/lookup";
import { rateHeaders, rateLimit } from "@/lib/rate-limit";

// GET /api/lookup?domain=contoso.com
// GET /api/lookup?id=<tenant-guid>
// Public, unauthenticated, JSON. Each call performs live Microsoft lookups.
export async function GET(req: NextRequest) {
  const rate = rateLimit(req, 1);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again." },
      { status: 429, headers: rateHeaders(rate) },
    );
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const id = searchParams.get("id");
  const q = domain ?? id;

  if (!q) {
    return NextResponse.json(
      { error: "Provide ?domain=<domain> or ?id=<tenant-guid>." },
      { status: 400 },
    );
  }

  try {
    const result = isGuid(q)
      ? await lookupTenantById(q)
      : await lookupTenant(q);
    return NextResponse.json(result, {
      headers: { "cache-control": "public, max-age=300", ...rateHeaders(rate) },
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
}
