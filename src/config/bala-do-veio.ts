import type { BalaShot } from "@/types";

/**
 * BALA DO VÉIO — dados do programa (informados pelo Caique). Atualização de 11/11 (72 tiros).
 * Sem Supabase, o site mostra estes dados; com Supabase, a mesma lista é a carga inicial do banco
 * (supabase/papo-reto.sql) e as próximas atualizações são feitas pelo painel.
 * A ordem do ranking segue o total de tiros de cada um.
 */
export const BALA_UPDATED_AT = "2026-11-11T15:04:00-03:00";

/** Fonte dos dados, exibida no topo da aba. */
export const BALA_SOURCE = "Data Caique informa";

const shot = (
  id: string,
  quantity: number,
  location: string | null,
  extra: { place?: string; weapon?: string; note?: string; episode?: number; time?: string } = {},
): BalaShot => ({
  id,
  quantity,
  location,
  place: extra.place ?? null,
  weapon: extra.weapon ?? null,
  note: extra.note ?? null,
  episode: extra.episode ?? null,
  episodeTime: extra.time ?? null,
});

export const BALA_SHOTS: Record<string, BalaShot[]> = {
  kleber: [
    shot("kleber-1", 11, "Local não definido", { note: "+ ameaça com faca" }),
    shot("kleber-2", 2, "Na perna"),
    shot("kleber-3", 4, "Na testa"),
    shot("kleber-4", 3, "Na cabeça"),
  ],
  serdan: [
    shot("serdan-1", 18, "Local não definido"),
    shot("serdan-2", 1, "Na cara"),
  ],
  gadu: [
    shot("gadu-1", 7, "Na cara"),
  ],
  grafiteiro: [
    shot("grafiteiro-1", 7, "Local não definido", { note: "Se fizer o símbolo do Palmeiras no muro da casa do Véio" }),
  ],
  mano: [
    shot("mano-1", 2, "Na testa"),
    shot("mano-2", 2, "Na cara"),
    shot("mano-3", 1, "Local não definido"),
  ],
  "veio-tricolor": [
    shot("veio-tricolor-1", 1, "Na própria cabeça", { note: "Se apanhar do Mano e do Kleber" }),
    shot("veio-tricolor-2", 1, "No próprio ouvido", { note: "Se pichar o muro do XV" }),
    shot("veio-tricolor-3", 1, "No próprio ouvido", { note: "Se apanhar do Kleber" }),
    shot("veio-tricolor-4", 1, "Na própria cabeça", { note: "Se apanhar do Caravina", episode: 629, time: "1:08:12" }),
    shot("veio-tricolor-5", 1, "Na própria cabeça", { note: "Se perder pra alguém do programa na disputa de quem tem o maior QI" }),
  ],
  nem: [
    shot("nem-1", 2, "Na testa"),
  ],
  "luiz-gusttavo": [
    shot("luiz-gusttavo-1", 1, "Na testa"),
  ],
  carabina: [
    shot("carabina-1", 1, "Na testa"),
  ],
  mastigasamba: [
    shot("mastigasamba-1", 1, "Local não definido", { note: "“Foda-se o Mastigasamba”" }),
  ],
  "bruno-di-santi": [
    shot("bruno-di-santi-1", 1, "Local não definido", { note: "+ ameaça de pendurar 3 dias numa árvore" }),
  ],
  oberdan: [
    shot("oberdan-1", 1, "Local não definido"),
  ],
  "lucas-samuel": [
    shot("lucas-samuel-1", 1, "Local não definido"),
  ],
  dentinho: [
    shot("dentinho-1", 1, null),
  ],
};
