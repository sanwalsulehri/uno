import { NextResponse } from "next/server";
import { getRoom, startGame } from "@/lib/roomStore";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ roomId: string }> };

export async function POST(req: Request, context: Ctx) {
  const { roomId } = await context.params;
  const body = await req.json().catch(() => ({}));
  const playerId = typeof body?.playerId === "string" ? body.playerId : "";

  const room = getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (!playerId || !room.players.some((p) => p.id === playerId)) {
    return NextResponse.json({ error: "Invalid player" }, { status: 403 });
  }

  const result = startGame(roomId, playerId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
