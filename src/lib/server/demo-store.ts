import "server-only";
import { DEMO_PARTICIPANTS, DEMO_SEED_VOTES } from "@/config/demo";
import { inRanking, type RankingSlug, type RankingView, type VoteStatus } from "@/types";

/**
 * Armazenamento em memória do MODO DEMONSTRAÇÃO. Os números partem de valores simulados,
 * vivem apenas enquanto a instância do servidor estiver ativa e não são votos reais.
 */
interface DemoState {
  totals: Map<string, number>;
  voters: Map<string, string>;
  perIp: Map<string, number>;
}

const globalStore = globalThis as unknown as { __prrDemo?: DemoState };

function state(): DemoState {
  globalStore.__prrDemo ??= { totals: new Map(), voters: new Map(), perIp: new Map() };
  return globalStore.__prrDemo;
}

const totalKey = (slug: string, period: string, participant: string) => `${slug}|${period}|${participant}`;

/** Placar de um recorte (semana, mês ou temporada) identificado pela chave do período. */
export function demoTotals(slug: RankingSlug, periodKey: string, view: RankingView = "week"): Record<string, number> {
  const s = state();
  return Object.fromEntries(
    DEMO_PARTICIPANTS.map((p) => [
      p.id,
      s.totals.get(totalKey(slug, periodKey, p.id)) ?? DEMO_SEED_VOTES[slug][view][p.id] ?? 0,
    ]),
  );
}

export function demoMyVote(slug: RankingSlug, weekKey: string, voterKey: string): string | null {
  return state().voters.get(`${slug}|${weekKey}|${voterKey}`) ?? null;
}

/** Mesmas regras do banco: 1 voto por semana; o voto soma na semana, no mês e na temporada. */
export function demoCastVote(input: {
  slug: RankingSlug;
  keys: Record<RankingView, string>;
  participantId: string;
  voterKey: string;
  ipHash: string;
  ipLimit: number;
}): VoteStatus {
  const s = state();
  if (!DEMO_PARTICIPANTS.some((p) => p.id === input.participantId && inRanking(p, input.slug))) return "invalid";
  const voterKey = `${input.slug}|${input.keys.week}|${input.voterKey}`;
  if (s.voters.has(voterKey)) return "duplicate";
  const ipKey = `${input.slug}|${input.keys.week}|${input.ipHash}`;
  if ((s.perIp.get(ipKey) ?? 0) >= input.ipLimit) return "ip_limit";

  for (const view of ["week", "month", "season"] as const) {
    const key = input.keys[view];
    const current = demoTotals(input.slug, key, view)[input.participantId] ?? 0;
    s.totals.set(totalKey(input.slug, key, input.participantId), current + 1);
  }
  s.voters.set(voterKey, input.participantId);
  s.perIp.set(ipKey, (s.perIp.get(ipKey) ?? 0) + 1);
  return "ok";
}

export function __resetDemoStore() {
  delete globalStore.__prrDemo;
}
