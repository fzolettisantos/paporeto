import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./env";

let client: SupabaseClient | null = null;

/**
 * Cliente com a service role — SOMENTE no servidor. Ignora RLS; nunca o exponha ao navegador.
 */
export function getServiceClient(): SupabaseClient {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado.");
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return client;
}
