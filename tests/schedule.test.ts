import { describe, expect, it } from "vitest";
import { formatCountdown, getShowStatus, nextShowLabel } from "@/lib/schedule";

// Horários em UTC; Brasília = UTC−3. 2026-11-09 é segunda-feira.
const at = (iso: string) => getShowStatus(new Date(iso));

describe("horário do programa (seg–sex, 12h–14h, Brasília)", () => {
  it("no ar durante o programa", () => {
    const s = at("2026-11-09T15:30:00Z"); // seg 12h30
    expect(s.live).toBe(true);
    expect(s.secondsToEnd).toBe(90 * 60);
  });

  it("antes do programa: hoje às 12h", () => {
    const s = at("2026-11-09T13:00:00Z"); // seg 10h
    expect(s.live).toBe(false);
    expect(nextShowLabel(s)).toBe("Hoje às 12h");
    expect(s.secondsToStart).toBe(2 * 3600);
  });

  it("às 14h em ponto já acabou; próximo é amanhã", () => {
    const s = at("2026-11-09T17:00:00Z"); // seg 14h
    expect(s.live).toBe(false);
    expect(nextShowLabel(s)).toBe("Amanhã às 12h");
  });

  it("sexta à tarde e fim de semana: próximo é segunda", () => {
    expect(nextShowLabel(at("2026-11-13T18:00:00Z"))).toBe("Segunda às 12h"); // sex 15h
    expect(nextShowLabel(at("2026-11-14T15:30:00Z"))).toBe("Segunda às 12h"); // sáb 12h30
    expect(at("2026-11-14T15:30:00Z").live).toBe(false);
    expect(nextShowLabel(at("2026-11-15T15:00:00Z"))).toBe("Amanhã às 12h"); // dom 12h
  });

  it("usa o fuso de Brasília (meia-noite UTC ainda é o dia anterior)", () => {
    // ter 00h30 UTC = seg 21h30 em Brasília → próximo é amanhã (terça)
    expect(nextShowLabel(at("2026-11-10T00:30:00Z"))).toBe("Amanhã às 12h");
  });

  it("formata a contagem regressiva", () => {
    expect(formatCountdown(2 * 86_400 + 3 * 3600 + 15 * 60)).toBe("2d 03h 15min");
    expect(formatCountdown(3 * 3600 + 5 * 60)).toBe("03h 05min");
    expect(formatCountdown(15 * 60 + 7)).toBe("15min 07s");
  });
});
