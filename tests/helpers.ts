import { rankEntries } from "@/lib/ranking";
import type { Participant } from "@/types";

export function participant(slug: string, sortOrder = 0): Participant {
  return { id: slug, slug, name: slug.toUpperCase(), nickname: null, sortOrder, avatarPaths: {} };
}

/** rankEntries a partir de { slug: votos }, ordem administrativa = ordem das chaves. */
export function rank(votes: Record<string, number>) {
  return rankEntries(Object.entries(votes).map(([slug, v], i) => ({ participant: participant(slug, i), votes: v })));
}

export const summary = (entries: ReturnType<typeof rank>) =>
  entries.map((e) => `${e.position}:${e.participant.slug}:${e.state}${e.tied ? ":tie" : ""}`);
