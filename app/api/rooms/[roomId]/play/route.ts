import { NextResponse } from "next/server";
import { playCard } from "@/lib/roomStore";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ roomId: string }> };

export async function POST(req: Request, context: Ctx) {
  const { roomId } = await context.params;
  const body = await req.json().catch(() => ({}));
  const playerId = typeof body?.playerId === "string" ? body.playerId : "";
  const color = typeof body?.color === "string" ? body.color : "";
  const number = body?.number;
  const chosenColor = typeof body?.chosenColor === "string" ? body.chosenColor : undefined;

  const result = playCard(roomId, playerId, color, number, chosenColor);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
