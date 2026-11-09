import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export function hmac(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** `valor.assinatura` */
export function sign(secret: string, value: string) {
  return `${value}.${hmac(secret, value)}`;
}

export function unsign(secret: string, signed: string | undefined | null): string | null {
  if (!signed) return null;
  const index = signed.lastIndexOf(".");
  if (index <= 0) return null;
  const value = signed.slice(0, index);
  return safeEqual(signed.slice(index + 1), hmac(secret, value)) ? value : null;
}

export { randomUUID };
