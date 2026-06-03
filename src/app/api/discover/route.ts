import { NextRequest, NextResponse } from "next/server";
import { discoverByCompany } from "@/lib/lookup";
import { rateHeaders, rateLimit } from "@/lib/rate-limit";

// GET /api/discover?company=Heineken
// Resolves a company name to candidate domains, each enriched with a tenant lookup.
export async function GET(req: NextRequest) {
  // Discovery enriches up to 8 domains, so it costs more than a single lookup.
  const rate = rateLimit(req, 4);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again." },
      { status: 429, headers: rateHeaders(rate) },
    );
  }

  const company = new URL(req.url).searchParams.get("company");
  if (!company) {
    return NextResponse.json(
      { error: "Provide ?company=<name>." },
      { status: 400 },
    );
  }
  try {
    const data = await discoverByCompany(company);
    return NextResponse.json(data, { headers: rateHeaders(rate) });
  } catch {
    return NextResponse.json({ error: "Discovery failed." }, { status: 500 });
  }
}
