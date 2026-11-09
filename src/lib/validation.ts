import { RANKING_SLUGS, TAB_SLUGS, type RankingSlug, type TabSlug } from "@/types";

export function isRankingSlug(value: unknown): value is RankingSlug {
  return typeof value === "string" && (RANKING_SLUGS as readonly string[]).includes(value);
}
export function isTabSlug(value: unknown): value is TabSlug {
  return typeof value === "string" && (TAB_SLUGS as readonly string[]).includes(value);
}

/** IDs de participante: UUID (Supabase) ou slug (modo demonstração). */
const PARTICIPANT_ID = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-z0-9-]{2,40})$/i;
export function isParticipantId(value: unknown): value is string {
  return typeof value === "string" && PARTICIPANT_ID.test(value);
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface VoteRequest {
  ranking: RankingSlug;
  participantId: string;
}

export function parseVoteRequest(body: unknown): VoteRequest | null {
  if (!body || typeof body !== "object") return null;
  const { ranking, participantId } = body as Record<string, unknown>;
  if (!isRankingSlug(ranking) || !isParticipantId(participantId)) return null;
  return { ranking, participantId };
}
