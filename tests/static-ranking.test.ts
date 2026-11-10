import { describe, expect, it } from "vitest";
import { RANKINGS } from "@/config/rankings";
import { rankStatic } from "@/lib/ranking";
import { participantHeadline, rankingShareText } from "@/lib/share";
import { getRankingResults } from "@/lib/server/data";
import { castVote } from "@/lib/server/vote";
import type { RankingResults } from "@/types";
import { participant } from "./helpers";
import { formatEvidence, shotsLabel, shotsTotal } from "@/components/ShotsTable";

const ranked = (positions: Record<string, number>) =>
  rankStatic(Object.entries(positions).map(([slug, position], i) => ({ participant: participant(slug, i), position })));
const summary = (entries: ReturnType<typeof ranked>) =>
  entries.map((e) => `${e.position}:${e.participant.slug}:${e.state}${e.tied ? ":tie" : ""}`);

describe("Bala do Véio é estático", () => {
  it("não tem votação", () => {
    expect(RANKINGS["bala-do-veio"].mode).toBe("static");
    expect(RANKINGS["falou-merda"].mode).toBe("vote");
    expect(RANKINGS.sabio.mode).toBe("vote");
  });

  it("recusa votos no servidor", async () => {
    expect(await castVote({ ranking: "bala-do-veio", participantId: "benja", voterKey: "v", ipHash: "i" })).toBe("not_votable");
  });

  it("tiros: total de cada participante e total geral batem", async () => {
    const [results] = await getRankingResults(["bala-do-veio"]);
    const shots = results!.shots!;
    const perPerson = Object.values(shots).map((list) => list.reduce((t, s) => t + s.quantity, 0));
    expect(results!.totalShots).toBe(perPerson.reduce((a, b) => a + b, 0));
    expect(shotsTotal(shots.serdan!)).toBe(12);
    expect(shotsTotal(shots.kleber!)).toBe(12);
    expect(results!.totalShots).toBe(48);
    expect(shotsLabel(1)).toBe("1 tiro");
    expect(formatEvidence(shots["veio-tricolor"]![0]!)).toBe("EP 629 · 1:08:12");
    expect(formatEvidence(shots.nem![0]!)).toBe("EP 360");
    expect(formatEvidence(shots.serdan![0]!)).toBeNull();
    expect(shotsLabel(1234)).toBe("1.234 tiros");
  });

  it("modo demonstração devolve a ordem simulada, sem votos", async () => {
    const [results] = await getRankingResults(["bala-do-veio"]);
    expect(results!.mode).toBe("static");
    expect(results!.totalVotes).toBe(0);
    expect(results!.entries.every((e) => e.votes === 0 && e.percent === 0)).toBe(true);
    expect(results!.entries[0]!.state).toBe("top");
  });
});

describe("rankStatic", () => {
  it("ordena pela posição definida e aplica as expressões", () => {
    expect(summary(ranked({ a: 3, b: 1, c: 2 }))).toEqual(["1:b:top", "2:c:middle", "3:a:bottom"]);
  });

  it("normaliza buracos na numeração", () => {
    expect(summary(ranked({ a: 1, b: 4, c: 9 }))).toEqual(["1:a:top", "2:b:middle", "3:c:bottom"]);
  });

  it("posições iguais empatam", () => {
    expect(summary(ranked({ a: 1, b: 1, c: 2 }))).toEqual(["1:a:top:tie", "1:b:top:tie", "3:c:bottom"]);
  });

  it("quem não tem posição fica de fora; um só fica neutro", () => {
    expect(summary(ranked({ a: 0, b: 2 }))).toEqual(["1:b:neutral"]);
    expect(ranked({ a: 0 })).toEqual([]);
  });
});

describe("textos do ranking estático", () => {
  const results = (isDemo: boolean): RankingResults => ({
    slug: "bala-do-veio",
    mode: "static",
    view: "season",
    active: true,
    period: { kind: "all_time", key: "STATIC", label: "" },
    totalVotes: 0,
    entries: ranked({ benja: 1, b: 2 }),
    isDemo,
    updatedAt: "",
  });

  it("não fala em votação nem em 'povo'", () => {
    const text = rankingShareText("bala-do-veio", results(false));
    expect(text).toContain("BENJA É QUEM MAIS TÁ PEDINDO UMA BRONCA DO VÉIO");
    expect(text.toLowerCase()).not.toMatch(/vota|povo/);
    expect(rankingShareText("bala-do-veio", results(true)).toLowerCase()).not.toMatch(/vota|povo/);
    const r = results(false);
    expect(participantHeadline("bala-do-veio", r.entries[0]!, r)).toContain("BENJA");
  });
});

describe("participante só em alguns rankings", () => {
  it("citados só no Bala do Véio não aparecem nos rankings de voto", async () => {
    const [fm, sabio, bala] = await getRankingResults(["falou-merda", "sabio", "bala-do-veio"]);
    const has = (r: typeof fm, id: string) => r!.entries.some((e) => e.participant.id === id);
    expect(has(bala, "serdan")).toBe(true);
    expect(has(fm, "serdan")).toBe(false);
    expect(has(sabio, "douglas-dias")).toBe(false);
    expect(has(bala, "veio-tricolor")).toBe(true);
  });

  it("Bala do Véio segue o total de tiros", async () => {
    const [bala] = await getRankingResults(["bala-do-veio"]);
    const at = (id: string) => bala!.entries.find((e) => e.participant.id === id)!;
    expect(bala!.entries.slice(0, 2).map((e) => e.participant.id).sort()).toEqual(["kleber", "serdan"]);
    expect(at("serdan")).toMatchObject({ position: 1, state: "top" });
    expect(at("kleber").position).toBe(1);
    expect(at("kleber").tied).toBe(true);
    expect(at("benja").state).toBe("bottom"); // sem tiros: escapou
  });
});

describe("últimos campeões", () => {
  it("cada ranking com votação traz o campeão da semana, do mês e da temporada passados", async () => {
    const [fm] = await getRankingResults(["falou-merda"]);
    expect(fm!.champions!.map((c) => c.view)).toEqual(["week", "month", "season"]);
    expect(fm!.champions![0]!.winners[0]!.participant.id).toBe("mano");
    const [bala] = await getRankingResults(["bala-do-veio"]);
    expect(bala!.champions).toBeUndefined();
  });
});
