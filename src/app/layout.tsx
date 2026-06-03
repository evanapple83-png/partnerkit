import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { BuiltByEvx, GitHubIcon, LogoMark } from "@/components/Brand";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://partnerkit.vercel.app"),
  title: {
    default: "PartnerKit: free tools for the Microsoft partner community",
    template: "%s · PartnerKit",
  },
  description:
    "Free, open-source tools for Microsoft 365 / Entra ID partners. Tenant ID lookup, bulk domain checks, and more. No login, no tracking.",
};

const REPO_URL = "https://github.com/evanapple83-png/partnerkit";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl px-5 h-[3.75rem] flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-semibold tracking-tight"
            >
              <LogoMark />
              <span>
                Partner<span className="text-accent">Kit</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/tools/tenant-lookup"
                className="rounded-full px-3.5 py-1.5 text-muted hover:text-foreground hover:bg-white/[0.06] transition-colors"
              >
                Tenant Lookup
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="ml-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-muted hover:text-foreground hover:border-white/25 transition-colors"
              >
                <GitHubIcon size={15} />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-20 border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-5 py-10">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <LogoMark size={24} />
                <div>
                  <p className="font-medium tracking-tight">
                    Partner<span className="text-accent">Kit</span>
                  </p>
                  <p className="text-xs text-muted">
                    A community project · <BuiltByEvx />
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted leading-relaxed sm:text-right">
                <p>Open source · MIT · No login, no tracking.</p>
                <p>
                  Built on public Microsoft endpoints. Not affiliated with
                  Microsoft.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
