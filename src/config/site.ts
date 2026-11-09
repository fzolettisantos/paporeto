function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Prefixo do site. Vazio = o Papo Reto abre na raiz do domínio. */
export const BASE_PATH = "";

/** Caminho interno com o prefixo do site: withBase("/sabio") → "/sabio". */
export function withBase(path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return BASE_PATH || "/";
  return `${BASE_PATH}${clean}`;
}

export const site = {
  name: "Papo Reto Ranking",
  url: resolveSiteUrl(),
  title: "Papo Reto Ranking | A resenha é deles. A corneta é sua.",
  description:
    "Quem fala mais merda? Quem é o mais sábio? Quem vai levar a bronca do Véio? Vote nos rankings mais absurdos da resenha do Papo Reto.",
  tagline: "A resenha é deles. A corneta é sua.",
  disclaimer: "Projeto independente de fãs, sem vínculo oficial com o Canal do Benja.",
  youtubeUrl: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@canaldobenja",
  /** Crédito das caricaturas, exibido quando elas forem usadas com autorização. */
  caricatureCredit: process.env.NEXT_PUBLIC_CARICATURE_CREDIT || "Caricaturas: Oberdan",
  locale: "pt_BR",
} as const;

/** URL completa de uma página do Papo Reto (já com a subpasta). */
export function absoluteUrl(path = "/") {
  return `${site.url}${withBase(path)}`;
}
