import { NextRequest, NextResponse } from "next/server";
import { BULK_LIMIT, lookupMany } from "@/lib/lookup";
import { rateHeaders, rateLimit } from "@/lib/rate-limit";

// POST /api/lookup/bulk   { "domains": ["contoso.com", "fabrikam.com", ...] }
// Returns { count, results: TenantResult[] }. Capped at BULK_LIMIT domains.
export async function POST(req: NextRequest) {
  // A bulk call fans out to many upstream lookups, so it costs more units.
  const rate = rateLimit(req, 10);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again." },
      { status: 429, headers: rateHeaders(rate) },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = (body as { domains?: unknown })?.domains;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty `domains` array." },
      { status: 400 },
    );
  }

  const inputs = raw
    .filter((x): x is string => typeof x === "string")
    .slice(0, BULK_LIMIT * 2); // generous pre-cap; lookupMany dedupes + caps

  try {
    const results = await lookupMany(inputs);
    return NextResponse.json(
      { count: results.length, results },
      { headers: rateHeaders(rate) },
    );
  } catch {
    return NextResponse.json({ error: "Bulk lookup failed." }, { status: 500 });
  }
}
