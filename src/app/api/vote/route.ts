import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { parseVoteRequest } from "@/lib/validation";
import { getRankingResults } from "@/lib/server/data";
import { isRankingView } from "@/lib/period";
import { ConfigError, isSupabaseConfigured } from "@/lib/server/env";
import { clientIp, isSameOrigin } from "@/lib/server/request";
import { castVote } from "@/lib/server/vote";
import { getOrCreateVoter, hashIp, VOTER_COOKIE } from "@/lib/server/voter";
import type { VoteStatus } from "@/types";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MESSAGES: Record<VoteStatus, string> = {
  ok: "Voto registrado!",
  duplicate: "Você já votou neste ranking neste período.",
  ip_limit: "Muitos votos saindo da sua rede neste período. Tente mais tarde.",
  rate_limited: "Calma, craque! Muitos votos em pouco tempo. Tente de novo em instantes.",
  invalid: "Voto inválido.",
  closed: "A votação deste ranking está pausada.",
  not_votable: "Esse ranking não tem votação: quem decide é o programa.",
  error: "Não foi possível registrar o voto agora. Tente novamente.",
};
const HTTP: Record<VoteStatus, number> = {
  ok: 200,
  duplicate: 409,
  ip_limit: 429,
  rate_limited: 429,
  invalid: 400,
  closed: 403,
  not_votable: 403,
  error: 500,
};

function reply(status: VoteStatus, extra: Record<string, unknown> = {}, headers?: HeadersInit) {
  return NextResponse.json(
    { status, message: MESSAGES[status], ...extra },
    { status: HTTP[status], headers: { "Cache-Control": "no-store", ...headers } },
  );
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request.headers)) return reply("invalid");

  const ip = clientIp(request.headers);
  const limited = rateLimit(`vote:${ip}`, { limit: 12, windowMs: 60_000 });
  if (!limited.allowed) return reply("rate_limited", {}, { "Retry-After": String(limited.retryAfterSeconds) });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply("invalid");
  }
  const vote = parseVoteRequest(body);
  if (!vote || (isSupabaseConfigured() && !UUID.test(vote.participantId))) return reply("invalid");

  try {
    const voter = getOrCreateVoter(request.cookies.get(VOTER_COOKIE)?.value);
    const status = await castVote({ ...vote, voterKey: voter.voterKey, ipHash: hashIp(ip) });
    // Devolve o placar no recorte que a pessoa está vendo (semana, mês ou temporada).
    const requested = (body as { view?: unknown }).view;
    const view = isRankingView(requested) ? requested : "week";
    const [results] = await getRankingResults([vote.ranking], { voterKey: voter.voterKey, view }).catch(() => [null]);
    const response = reply(status, { results });
    if (voter.newCookie) response.cookies.set(voter.newCookie.name, voter.newCookie.value, voter.newCookie.options);
    return response;
  } catch (error) {
    console.error("[vote]", error instanceof ConfigError ? error.message : error);
    return reply("error");
  }
}
