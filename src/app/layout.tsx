import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border/80 backdrop-blur sticky top-0 z-10 bg-background/70">
          <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-grid place-items-center w-7 h-7 rounded-lg bg-accent text-white text-sm font-bold">
                P
              </span>
              <span>
                Partner<span className="text-accent">Kit</span>
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted">
              <Link href="/tools/tenant-lookup" className="hover:text-foreground">
                Tenant Lookup
              </Link>
              <a
                href="https://github.com/evanapple83-png/partnerkit"
                className="hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border/80 mt-16">
          <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-muted flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <p>
              Open source · MIT · No login, no tracking. Built on public Microsoft
              endpoints.
            </p>
            <p>
              A community project ·{" "}
              <span className="text-foreground/80">built by EvanExpert</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
