import type { Metadata } from "next";
import { IndexPage } from "@/components/IndexPage";
import { HOME_SEO } from "@/config/seo";
import { withBase } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: HOME_SEO.title },
  description: HOME_SEO.description,
  keywords: HOME_SEO.keywords,
  alternates: { canonical: withBase("/") },
  openGraph: { title: HOME_SEO.title, description: HOME_SEO.description, url: withBase("/") },
  twitter: { title: HOME_SEO.title, description: HOME_SEO.description },
};

/** Página inicial: horário do programa e atalhos (os rankings ficam em /falou-merda, /sabio…). */
export default function Page() {
  return <IndexPage />;
}
