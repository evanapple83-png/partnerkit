// Shared types for PartnerKit lookups.

export type Cloud =
  | "Commercial" // microsoftonline.com
  | "GCC High / DoD" // microsoftonline.us
  | "China (21Vianet)" // partner.microsoftonline.cn
  | "Unknown";

export type NamespaceType = "Managed" | "Federated" | "Unknown";

export interface MailPosture {
  /** True when MX points at *.mail.protection.outlook.com (Exchange Online). */
  exchangeOnline: boolean;
  mx: string[];
  /** SPF record references Microsoft (include:spf.protection.outlook.com). */
  spfMicrosoft: boolean;
  spf?: string;
  /** A DMARC record exists at _dmarc.<domain>. */
  dmarc: boolean;
  dmarcPolicy?: string; // none | quarantine | reject
}

export interface TenantResult {
  input: string;
  domain: string;
  found: boolean;
  tenantId?: string;
  /** Friendly tenant/org name from the federation brand. */
  displayName?: string;
  namespaceType: NamespaceType;
  /** Federation host when the domain is federated (e.g. ADFS server). */
  federationBrand?: string;
  region?: string; // WW, EU, NA, AS, ...
  regionLabel?: string;
  cloud: Cloud;
  /** The tenant's default *.onmicrosoft.com domain, when discoverable. */
  defaultDomain?: string;
  mail?: MailPosture;
  /** Per-source notes / soft errors, never fatal. */
  notes: string[];
  error?: string;
}
