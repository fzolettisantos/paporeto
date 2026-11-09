import "server-only";
import { getVoteSecret } from "./env";
import { hmac, randomUUID, sign, unsign } from "./crypto";

export const VOTER_COOKIE = "prr_vid";
const MAX_AGE = 60 * 60 * 24 * 400;

export interface Voter {
  /** Chave anônima do votante (HMAC do id do cookie) — o id cru nunca vai ao banco. */
  voterKey: string;
  /** Cookie a gravar quando o visitante ainda não tinha um id válido. */
  newCookie: { name: string; value: string; options: Record<string, unknown> } | null;
}

export function readVoterKey(cookieValue: string | undefined): string | null {
  const secret = getVoteSecret();
  const id = unsign(secret, cookieValue);
  return id ? hmac(secret, `voter:${id}`) : null;
}

export function getOrCreateVoter(cookieValue: string | undefined): Voter {
  const existing = readVoterKey(cookieValue);
  if (existing) return { voterKey: existing, newCookie: null };
  const secret = getVoteSecret();
  const id = randomUUID();
  return {
    voterKey: hmac(secret, `voter:${id}`),
    newCookie: {
      name: VOTER_COOKIE,
      value: sign(secret, id),
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: MAX_AGE,
      },
    },
  };
}

export function hashIp(ip: string) {
  return hmac(getVoteSecret(), `ip:${ip}`);
}
