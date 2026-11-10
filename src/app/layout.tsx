import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Anton, Barlow } from "next/font/google";
import { site, withBase } from "@/config/site";
import "./globals.css";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: withBase("/") },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: withBase("/"),
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#111318",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${barlow.variable}`}>
      <body>
        <a
          href="#rankings"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-yellow focus:px-4 focus:py-3 focus:font-bold focus:text-ink"
        >
          Pular para os rankings
        </a>
        {children}
        {/* Vercel Web Analytics: visitas e páginas, sem cookies. Ativar na aba Analytics do projeto. */}
        <Analytics />
      </body>
    </html>
  );
}
