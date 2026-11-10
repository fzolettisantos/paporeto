import { PapoLoader } from "@/components/PapoLoader";

/** Tela de carregamento entre páginas (rankings, bancada, charges, painel…). */
export default function Loading() {
  return (
    <main className="flex min-h-[80dvh] items-center justify-center px-4">
      <PapoLoader />
    </main>
  );
}
