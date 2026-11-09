/** Charges do Oberdan no Instagram. */
export const OBERDAN_INSTAGRAM = {
  handle: "oberdan_machado",
  url: "https://www.instagram.com/oberdan_machado/",
};

/**
 * Posts do Instagram exibidos na galeria (embed oficial: aparece com o crédito e o link do Oberdan).
 * Também dá para adicionar pelo painel /admin quando o Supabase estiver ligado.
 * Mais recentes primeiro. Ex.: { url: "https://www.instagram.com/p/ABC123/", title: "…", publishedOn: "2026-11-09" }
 */
export const INSTAGRAM_CHARGES: { url: string; title?: string; publishedOn?: string }[] = [];

/**
 * Normaliza o link de um post do Instagram (post, reel ou IGTV) para o permalink usado no embed.
 * Retorna null para qualquer outra coisa (perfil, story, outros sites).
 */
export function parseInstagramPostUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (!/^(www\.)?instagram\.com$/i.test(url.hostname)) return null;
  const match = url.pathname.match(/^\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]{5,40})\/?$/);
  if (!match) return null;
  const kind = match[1] === "tv" ? "p" : match[1];
  return `https://www.instagram.com/${kind}/${match[2]}/`;
}
