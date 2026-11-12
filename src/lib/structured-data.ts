import { PERSONAGENS, type Personagem } from "@/config/personagens";
import { absoluteUrl, site } from "@/config/site";
import faces from "@/generated/character-faces.json";

const FACES = faces as Record<string, string[]>;
export const PUBLISHER_ID = absoluteUrl("/#publisher");
export const WEBSITE_ID = absoluteUrl("/#website");
export const SHOW_ID = absoluteUrl("/#papo-reto");

/** Quem faz o site (projeto independente de fãs). */
export function publisherLd() {
  return {
    "@type": "Organization",
    "@id": PUBLISHER_ID,
    name: "Fiapo de Manga Studio",
    url: "https://www.fiapodemanga.com.br/",
    sameAs: ["https://www.instagram.com/fiapodemangastudio/"],
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    alternateName: ["Canal do Benja Papo Reto", "Papo Reto Ranking do Canal do Benja"],
    url: absoluteUrl("/"),
    inLanguage: "pt-BR",
    description: site.description,
    publisher: { "@id": PUBLISHER_ID },
    about: { "@id": SHOW_ID },
  };
}

export function personLd(p: Personagem) {
  const face = FACES[p.slug]?.[0];
  return {
    "@type": "Person",
    "@id": absoluteUrl(`/bancada/${p.pageSlug}#pessoa`),
    name: p.fullName,
    alternateName: [...new Set([p.name, p.nickname].filter((n) => n && n !== p.fullName))],
    description: p.bio,
    jobTitle: p.role,
    url: absoluteUrl(`/bancada/${p.pageSlug}`),
    ...(face ? { image: absoluteUrl(face) } : {}),
    ...(p.instagram ? { sameAs: [`https://www.instagram.com/${p.instagram}/`] } : {}),
  };
}

/** O programa (assunto do site). Descritivo: o site não é oficial. */
export function showLd() {
  return {
    "@type": "TVSeries",
    "@id": SHOW_ID,
    name: "Papo Reto",
    alternateName: "Papo Reto do Canal do Benja",
    description:
      "Programa de resenha de futebol do Canal do Benja, apresentado por Benjamin Back, ao vivo no YouTube de segunda a sexta, das 12h às 14h (horário de Brasília).",
    inLanguage: "pt-BR",
    genre: ["Esporte", "Futebol", "Humor"],
    url: site.youtubeUrl,
    sameAs: [site.youtubeUrl],
    actor: PERSONAGENS.map((p) => ({ "@id": absoluteUrl(`/bancada/${p.pageSlug}#pessoa`) })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function graph(...nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
