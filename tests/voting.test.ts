import { beforeEach, describe, expect, it } from "vitest";
import { __resetRateLimit, rateLimit } from "@/lib/rate-limit";
import { parseVoteRequest } from "@/lib/validation";
import { __resetDemoStore, demoCastVote, demoMyVote, demoTotals } from "@/lib/server/demo-store";

const keys = { week: "W2026-11-09", month: "M2026-11", season: "S2026" };
const base = { slug: "falou-merda" as const, keys, ipHash: "ip1", ipLimit: 3 };

describe("votação (modo demonstração, mesma regra do banco)", () => {
  beforeEach(() => __resetDemoStore());

  it("registra o voto e soma no placar", () => {
    const before = demoTotals("falou-merda", keys.week)["joneta"]!;
    expect(demoCastVote({ ...base, participantId: "joneta", voterKey: "v1" })).toBe("ok");
    expect(demoTotals("falou-merda", keys.week)["joneta"]).toBe(before + 1);
    expect(demoMyVote("falou-merda", keys.week, "v1")).toBe("joneta");
  });

  it("o voto soma na semana, no mês e na temporada", () => {
    const before = (view: "week" | "month" | "season") => demoTotals("sabio", keys[view], view).joneta!;
    const b = { week: before("week"), month: before("month"), season: before("season") };
    expect(demoCastVote({ ...base, slug: "sabio", participantId: "joneta", voterKey: "v9" })).toBe("ok");
    expect(before("week")).toBe(b.week + 1);
    expect(before("month")).toBe(b.month + 1);
    expect(before("season")).toBe(b.season + 1);
  });

  it("bloqueia voto duplicado no mesmo ranking e período", () => {
    expect(demoCastVote({ ...base, participantId: "benja", voterKey: "v1" })).toBe("ok");
    expect(demoCastVote({ ...base, participantId: "mano", voterKey: "v1" })).toBe("duplicate");
  });

  it("permite votar em outro ranking e no período seguinte", () => {
    expect(demoCastVote({ ...base, participantId: "benja", voterKey: "v1" })).toBe("ok");
    expect(demoCastVote({ ...base, slug: "sabio", participantId: "benja", voterKey: "v1" })).toBe("ok");
    expect(demoCastVote({ ...base, keys: { ...keys, week: "W2026-11-16" }, participantId: "benja", voterKey: "v1" })).toBe("ok");
  });

  it("limita votos por IP no período (troca de cookie não burla)", () => {
    for (const v of ["a", "b", "c"]) expect(demoCastVote({ ...base, participantId: "benja", voterKey: v })).toBe("ok");
    expect(demoCastVote({ ...base, participantId: "benja", voterKey: "d" })).toBe("ip_limit");
  });

  it("rejeita participante inexistente", () => {
    expect(demoCastVote({ ...base, participantId: "nao-existe", voterKey: "v1" })).toBe("invalid");
  });
});

describe("validação da requisição", () => {
  it("aceita só rankings e IDs válidos", () => {
    expect(parseVoteRequest({ ranking: "sabio", participantId: "benja" })).toEqual({ ranking: "sabio", participantId: "benja" });
    expect(parseVoteRequest({ ranking: "charges", participantId: "benja" })).toBeNull();
    expect(parseVoteRequest({ ranking: "sabio", participantId: "x'; drop table votes;--" })).toBeNull();
    expect(parseVoteRequest(null)).toBeNull();
  });
});

describe("rate limit", () => {
  beforeEach(() => __resetRateLimit());
  it("bloqueia rajadas e libera após a janela", () => {
    const opts = { limit: 2, windowMs: 1000 };
    expect(rateLimit("ip", opts, 0).allowed).toBe(true);
    expect(rateLimit("ip", opts, 10).allowed).toBe(true);
    expect(rateLimit("ip", opts, 20)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(rateLimit("ip", opts, 1001).allowed).toBe(true);
  });
});

describe("participante fora do ranking", () => {
  beforeEach(() => __resetDemoStore());
  it("não recebe voto em ranking em que não entra", () => {
    const k = { week: "W2026-11-09", month: "M2026-11", season: "S2026" };
    expect(demoCastVote({ slug: "sabio", keys: k, participantId: "serdan", voterKey: "x", ipHash: "i", ipLimit: 9 })).toBe("invalid");
    expect(demoCastVote({ slug: "sabio", keys: k, participantId: "veio-tricolor", voterKey: "x", ipHash: "i", ipLimit: 9 })).toBe("ok");
  });
});

describe("senha do painel", () => {
  it("ignora espaços nas pontas da senha digitada e da cadastrada", async () => {
    process.env.ADMIN_PASSWORD = "  Corneta#2026\n";
    process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
    const { checkPassword, isAdminConfigured } = await import("@/lib/server/admin-auth");
    expect(isAdminConfigured()).toBe(true);
    expect(checkPassword("Corneta#2026")).toBe(true);
    expect(checkPassword(" Corneta#2026 ")).toBe(true);
    expect(checkPassword("corneta#2026")).toBe(false);
  });
});
