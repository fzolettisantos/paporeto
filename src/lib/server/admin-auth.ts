import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { withBase } from "@/config/site";
import { hmac, safeEqual } from "./crypto";

export const ADMIN_COOKIE = "prr_admin";
const SESSION_HOURS = 12;

/** Senha cadastrada, sem espaços/quebras de linha nas pontas (comuns ao copiar e colar na Vercel). */
const adminPassword = () => (process.env.ADMIN_PASSWORD ?? "").trim();

/** DIAGNÓSTICO TEMPORÁRIO: tamanho da senha cadastrada (não revela a senha). */
export function adminPasswordLength() {
  return adminPassword().length;
}

export function isAdminConfigured() {
  return Boolean(adminPassword() && (process.env.ADMIN_SESSION_SECRET?.trim().length ?? 0) >= 32);
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET!;
}

export function checkPassword(candidate: string) {
  if (!isAdminConfigured()) return false;
  // Compara HMACs (mesmo tamanho) para não vazar o tamanho da senha pelo tempo de resposta.
  return safeEqual(hmac(secret(), candidate.trim()), hmac(secret(), adminPassword()));
}

export function createSessionValue(now = Date.now()) {
  const expires = String(now + SESSION_HOURS * 3600_000);
  return `${expires}.${hmac(secret(), `admin:${expires}`)}`;
}

export function verifySessionValue(value: string | undefined, now = Date.now()) {
  if (!value || !isAdminConfigured()) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < now) return false;
  return safeEqual(signature, hmac(secret(), `admin:${expires}`));
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: withBase("/admin"),
  maxAge: SESSION_HOURS * 3600,
};

/** Use no início de toda página e server action do painel. */
export async function requireAdmin() {
  const store = await cookies();
  if (!verifySessionValue(store.get(ADMIN_COOKIE)?.value)) redirect(withBase("/admin/login"));
}
