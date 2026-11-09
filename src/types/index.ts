/** Rankings com votação. A ordem define a ordem das abas. */
export const RANKING_SLUGS = ["falou-merda", "sabio", "bala-do-veio"] as const;
export type RankingSlug = (typeof RANKING_SLUGS)[number];

/** Abas da Home: os três rankings + a galeria de charges. */
export const TAB_SLUGS = [...RANKING_SLUGS, "charges"] as const;
export type TabSlug = (typeof TAB_SLUGS)[number];

/** Negativo: estar no topo é ruim. Positivo: estar no topo é bom. */
export type RankingKind = "positive" | "negative";

/** `vote`: o público vota. `static`: a ordem é definida pelo programa (sem votação). */
export type RankingMode = "vote" | "static";

/** Estados de expressão das caricaturas. `neutral` só aparece quando ninguém se destaca. */
export const EXPRESSION_STATES = ["top", "middle", "bottom", "neutral"] as const;
export type ExpressionState = (typeof EXPRESSION_STATES)[number];

export type PeriodKind = "daily" | "weekly" | "monthly" | "season" | "all_time";

/**
 * Recortes dos rankings com votação. O voto é semanal e conta ao mesmo tempo
 * para a semana, o mês e a temporada (o ano — termina em 31/12).
 */
export const RANKING_VIEWS = ["week", "month", "season"] as const;
export type RankingView = (typeof RANKING_VIEWS)[number];

/** Caminhos/URLs de caricaturas por ranking e estado (vindos do banco). */
export type AvatarPaths = Partial<Record<RankingSlug, Partial<Record<ExpressionState, string>>>>;

export interface Participant {
  id: string;
  slug: string;
  name: string;
  nickname: string | null;
  /** Ordem administrativa; também desempata a exibição. */
  sortOrder: number;
  avatarPaths: AvatarPaths;
  /** Rankings em que o participante aparece. `null`/ausente = todos. */
  rankings?: RankingSlug[] | null;
}

/** O participante entra neste ranking? */
export function inRanking(participant: Pick<Participant, "rankings">, slug: RankingSlug) {
  return !participant.rankings || participant.rankings.length === 0 || participant.rankings.includes(slug);
}

export interface RankedEntry {
  participant: Participant;
  votes: number;
  /** Percentual exato (0–100) dos votos do ranking. */
  percent: number;
  /** Posição esportiva: empatados dividem a posição (1, 1, 3…). */
  position: number;
  /** Verdadeiro quando outro participante tem a mesma quantidade de votos. */
  tied: boolean;
  state: ExpressionState;
}

export interface VotingPeriod {
  kind: PeriodKind;
  key: string;
  label: string;
  /** Último dia do período (AAAA-MM-DD), no fuso do programa. */
  endsOn?: string;
}

/** Registro de "tiros" do Bala do Véio (brincadeira do programa), cadastrado no painel. */
export interface BalaShot {
  id: string;
  quantity: number;
  /** Local do tiro (ex.: "Na testa"). Opcional. */
  location: string | null;
  /** Tipo de arma (ex.: "Berinjela"). Opcional. */
  weapon: string | null;
  /** Localidade onde aconteceu (ex.: "Episódio 360"). Opcional. */
  place: string | null;
  /** Motivo ou observação (ex.: "Porque falou da Dona Bila"). Opcional. */
  note: string | null;
}

export interface RankingResults {
  slug: RankingSlug;
  mode: RankingMode;
  /** Recorte exibido (semana, mês ou temporada). Rankings estáticos usam "season". */
  view: RankingView;
  /** `false` quando o ranking foi desativado na administração. */
  active: boolean;
  period: VotingPeriod;
  /** Sempre 0 em rankings estáticos. */
  totalVotes: number;
  entries: RankedEntry[];
  /** Dados simulados (modo demonstração, sem Supabase). */
  isDemo: boolean;
  updatedAt: string;
  /** Participante em quem este visitante votou no período, quando conhecido. */
  myVote?: string | null;
  /** Período em que se vota (a semana atual): o voto do visitante vale para ele. */
  votingPeriod?: VotingPeriod;
  /** Rankings estáticos: quando o programa atualizou a ordem pela última vez. */
  standingsUpdatedAt?: string | null;
  /** Bala do Véio: tiros por participante (id → registros) e total de todos. */
  shots?: Record<string, BalaShot[]>;
  totalShots?: number;
}

export interface Charge {
  id: string;
  title: string;
  imageUrl: string;
  description: string | null;
  credits: string;
  publishedOn: string;
  width?: number | null;
  height?: number | null;
}

export type VoteStatus = "ok" | "duplicate" | "ip_limit" | "rate_limited" | "invalid" | "closed" | "not_votable" | "error";
