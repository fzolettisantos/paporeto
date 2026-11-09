import { describe, expect, it } from "vitest";
import { computeMoves, formatPercent, formatVotes, mergeLiveNumbers, resolveExpressionState, sameStanding } from "@/lib/ranking";
import { rank, summary } from "./helpers";

describe("resolveExpressionState (regra por posição)", () => {
  it("1 participante → neutro", () => expect(resolveExpressionState(1, 1)).toBe("neutral"));
  it("2 participantes → TOP e BOTTOM", () => {
    expect(resolveExpressionState(1, 2)).toBe("top");
    expect(resolveExpressionState(2, 2)).toBe("bottom");
  });
  it("3+ participantes → TOP, MIDDLE…, BOTTOM", () => {
    expect([1, 2, 3, 4, 5].map((p) => resolveExpressionState(p, 5))).toEqual(["top", "middle", "middle", "middle", "bottom"]);
  });
});

describe("rankEntries", () => {
  it("ordena por votos e atribui expressões", () => {
    expect(summary(rank({ a: 10, b: 30, c: 20 }))).toEqual(["1:b:top", "2:c:middle", "3:a:bottom"]);
  });

  it("não depende do nome: qualquer participante reage à posição", () => {
    expect(summary(rank({ benja: 1, outro: 9 }))).toEqual(["1:outro:top", "2:benja:bottom"]);
    expect(summary(rank({ benja: 9, outro: 1 }))).toEqual(["1:benja:top", "2:outro:bottom"]);
  });

  it("um participante só fica neutro", () => {
    expect(summary(rank({ benja: 50 }))).toEqual(["1:benja:neutral"]);
  });

  it("sem votos: todos empatados e neutros", () => {
    expect(summary(rank({ a: 0, b: 0, c: 0 }))).toEqual(["1:a:neutral:tie", "1:b:neutral:tie", "1:c:neutral:tie"]);
  });

  it("empate no topo: dividem a posição e a expressão TOP", () => {
    expect(summary(rank({ a: 5, b: 9, c: 9, d: 1 }))).toEqual(["1:b:top:tie", "1:c:top:tie", "3:a:middle", "4:d:bottom"]);
  });

  it("empate na lanterna: ambos BOTTOM, com posição esportiva", () => {
    expect(summary(rank({ a: 10, b: 2, c: 5, d: 2 }))).toEqual(["1:a:top", "2:c:middle", "3:b:bottom:tie", "3:d:bottom:tie"]);
  });

  it("dois empatados → neutros", () => {
    expect(summary(rank({ a: 4, b: 4 }))).toEqual(["1:a:neutral:tie", "1:b:neutral:tie"]);
  });

  it("empate é exibido em ordem administrativa estável", () => {
    const entries = rank({ z: 3, a: 3, m: 1 });
    expect(entries.map((e) => e.participant.slug)).toEqual(["z", "a", "m"]);
  });

  it("calcula percentuais que somam 100", () => {
    const entries = rank({ a: 1, b: 1, c: 2 });
    expect(entries.map((e) => e.percent)).toEqual([50, 25, 25]);
    expect(entries.reduce((s, e) => s + e.percent, 0)).toBeCloseTo(100);
  });

  it("ignora votos negativos/inválidos", () => {
    expect(rank({ a: -5, b: 2 }).map((e) => e.votes)).toEqual([2, 0]);
  });
});

describe("troca de posições", () => {
  it("detecta quem subiu e quem caiu", () => {
    const before = rank({ a: 10, b: 5, c: 1 });
    const after = rank({ a: 10, b: 12, c: 1 });
    expect(computeMoves(before, after)).toEqual({ b: "up", a: "down" });
    expect(sameStanding(before, after)).toBe(false);
    expect(sameStanding(before, rank({ a: 11, b: 5, c: 1 }))).toBe(true);
  });

  it("segura a ordem exibida e atualiza só os números", () => {
    const shown = rank({ a: 10, b: 5 });
    const live = rank({ a: 10, b: 15 });
    const merged = mergeLiveNumbers(shown, live)!;
    expect(merged.map((e) => [e.participant.slug, e.position, e.votes])).toEqual([["a", 1, 10], ["b", 2, 15]]);
  });

  it("não segura quando a lista de participantes muda", () => {
    expect(mergeLiveNumbers(rank({ a: 1, b: 2 }), rank({ a: 1, b: 2, c: 0 }))).toBeNull();
  });
});

describe("formatação", () => {
  it("formata votos e percentuais em pt-BR", () => {
    expect(formatVotes(1284)).toBe("1.284 votos");
    expect(formatVotes(1)).toBe("1 voto");
    expect(formatPercent(37.6)).toBe("38%");
    expect(formatPercent(0.4)).toBe("<1%");
    expect(formatPercent(0)).toBe("0%");
  });
});
