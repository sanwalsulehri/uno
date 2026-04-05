import { NextResponse } from "next/server";
import { gameSnapshot, getRoom } from "@/lib/roomStore";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ roomId: string }> };

export async function GET(req: Request, context: Ctx) {
  const { roomId } = await context.params;
  const { searchParams } = new URL(req.url);
  const playerId = searchParams.get("playerId") ?? "";

  const room = getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (!playerId) {
    return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
  }

  const inRoom = room.players.some((p) => p.id === playerId);
  if (!inRoom) {
    return NextResponse.json({ error: "Not in this room" }, { status: 403 });
  }

  return NextResponse.json(gameSnapshot(room, playerId));
}
