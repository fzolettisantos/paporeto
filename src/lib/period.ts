import type { PeriodKind, RankingView, VotingPeriod } from "@/types";

export const PERIOD_KINDS: PeriodKind[] = ["daily", "weekly", "monthly", "all_time"];
export const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function localDate(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const short = (d: Date) => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;

export function isPeriodKind(value: unknown): value is PeriodKind {
  return typeof value === "string" && (PERIOD_KINDS as string[]).includes(value);
}

/**
 * Período de votação atual, calculado no fuso do programa.
 * A chave identifica o período no banco (um voto por ranking, por período, por visitante).
 */
export function getVotingPeriod(
  kind: PeriodKind,
  now: Date = new Date(),
  options: { weekStartsOn?: number; timeZone?: string } = {},
): VotingPeriod {
  const { weekStartsOn = 1, timeZone = DEFAULT_TIME_ZONE } = options;
  const { year, month, day } = localDate(now, timeZone);
  const today = new Date(Date.UTC(year, month - 1, day));

  switch (kind) {
    case "daily":
      return { kind, key: `D${iso(today)}`, label: `Hoje (${short(today)})`, endsOn: iso(today) };
    case "monthly":
      return {
        kind,
        key: `M${year}-${pad(month)}`,
        label: `${MONTHS[month - 1]![0]!.toUpperCase()}${MONTHS[month - 1]!.slice(1)} de ${year}`,
        endsOn: iso(new Date(Date.UTC(year, month, 0))),
      };
    case "season":
      return { kind, key: `S${year}`, label: `Temporada ${year}`, endsOn: `${year}-12-31` };
    case "all_time":
      return { kind, key: "ALL", label: "Votação permanente" };
    case "weekly":
    default: {
      const start = new Date(today);
      const offset = (today.getUTCDay() - (((weekStartsOn % 7) + 7) % 7) + 7) % 7;
      start.setUTCDate(start.getUTCDate() - offset);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 6);
      return { kind: "weekly", key: `W${iso(start)}`, label: `Semana de ${short(start)} a ${short(end)}`, endsOn: iso(end) };
    }
  }
}

const VIEW_KIND: Record<RankingView, PeriodKind> = { week: "weekly", month: "monthly", season: "season" };

export function isRankingView(value: unknown): value is RankingView {
  return value === "week" || value === "month" || value === "season";
}

/** Período exibido para um recorte (semana, mês ou temporada). */
export function getViewPeriod(view: RankingView, now: Date = new Date(), options: { weekStartsOn?: number } = {}) {
  return getVotingPeriod(VIEW_KIND[view], now, options);
}

/**
 * Chaves de um voto: o dia (limita a 1 voto por dia) e a semana, o mês e a temporada
 * da data do voto, onde ele é somado.
 */
export function getVoteKeys(now: Date = new Date(), options: { weekStartsOn?: number } = {}) {
  return {
    day: getVotingPeriod("daily", now, options).key,
    week: getVotingPeriod("weekly", now, options).key,
    month: getVotingPeriod("monthly", now, options).key,
    season: getVotingPeriod("season", now, options).key,
  };
}

/** Primeiro dia (AAAA-MM-DD) de um período de semana, mês ou temporada, a partir da chave. */
function periodStart(period: VotingPeriod): string {
  if (period.key.startsWith("W")) return period.key.slice(1);
  if (period.key.startsWith("M")) return `${period.key.slice(1)}-01`;
  return `${period.key.slice(1)}-01-01`;
}

/** Período anterior ao recorte atual: semana passada, mês passado ou temporada passada. */
export function getPreviousViewPeriod(view: RankingView, now: Date = new Date(), options: { weekStartsOn?: number } = {}) {
  const current = getViewPeriod(view, now, options);
  // Meio-dia de Brasília do dia anterior ao início do período atual.
  const before = new Date(`${periodStart(current)}T12:00:00-03:00`);
  before.setUTCDate(before.getUTCDate() - 1);
  return getViewPeriod(view, before, options);
}

/** Dias inteiros até o fim do período (0 = último dia), contando no fuso do programa. */
export function daysUntil(endsOn: string, now: Date = new Date()) {
  const today = getVotingPeriod("daily", now).key.slice(1);
  const diff = Date.parse(`${endsOn}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Math.max(0, Math.round(diff / 86_400_000));
}

/** Recorte na URL, em português: ?periodo=semana | mes | temporada. */
export const VIEW_PARAM: Record<RankingView, string> = { week: "semana", month: "mes", season: "temporada" };
export const VIEW_LABEL: Record<RankingView, string> = { week: "Semana", month: "Mês", season: "Temporada" };

export function parseViewParam(value: string | null | undefined): RankingView {
  const found = (Object.keys(VIEW_PARAM) as RankingView[]).find((view) => VIEW_PARAM[view] === value);
  return found ?? "week";
}
