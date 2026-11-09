import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage } from "@/components/HomePage";
import { tabCopy } from "@/config/rankings";
import { site, withBase } from "@/config/site";
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
  const copy = tabCopy(tab);
  const description = `${copy.subtitle} ${copy.description}`;
  return {
    title: copy.title,
    description,
    alternates: { canonical: withBase(`/${tab}`) },
    openGraph: { title: `${copy.title} | ${site.name}`, description, url: withBase(`/${tab}`) },
    twitter: { title: `${copy.title} | ${site.name}`, description },
  };
}

export default async function TabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (!isTabSlug(tab)) notFound();
  return <HomePage initialTab={tab} />;
}
