/**
 * Rate limit em memória (janela deslizante). Protege cada instância do servidor contra rajadas;
 * o limite definitivo por IP/período fica no banco (função cast_vote).
 */
const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now = Date.now(),
): RateLimitResult {
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (now - hits[0]!)) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function __resetRateLimit() {
  buckets.clear();
}
