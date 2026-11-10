import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { withBase } from "@/config/site";
import { rateLimit } from "@/lib/rate-limit";
import { ADMIN_COOKIE, checkPassword, createSessionValue, isAdminConfigured, sessionCookieOptions } from "@/lib/server/admin-auth";
import { clientIp } from "@/lib/server/request";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const ip = clientIp(await headers());
  if (!rateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 15 * 60_000 }).allowed) redirect(withBase("/admin/login?erro=limite"));
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) redirect(withBase("/admin/login?erro=senha"));
  (await cookies()).set(ADMIN_COOKIE, createSessionValue(), sessionCookieOptions);
  redirect(withBase("/admin"));
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="mx-auto max-w-sm">
      <h1 className="font-display text-3xl uppercase">Painel do Papo Reto Ranking</h1>
      {!isAdminConfigured() ? (
        <p className="mt-4 rounded-xl border border-line bg-surface p-4 text-sm">
          Painel desativado. Defina <code>ADMIN_PASSWORD</code> e <code>ADMIN_SESSION_SECRET</code> (32+ caracteres) nas
          variáveis de ambiente.
        </p>
      ) : (
        <form action={login} className="mt-6 space-y-3">
          <label className="block text-sm font-semibold" htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" required autoComplete="current-password"
            className="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-white" />
          {erro ? (
            <p role="alert" className="text-sm font-semibold text-red">
              {erro === "limite" ? "Muitas tentativas. Aguarde 15 minutos." : "Senha incorreta."}
            </p>
          ) : null}
          <button className="min-h-12 w-full rounded-xl bg-yellow font-extrabold uppercase text-ink">Entrar</button>
        </form>
      )}
    </main>
  );
}
