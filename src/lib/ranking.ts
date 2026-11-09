import type { ExpressionState, Participant, RankedEntry } from "@/types";

export interface VoteCount {
  participant: Participant;
  votes: number;
}

/**
 * Estado de expressão a partir da posição — regra base pedida no briefing:
 * 1 participante → neutro; 2 → primeiro TOP e segundo BOTTOM;
 * 3+ → primeiro TOP, último BOTTOM, demais MIDDLE.
 *
 * Para rankings com empates use `rankEntries`, que aplica a regra por grupo de votos.
 */
export function resolveExpressionState(position: number, totalParticipants: number): ExpressionState {
  if (totalParticipants <= 1) return "neutral";
  if (position <= 1) return "top";
  if (position >= totalParticipants) return "bottom";
  return "middle";
}

/** Desempate de exibição estável: ordem administrativa e depois nome. Não altera a posição. */
function displayTiebreak(a: VoteCount, b: VoteCount) {
  return (
    a.participant.sortOrder - b.participant.sortOrder ||
    a.participant.name.localeCompare(b.participant.name, "pt-BR") ||
    a.participant.id.localeCompare(b.participant.id)
  );
}

/**
 * Ordena e classifica os participantes.
 *
 * Empates (regra consistente e documentada no README):
 * - Quem tem a mesma quantidade de votos divide a posição (classificação esportiva: 1, 1, 3).
 * - A expressão é definida pelo grupo de votos: o grupo com mais votos é TOP, o grupo com menos é
 *   BOTTOM e os grupos intermediários são MIDDLE.
 * - Se todos estiverem empatados (inclusive sem nenhum voto), ninguém se destacou: todos ficam NEUTRAL.
 * - Dentro de um empate, a ordem visual segue a ordem administrativa e o nome — nunca altera a posição.
 */
export function rankEntries(counts: VoteCount[]): RankedEntry[] {
  const sorted = [...counts]
    .map((c) => ({ ...c, votes: Math.max(0, Math.floor(c.votes || 0)) }))
    .sort((a, b) => b.votes - a.votes || displayTiebreak(a, b));
  const total = sorted.reduce((sum, c) => sum + c.votes, 0);
  if (sorted.length === 0) return [];

  const max = sorted[0]!.votes;
  const min = sorted[sorted.length - 1]!.votes;
  const frequency = new Map<number, number>();
  for (const c of sorted) frequency.set(c.votes, (frequency.get(c.votes) ?? 0) + 1);

  let position = 0;
  let previousVotes: number | null = null;
  return sorted.map((c, index) => {
    if (c.votes !== previousVotes) position = index + 1;
    previousVotes = c.votes;

    let state: ExpressionState;
    if (sorted.length === 1 || max === min) state = "neutral";
    else if (c.votes === max) state = "top";
    else if (c.votes === min) state = "bottom";
    else state = "middle";

    return {
      participant: c.participant,
      votes: c.votes,
      percent: total > 0 ? (c.votes / total) * 100 : 0,
      position,
      tied: (frequency.get(c.votes) ?? 0) > 1,
      state,
    };
  });
}

export interface StaticPosition {
  participant: Participant;
  /** Posição definida pelo programa (1 = topo). Valores iguais = empate. */
  position: number;
}

/**
 * Ranking estático (definido pelo programa, sem votos). Mesmas regras de posição e expressão
 * do ranking votado: posições iguais empatam, buracos na numeração são normalizados (1, 3, 7 → 1, 2, 3)
 * e quem não tem posição definida fica fora da lista.
 */
export function rankStatic(items: StaticPosition[]): RankedEntry[] {
  const valid = items.filter((i) => Number.isFinite(i.position) && i.position >= 1);
  const max = Math.max(0, ...valid.map((i) => Math.floor(i.position)));
  // Reaproveita a classificação por votos: posição menor vira "pontuação" maior.
  return rankEntries(valid.map((i) => ({ participant: i.participant, votes: max + 1 - Math.floor(i.position) }))).map(
    (entry) => ({ ...entry, votes: 0, percent: 0 }),
  );
}

/** Percentual para exibição: inteiro, mas nunca "0%" para quem tem votos. */
export function formatPercent(percent: number): string {
  if (percent <= 0) return "0%";
  if (percent < 1) return "<1%";
  return `${Math.round(percent)}%`;
}

const numberFormat = new Intl.NumberFormat("pt-BR");
export function formatVotes(votes: number): string {
  return `${numberFormat.format(votes)} ${votes === 1 ? "voto" : "votos"}`;
}
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** Compara duas classificações: mesma ordem e mesmas posições/estados. */
export function sameStanding(a: RankedEntry[], b: RankedEntry[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((entry, i) => {
    const other = b[i]!;
    return (
      entry.participant.id === other.participant.id &&
      entry.position === other.position &&
      entry.state === other.state &&
      entry.tied === other.tied
    );
  });
}

/** Quem subiu ou caiu de posição entre duas classificações (participantes novos são ignorados). */
export function computeMoves(previous: RankedEntry[], next: RankedEntry[]): Record<string, "up" | "down"> {
  const before = new Map(previous.map((e) => [e.participant.id, e.position]));
  const moves: Record<string, "up" | "down"> = {};
  for (const entry of next) {
    const old = before.get(entry.participant.id);
    if (old === undefined || old === entry.position) continue;
    moves[entry.participant.id] = entry.position < old ? "up" : "down";
  }
  return moves;
}

/**
 * Exibição "segurada": mantém a ordem/posições/expressões mostradas e atualiza só os números.
 * Evita que os cards troquem de lugar enquanto a pessoa tenta votar.
 */
export function mergeLiveNumbers(shown: RankedEntry[], live: RankedEntry[]): RankedEntry[] | null {
  const liveById = new Map(live.map((e) => [e.participant.id, e]));
  if (shown.length !== live.length || shown.some((e) => !liveById.has(e.participant.id))) return null;
  return shown.map((e) => {
    const current = liveById.get(e.participant.id)!;
    return { ...e, votes: current.votes, percent: current.percent, participant: current.participant };
  });
}
