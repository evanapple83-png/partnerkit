import { NextRequest, NextResponse } from "next/server";
import { COMPANY_BULK_LIMIT, discoverBestForCompanies } from "@/lib/lookup";
import { rateHeaders, rateLimit } from "@/lib/rate-limit";

// POST /api/discover/bulk   { "companies": ["Heineken", "ASML", ...] }
// Returns { count, results: CompanyBest[] }: the most likely domain + tenant
// per company name. Capped at COMPANY_BULK_LIMIT companies.
export async function POST(req: NextRequest) {
  // Each company fans out to a directory query plus several tenant lookups.
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

  const raw = (body as { companies?: unknown })?.companies;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty `companies` array." },
      { status: 400 },
    );
  }

  const inputs = raw
    .filter((x): x is string => typeof x === "string")
    .slice(0, COMPANY_BULK_LIMIT * 2); // generous pre-cap; engine dedupes + caps

  try {
    const results = await discoverBestForCompanies(inputs);
    return NextResponse.json(
      { count: results.length, results },
      { headers: rateHeaders(rate) },
    );
  } catch {
    return NextResponse.json(
      { error: "Bulk discovery failed." },
      { status: 500 },
    );
  }
}
