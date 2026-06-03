import type { Metadata } from "next";
import { LookupTabs } from "./LookupTabs";

export const metadata: Metadata = {
  title: "Tenant Lookup",
  description:
    "Look up a Microsoft 365 / Entra ID tenant ID, region, cloud and mail posture from a domain. Free and open source.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold">Tenant Lookup</h1>
        <p className="text-muted mt-1.5 text-sm leading-relaxed">
          Enter a domain to resolve its Microsoft 365 / Entra ID tenant ID,
          region, cloud instance and mail posture. You can also paste a tenant
          GUID to validate it, or switch to Bulk to check many at once.
          Everything runs against public Microsoft endpoints. No login,
          nothing stored.
        </p>
      </div>
      <LookupTabs />
    </div>
  );
}
