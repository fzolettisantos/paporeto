import type { Participant, RankingSlug, RankingView } from "@/types";

/** Participantes do Papo Reto, na ordem administrativa. Também estão na carga inicial do banco. */
export const PAPO_RETO_CAST: Participant[] = [
  { id: "kleber", slug: "kleber", name: "Kleber o Gladiador", nickname: null, sortOrder: 1, avatarPaths: {} },
  { id: "benja", slug: "benja", name: "Benja", nickname: null, sortOrder: 2, avatarPaths: {} },
  { id: "mano", slug: "mano", name: "Mano", nickname: null, sortOrder: 3, avatarPaths: {} },
  { id: "joneta", slug: "joneta", name: "Joneta", nickname: null, sortOrder: 4, avatarPaths: {} },
  { id: "carabina", slug: "carabina", name: "Carabina", nickname: null, sortOrder: 5, avatarPaths: {} },
  { id: "gadu", slug: "gadu", name: "Gadu Boyceta", nickname: "Caique Silva", sortOrder: 6, avatarPaths: {} },
  {
    id: "veio-tricolor",
    slug: "veio-tricolor",
    name: "Véio Fanático Tricolor",
    nickname: null,
    sortOrder: 7,
    avatarPaths: {},
    // Também entra no Bala do Véio (levou um tiro dele mesmo, EP 629).
    rankings: null,
  },
  // Só no Bala do Véio (citados nos dados do programa). Rostos a enviar: por enquanto, ilustração provisória.
  ...(
    [
      ["serdan", "Serdan", null],
      ["oberdan", "Oberdan", null],
      ["lucas-samuel", "Lucas Samuel", "do chat"],
      ["dentinho", "Dentinho", null],
      ["luiz-gusttavo", "Luiz Gusttavo", "torcedor do Cruzeiro"],
      ["mastigasamba", "Mastigasamba", null],
      ["bruno-di-santi", "Bruno Di Santi", null],
      ["nem", "Nem", null],
      ["grafiteiro", "O Grafiteiro", "que fizer o escudo do Palmeiras no muro do Véio"],
    ] as const
  ).map(
    ([slug, name, nickname], i): Participant => ({
      id: slug,
      slug,
      name,
      nickname,
      sortOrder: 8 + i,
      avatarPaths: {},
      rankings: ["bala-do-veio"],
    }),
  ),
];

/**
 * MODO DEMONSTRAÇÃO — usado apenas quando o Supabase não está configurado.
 * Participantes reais, mas números e ordens SIMULADOS. Nada aqui representa votos reais.
 */
export const DEMO_PARTICIPANTS: Participant[] = PAPO_RETO_CAST;

/**
 * Votos SIMULADOS iniciais do modo demonstração, por recorte (só rankings com votação).
 * Ordens diferentes em cada recorte para mostrar que semana, mês e temporada são rankings próprios.
 */
export const DEMO_SEED_VOTES: Record<RankingSlug, Record<RankingView, Record<string, number>>> = {
  "falou-merda": {
    week: { benja: 1284, mano: 978, "veio-tricolor": 701, joneta: 623, kleber: 412, carabina: 341, gadu: 118 },
    month: { mano: 4120, benja: 3876, "veio-tricolor": 2650, joneta: 2210, carabina: 1534, kleber: 1302, gadu: 640 },
    season: { benja: 38210, "veio-tricolor": 36120, mano: 35990, carabina: 21455, joneta: 19870, gadu: 12004, kleber: 9876 },
  },
  sabio: {
    week: { mano: 515, benja: 402, kleber: 233, joneta: 233, gadu: 150, carabina: 87, "veio-tricolor": 41 },
    month: { kleber: 1980, mano: 1745, benja: 1502, joneta: 990, "veio-tricolor": 720, gadu: 610, carabina: 402 },
    season: { kleber: 21340, benja: 19870, mano: 18011, gadu: 9120, joneta: 8705, carabina: 5230, "veio-tricolor": 3100 },
  },
  "bala-do-veio": { week: {}, month: {}, season: {} },
};

/** Placar SIMULADO do período anterior de cada recorte (para "Últimos campeões" no modo demonstração). */
export const DEMO_PREVIOUS_VOTES: Partial<Record<RankingSlug, Record<RankingView, Record<string, number>>>> = {
  "falou-merda": {
    week: { mano: 1502, benja: 1340, "veio-tricolor": 880, joneta: 410, kleber: 233, carabina: 190, gadu: 98 },
    month: { benja: 5230, mano: 4987, joneta: 2210, "veio-tricolor": 1900, carabina: 1201, kleber: 980, gadu: 455 },
    season: { "veio-tricolor": 41200, benja: 39850, mano: 37010, carabina: 18300, joneta: 15020, gadu: 9100, kleber: 7300 },
  },
  sabio: {
    week: { kleber: 620, mano: 488, benja: 301, joneta: 199, gadu: 120, carabina: 77, "veio-tricolor": 30 },
    month: { mano: 2140, kleber: 1990, benja: 1320, joneta: 701, gadu: 520, carabina: 310, "veio-tricolor": 260 },
    season: { benja: 23100, kleber: 22040, mano: 17400, gadu: 8800, joneta: 8100, carabina: 4900, "veio-tricolor": 2800 },
  },
};
