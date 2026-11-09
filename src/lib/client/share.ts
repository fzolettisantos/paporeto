"use client";

import { withBase } from "@/config/site";
import { VIEW_PARAM } from "@/lib/period";
import type { RankingView } from "@/types";

export type ShareOutcome = "shared" | "copied" | "downloaded" | "cancelled" | "failed";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para navegadores sem Clipboard API (ou fora de HTTPS).
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

/** Web Share API quando disponível; senão copia o link. */
export async function shareLink(data: { title: string; text: string; url: string }): Promise<ShareOutcome> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  return (await copyText(`${data.text} ${data.url}`)) ? "copied" : "failed";
}

/** Compartilha o card em imagem (arquivo) ou faz o download quando o aparelho não aceita arquivos. */
export async function shareCardImage(params: { ranking: string; participantId?: string; view?: RankingView; text: string; url: string }): Promise<ShareOutcome> {
  const query = new URLSearchParams({ ranking: params.ranking });
  if (params.view && params.view !== "week") query.set("periodo", VIEW_PARAM[params.view]);
  if (params.participantId) query.set("participant", params.participantId);
  try {
    const response = await fetch(withBase(`/api/share-card?${query}`));
    if (!response.ok) return "failed";
    const blob = await response.blob();
    const file = new File([blob], `papo-reto-ranking-${params.ranking}.png`, { type: "image/png" });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${params.text} ${params.url}` });
        return "shared";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      }
    }
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10_000);
    return "downloaded";
  } catch {
    return "failed";
  }
}
