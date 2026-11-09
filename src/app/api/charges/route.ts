import { NextResponse } from "next/server";
import { getPublishedCharges } from "@/lib/server/data";

export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json(await getPublishedCharges());
  } catch (error) {
    console.error("[charges]", error);
    return NextResponse.json({ error: "Não foi possível carregar as charges." }, { status: 500 });
  }
}
