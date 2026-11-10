import { describe, expect, it } from "vitest";
import { daysUntil, getPreviousViewPeriod, getViewPeriod, getVoteKeys, getVotingPeriod, parseViewParam } from "@/lib/period";

// 2026-11-09 é uma segunda-feira.
describe("getVotingPeriod", () => {
  it("semanal começa na segunda por padrão", () => {
    expect(getVotingPeriod("weekly", new Date("2026-11-12T15:00:00Z")).key).toBe("W2026-11-09");
    expect(getVotingPeriod("weekly", new Date("2026-11-15T23:00:00Z")).key).toBe("W2026-11-09");
  });

  it("usa o fuso de São Paulo na virada do dia", () => {
    // 02:00 UTC de segunda = 23:00 de domingo em São Paulo → ainda é a semana anterior.
    expect(getVotingPeriod("weekly", new Date("2026-11-16T02:00:00Z")).key).toBe("W2026-11-09");
    expect(getVotingPeriod("weekly", new Date("2026-11-16T03:00:00Z")).key).toBe("W2026-11-16");
  });

  it("permite configurar o dia de início da semana", () => {
    expect(getVotingPeriod("weekly", new Date("2026-11-12T15:00:00Z"), { weekStartsOn: 0 }).key).toBe("W2026-11-08");
    expect(getVotingPeriod("weekly", new Date("2026-11-12T15:00:00Z"), { weekStartsOn: 4 }).key).toBe("W2026-11-12");
  });

  it("diário, mensal e permanente", () => {
    const now = new Date("2026-11-12T15:00:00Z");
    expect(getVotingPeriod("daily", now).key).toBe("D2026-11-12");
    expect(getVotingPeriod("monthly", now)).toMatchObject({ key: "M2026-11", label: "Novembro de 2026", endsOn: "2026-11-30" });
    expect(getVotingPeriod("all_time", now).key).toBe("ALL");
  });
});

describe("semana, mês e temporada", () => {
  it("a temporada é o ano e termina em 31/12", () => {
    expect(getViewPeriod("season", new Date("2026-11-12T15:00:00Z"))).toMatchObject({
      key: "S2026",
      label: "Temporada 2026",
      endsOn: "2026-12-31",
    });
  });

  it("o voto conta na semana, no mês e na temporada da data do voto", () => {
    expect(getVoteKeys(new Date("2026-11-12T15:00:00Z"))).toEqual({ day: "D2026-11-12", week: "W2026-11-09", month: "M2026-11", season: "S2026" });
  });

  it("virada do ano: a semana começou em dezembro, mas o voto já é da nova temporada", () => {
    // 01/01/2027 (sexta) às 12h em São Paulo.
    expect(getVoteKeys(new Date("2027-01-01T15:00:00Z"))).toEqual({ day: "D2027-01-01", week: "W2026-12-28", month: "M2027-01", season: "S2027" });
    // 31/12/2026 às 23h em São Paulo (02h UTC do dia 1º) ainda é a temporada 2026.
    expect(getVoteKeys(new Date("2027-01-01T02:00:00Z")).season).toBe("S2026");
  });

  it("dias até o fim do período", () => {
    expect(daysUntil("2026-12-31", new Date("2026-12-30T15:00:00Z"))).toBe(1);
    expect(daysUntil("2026-12-31", new Date("2026-12-31T15:00:00Z"))).toBe(0);
  });

  it("lê o recorte da URL em português", () => {
    expect(parseViewParam("temporada")).toBe("season");
    expect(parseViewParam("mes")).toBe("month");
    expect(parseViewParam(null)).toBe("week");
    expect(parseViewParam("qualquer")).toBe("week");
  });
});

describe("período anterior (últimos campeões)", () => {
  const now = new Date("2026-11-12T15:00:00Z"); // quinta, 12/11/2026
  it("semana, mês e temporada passados", () => {
    expect(getPreviousViewPeriod("week", now).key).toBe("W2026-11-02");
    expect(getPreviousViewPeriod("month", now)).toMatchObject({ key: "M2026-10", label: "Outubro de 2026" });
    expect(getPreviousViewPeriod("season", now)).toMatchObject({ key: "S2025", label: "Temporada 2025" });
  });
  it("na virada do ano, o mês passado é dezembro do ano anterior", () => {
    const jan = new Date("2027-01-05T15:00:00Z");
    expect(getPreviousViewPeriod("month", jan).key).toBe("M2026-12");
    expect(getPreviousViewPeriod("week", jan).key).toBe("W2026-12-28");
  });
});
