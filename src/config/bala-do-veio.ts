import type { BalaShot } from "@/types";

/**
 * BALA DO VÉIO — dados do programa (informados pelo Caique). Atualização de 09/11.
 * Sem Supabase, o site mostra estes dados; com Supabase, a mesma lista é a carga inicial do banco
 * (supabase/papo-reto.sql) e as próximas atualizações são feitas pelo painel.
 * A ordem do ranking segue o total de tiros de cada um.
 */
export const BALA_UPDATED_AT = "2026-11-09T12:00:00-03:00";

const shot = (
  id: string,
  quantity: number,
  location: string | null,
  extra: { place?: string; weapon?: string; note?: string } = {},
): BalaShot => ({ id, quantity, location, place: extra.place ?? null, weapon: extra.weapon ?? null, note: extra.note ?? null });

export const BALA_SHOTS: Record<string, BalaShot[]> = {
  serdan: [shot("serdan-1", 12, "Na testa")],
  gadu: [shot("gadu-1", 7, "Local não pré-definido")],
  carabina: [shot("carabina-1", 1, "Na cara")],
  oberdan: [shot("oberdan-1", 1, "Local não pré-definido")],
  mano: [shot("mano-1", 1, "Na cara", { note: "Porque falou da Dona Bila" })],
  "lucas-samuel": [shot("lucas-samuel-1", 1, null, { place: "Chat" })],
  dentinho: [shot("dentinho-1", 1, null)],
  "luiz-gusttavo": [shot("luiz-gusttavo-1", 1, "Na testa")],
  mastigasamba: [shot("mastigasamba-1", 1, null, { note: "“Foda-se o Mastigasamba”" })],
  "bruno-di-santi": [
    shot("bruno-di-santi-1", 1, null, {
      note: "Ameaça feita nas entrelinhas + combo de deixar ele amarrado numa árvore 3 dias",
    }),
  ],
  kleber: [shot("kleber-1", 10, null), shot("kleber-2", 2, "Na perna", { note: "Última atualização (09/11)" })],
  nem: [shot("nem-1", 1, "Na boca", { place: "Episódio 360" })],
  "douglas-dias": [
    shot("douglas-dias-1", 7, null, {
      note: "Pediu pra um grafiteiro fazer o escudo do Palmeiras no muro da casa do Véio",
    }),
  ],
  "veio-tricolor": [
    shot("veio-tricolor-1", 1, "Na cabeça (nele mesmo)", {
      place: "EP 629, aos 1:08:12",
      note: "“Se eu apanhar de um gordinho desse (Carabina) eu dou um tiro na minha cabeça”",
    }),
  ],
};
