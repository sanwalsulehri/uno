import { NextResponse } from "next/server";
import { joinRoom } from "@/lib/roomStore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  const nickname = typeof body?.nickname === "string" ? body.nickname : "";

  const result = joinRoom(roomId, nickname);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const p = result.room.players.find((x) => x.id === result.playerId)!;
  return NextResponse.json({
    roomId: result.room.id,
    playerId: result.playerId,
    player: { id: p.id, name: p.name },
  });
}
