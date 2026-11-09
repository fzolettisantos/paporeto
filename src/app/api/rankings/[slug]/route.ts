import { NextResponse, type NextRequest } from "next/server";
import { parseViewParam } from "@/lib/period";
import { isRankingSlug } from "@/lib/validation";
import { getRankingResults } from "@/lib/server/data";
import { readVoterKey, VOTER_COOKIE } from "@/lib/server/voter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isRankingSlug(slug)) return NextResponse.json({ error: "Ranking não encontrado." }, { status: 404 });
  try {
    let voterKey: string | null = null;
    try {
      voterKey = readVoterKey(request.cookies.get(VOTER_COOKIE)?.value);
    } catch {
      voterKey = null;
    }
    const view = parseViewParam(request.nextUrl.searchParams.get("periodo"));
    const [results] = await getRankingResults([slug], { voterKey, view });
    // Resposta personalizada (myVote): nada de cache compartilhado.
    return NextResponse.json(results, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[rankings]", error);
    return NextResponse.json({ error: "Não foi possível carregar o ranking." }, { status: 500 });
  }
}
