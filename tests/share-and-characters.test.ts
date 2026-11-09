import { describe, expect, it } from "vitest";
import { pickPhrase, RANKINGS } from "@/config/rankings";
import { placeholderMood, resolveCharacterImage } from "@/lib/characters";
import { participantHeadline, rankingShareText, whatsappUrl } from "@/lib/share";
import type { RankingResults } from "@/types";
import { rank } from "./helpers";

const results = (votes: Record<string, number>, isDemo = false): RankingResults => {
  const entries = rank(votes);
  return {
    slug: "falou-merda",
    mode: "vote",
    view: "week",
    active: true,
    period: { kind: "weekly", key: "W", label: "" },
    totalVotes: entries.reduce((s, e) => s + e.votes, 0),
    entries,
    isDemo,
    updatedAt: "",
  };
};

describe("compartilhamento", () => {
  it("só afirma o líder com votos reais", () => {
    expect(rankingShareText("falou-merda", results({ benja: 9, b: 1 }))).toContain("BENJA LIDERA O TROFÉU FALOU MERDA");
    expect(rankingShareText("falou-merda", results({ benja: 9, b: 1 }, true))).not.toContain("LIDERA");
    expect(rankingShareText("falou-merda", results({ benja: 0, b: 0 }))).not.toContain("LIDERA");
    expect(rankingShareText("falou-merda", results({ benja: 3, b: 3 }))).toContain("Empate");
  });

  it("fora da semana, o texto diz o recorte", () => {
    const r = { ...results({ benja: 9, b: 1 }), view: "season" as const, period: { kind: "season" as const, key: "S2026", label: "Temporada 2026" } };
    expect(rankingShareText("falou-merda", r)).toContain("(TEMPORADA 2026)");
    expect(participantHeadline("falou-merda", r.entries[0]!, r)).toContain("(TEMPORADA 2026)");
  });

  it("manchete do card coerente com a posição", () => {
    const r = results({ benja: 9, b: 4, c: 1 });
    expect(participantHeadline("falou-merda", r.entries[0]!, r)).toBe("BENJA LIDERA O TROFÉU FALOU MERDA. O POVO NÃO PERDOOU!");
    expect(participantHeadline("falou-merda", r.entries[1]!, r)).toBe("B ESTÁ EM 2º NO TROFÉU FALOU MERDA.");
  });

  it("monta o link do WhatsApp", () => {
    expect(whatsappUrl("Oi já", "https://x.com/a")).toBe("https://wa.me/?text=Oi%20j%C3%A1%20https%3A%2F%2Fx.com%2Fa");
  });
});

describe("caricaturas", () => {
  it("usa a expressão exata cadastrada e nunca outra", () => {
    const sources = { "falou-merda": { top: "https://x/top.webp" } };
    // Participante fictício, sem arquivos em public/characters.
    expect(resolveCharacterImage("sem-caricatura", "falou-merda", "top", sources)).toBe("https://x/top.webp");
    expect(resolveCharacterImage("sem-caricatura", "falou-merda", "bottom", sources)).toBeNull();
    expect(resolveCharacterImage("sem-caricatura", "sabio", "top", sources)).toBeNull();
  });

  it("acha as caricaturas locais pelo manifesto", () => {
    expect(resolveCharacterImage("benja", "falou-merda", "top")).toBe("/characters/benja/falou-merda/top.webp");
    expect(resolveCharacterImage("mano", "sabio", "bottom")).toBe("/characters/mano/sabio/bottom.webp");
  });

  it("placeholder segue a lógica de cada ranking", () => {
    expect(placeholderMood("falou-merda", "top")).toBe("scared");
    expect(placeholderMood("falou-merda", "bottom")).toBe("smiling");
    expect(placeholderMood("sabio", "top")).toBe("proud");
    expect(placeholderMood("sabio", "bottom")).toBe("confused");
    expect(placeholderMood("bala-do-veio", "top")).toBe("terrified");
    expect(placeholderMood("bala-do-veio", "bottom")).toBe("relieved");
  });

  it("frases são estáveis e pertencem ao estado", () => {
    const phrase = pickPhrase("sabio", "top", "benja");
    expect(pickPhrase("sabio", "top", "benja")).toBe(phrase);
    expect(RANKINGS.sabio.phrases.top).toContain(phrase);
  });
});

import { parseInstagramPostUrl } from "@/config/charges";

describe("links do Instagram", () => {
  it("aceita posts e reels e normaliza", () => {
    expect(parseInstagramPostUrl("https://www.instagram.com/p/DAbc123xyz/?igsh=abc")).toBe("https://www.instagram.com/p/DAbc123xyz/");
    expect(parseInstagramPostUrl("https://instagram.com/reel/C9xYz_12-ab")).toBe("https://www.instagram.com/reel/C9xYz_12-ab/");
    expect(parseInstagramPostUrl("https://www.instagram.com/oberdan_machado/p/DAbc123xyz/")).toBe("https://www.instagram.com/p/DAbc123xyz/");
  });
  it("recusa perfil, stories e outros sites", () => {
    expect(parseInstagramPostUrl("https://www.instagram.com/oberdan_machado/")).toBeNull();
    expect(parseInstagramPostUrl("https://www.instagram.com/stories/oberdan_machado/123/")).toBeNull();
    expect(parseInstagramPostUrl("https://evil.com/p/DAbc123xyz/")).toBeNull();
    expect(parseInstagramPostUrl("nada")).toBeNull();
  });
});
