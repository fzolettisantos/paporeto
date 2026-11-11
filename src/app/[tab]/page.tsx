import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/HomePage";
import { TAB_SEO } from "@/config/seo";
import { withBase } from "@/config/site";
import { isTabSlug } from "@/lib/validation";
import { TAB_SLUGS } from "@/types";

/**
 * URLs amigáveis por aba (/falou-merda, /sabio, /bala-do-veio, /charges).
 * Não são páginas separadas: abrem a mesma experiência já na aba correspondente.
 */
export const revalidate = 15;
export const dynamicParams = false;

export function generateStaticParams() {
  return TAB_SLUGS.map((tab) => ({ tab }));
}

export async function generateMetadata({ params }: { params: Promise<{ tab: string }> }): Promise<Metadata> {
  const { tab } = await params;
  if (!isTabSlug(tab)) return {};
  const { title, description, keywords } = TAB_SEO[tab];
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: withBase(`/${tab}`) },
    openGraph: { title, description, url: withBase(`/${tab}`) },
    twitter: { title, description },
  };
}

export default async function TabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (!isTabSlug(tab)) notFound();
  return <HomePage initialTab={tab} />;
}
