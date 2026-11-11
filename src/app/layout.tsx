import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Anton, Barlow } from "next/font/google";
import { site, withBase } from "@/config/site";
import { HOME_SEO, SEO_KEYWORDS_BASE } from "@/config/seo";
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
  title: { default: HOME_SEO.title, template: `%s | ${site.name}` },
  description: HOME_SEO.description,
  applicationName: site.name,
  keywords: SEO_KEYWORDS_BASE,
  authors: [{ name: "Fiapo de Manga Studio", url: "https://www.instagram.com/fiapodemangastudio/" }],
  creator: "Fiapo de Manga Studio",
  publisher: "Fiapo de Manga Studio",
  category: "sports",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, email: false, address: false },
  // Google Search Console: cadastre NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION na Vercel (só o código do "content").
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  alternates: { canonical: withBase("/") },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    url: withBase("/"),
  },
  twitter: { card: "summary_large_image", title: HOME_SEO.title, description: HOME_SEO.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
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
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-yellow focus:px-4 focus:py-3 focus:font-bold focus:text-ink"
        >
          Pular para o conteúdo
        </a>
        {children}
        {/* Vercel Web Analytics: visitas e páginas, sem cookies. Ativar na aba Analytics do projeto. */}
        <Analytics />
      </body>
    </html>
  );
}
