import "server-only";

/** Supabase configurado no servidor? Sem isso o site roda em modo demonstração. */
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export class ConfigError extends Error {}

const DEMO_SECRET = "papo-reto-ranking-demo-secret-nao-use-em-producao";

/** Segredo usado para assinar o cookie de votação e gerar hashes (IP e votante). */
export function getVoteSecret(): string {
  const secret = process.env.VOTE_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (isSupabaseConfigured()) {
    throw new ConfigError("VOTE_SECRET ausente ou curto (mínimo de 32 caracteres).");
  }
  return DEMO_SECRET;
}

/** Máximo de votos por IP, por ranking e por período (redes compartilhadas têm vários votantes). */
export function getIpVoteLimit(): number {
  const value = Number(process.env.VOTE_IP_LIMIT_PER_PERIOD);
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 20;
}
