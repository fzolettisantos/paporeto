import { HomePage } from "@/components/HomePage";

/** Os números são revalidados a cada 15 s; o navegador atualiza em seguida pela API. */
export const revalidate = 15;

export default function Page() {
  return <HomePage initialTab="falou-merda" />;
}
