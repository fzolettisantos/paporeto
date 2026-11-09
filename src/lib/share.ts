import { RANKINGS } from "@/config/rankings";
import type { RankedEntry, RankingResults, RankingSlug } from "@/types";

const upper = (s: string) => s.toLocaleUpperCase("pt-BR");

/**
 * Texto de compartilhamento do ranking. Só afirma um resultado quando ele existe de verdade:
 * dados simulados ou sem votos geram um convite genérico.
 */
export function rankingShareText(slug: RankingSlug, results?: RankingResults | null): string {
  const copy = RANKINGS[slug];
  const isStatic = copy.mode === "static";
  const invite = isStatic
    ? `Olha quem tá na mira no ${copy.title}! A resenha é deles. A corneta é sua.`
    : `Vota aí no ${copy.title}! A resenha é deles. A corneta é sua.`;
  if (!results || results.isDemo || !hasResult(results)) return invite;
  const leaders = results.entries.filter((e) => e.position === 1);
  if (leaders.length !== 1) return `Empate no topo do ${copy.title}! ${invite}`;
  return `${upper(copy.leaderMessage(leaders[0]!.participant.name))}${periodSuffix(results)} ${isStatic ? "Confira:" : "Vota aí também:"}`;
}

/** " (TEMPORADA 2026)" / " (NOVEMBRO DE 2026)" — a semana é o padrão e não precisa de sufixo. */
function periodSuffix(results: RankingResults) {
  return results.mode === "vote" && results.view !== "week" ? ` (${upper(results.period.label)})` : "";
}

/** Há um resultado de verdade para mostrar? (votos, ou ordem definida no ranking estático) */
export function hasResult(results: RankingResults): boolean {
  return results.mode === "static" ? results.entries.length > 0 : results.totalVotes > 0;
}

/** Manchete do card compartilhável de um participante, coerente com a posição real. */
export function participantHeadline(slug: RankingSlug, entry: RankedEntry, results: RankingResults): string {
  const copy = RANKINGS[slug];
  const name = entry.participant.name;
  if (!hasResult(results) || entry.state === "neutral") return upper(`${copy.title}: ainda está tudo empatado!`);
  const suffix = periodSuffix(results);
  if (entry.position === 1 && !entry.tied) return upper(copy.leaderMessage(name)) + suffix;
  if (entry.position === 1) return upper(`${name} divide a liderança do ${copy.title}!`) + suffix;
  return upper(`${name} está em ${entry.position}º no ${copy.title}.`) + suffix;
}

export function whatsappUrl(text: string, url: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}
