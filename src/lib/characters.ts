import manifest from "@/generated/character-manifest.json";
import type { AvatarPaths, ExpressionState, RankingSlug } from "@/types";

type Manifest = Record<string, AvatarPaths>;
const localManifest = manifest as Manifest;

/**
 * Caricatura de um participante para um ranking e estado.
 * Prioridade: arquivo cadastrado no banco (Supabase Storage) → arquivo em public/characters.
 * Retorna `null` quando a expressão exata não existe: o placeholder neutro entra no lugar,
 * nunca outra expressão.
 */
export function resolveCharacterImage(
  characterId: string,
  ranking: RankingSlug,
  state: ExpressionState,
  overrides?: AvatarPaths,
): string | null {
  return overrides?.[ranking]?.[state] ?? localManifest[characterId]?.[ranking]?.[state] ?? null;
}

/** Desenho genérico usado pelo placeholder (sem retratar ninguém). */
export type PlaceholderMood =
  | "neutral"
  | "scared"
  | "lookingUp"
  | "smiling"
  | "proud"
  | "thinking"
  | "confused"
  | "terrified"
  | "worried"
  | "relieved";

const MOODS: Record<RankingSlug, Record<ExpressionState, PlaceholderMood>> = {
  "falou-merda": { top: "scared", middle: "lookingUp", bottom: "smiling", neutral: "neutral" },
  sabio: { top: "proud", middle: "thinking", bottom: "confused", neutral: "neutral" },
  "bala-do-veio": { top: "terrified", middle: "worried", bottom: "relieved", neutral: "neutral" },
};

export function placeholderMood(ranking: RankingSlug, state: ExpressionState): PlaceholderMood {
  return MOODS[ranking][state];
}
