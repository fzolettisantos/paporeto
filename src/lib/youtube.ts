/**
 * Links de evidência do YouTube (Bala do Véio).
 * Aceita watch?v=, /live/, /shorts/, /embed/ e youtu.be; descarta parâmetros de rastreio (si, is, feature…).
 */
const ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeVideoId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.split("/")[1] ?? null;
  else if (host === "youtube.com") {
    const [, first, second] = url.pathname.split("/");
    if (first === "watch") id = url.searchParams.get("v");
    else if (first === "live" || first === "shorts" || first === "embed") id = second ?? null;
  }
  return id && ID.test(id) ? id : null;
}

/** URL limpa do vídeo (sem rastreio), para guardar no banco. */
export function cleanYoutubeUrl(raw: string | null | undefined): string | null {
  const id = youtubeVideoId(raw);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

/** "1:05:52" → 3952; "08:12" → 492. */
export function timeToSeconds(time: string | null | undefined): number | null {
  if (!time || !/^\d{1,2}(:\d{2}){1,2}$/.test(time)) return null;
  return time.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

/** Link que abre o vídeo já no momento da evidência. */
export function youtubeEvidenceLink(raw: string | null | undefined, time?: string | null): string | null {
  const id = youtubeVideoId(raw);
  if (!id) return null;
  const seconds = timeToSeconds(time);
  return `https://www.youtube.com/watch?v=${id}${seconds ? `&t=${seconds}s` : ""}`;
}
