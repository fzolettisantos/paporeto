import "server-only";
import type { RankingSlug, VoteStatus } from "@/types";
import { RANKINGS } from "@/config/rankings";
import { getVoteKeys } from "@/lib/period";
import { getRankingConfigs } from "./data";
import { demoCastVote } from "./demo-store";
import { getIpVoteLimit, isSupabaseConfigured } from "./env";
import { getServiceClient } from "./supabase";

const STATUSES: VoteStatus[] = ["ok", "duplicate", "ip_limit", "invalid", "closed", "not_votable"];

/**
 * Registra um voto. Toda a validação acontece no servidor/banco:
 * ranking ativo, participante ativo, um voto por votante/ranking/período e limite por IP.
 */
export async function castVote(input: {
  ranking: RankingSlug;
  participantId: string;
  voterKey: string;
  ipHash: string;
  now?: Date;
}): Promise<VoteStatus> {
  // Rankings estáticos (ex.: Bala do Véio) são definidos pelo programa: não aceitam votos.
  if (RANKINGS[input.ranking].mode !== "vote") return "not_votable";
  const [config] = await getRankingConfigs([input.ranking]);
  if (!config) return "invalid";
  if (!config.active) return "closed";
  // Voto diário que soma na semana, no mês e na temporada (ano) da data do voto.
  const keys = getVoteKeys(input.now ?? new Date(), { weekStartsOn: config.weekStartsOn });
  const ipLimit = getIpVoteLimit();

  if (!isSupabaseConfigured()) {
    return demoCastVote({
      slug: input.ranking,
      keys,
      participantId: input.participantId,
      voterKey: input.voterKey,
      ipHash: input.ipHash,
      ipLimit,
    });
  }

  const { data, error } = await getServiceClient().rpc("cast_vote", {
    p_ranking_slug: input.ranking,
    p_participant_id: input.participantId,
    p_period_key: keys.day,
    p_week_key: keys.week,
    p_month_key: keys.month,
    p_season_key: keys.season,
    p_voter_key: input.voterKey,
    p_ip_hash: input.ipHash,
    p_ip_limit: ipLimit,
  });
  if (error) {
    console.error("[vote] cast_vote falhou:", error.message);
    return "error";
  }
  return STATUSES.includes(data as VoteStatus) ? (data as VoteStatus) : "error";
}
