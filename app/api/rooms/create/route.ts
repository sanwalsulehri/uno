import { NextResponse } from "next/server";
import { createRoom } from "@/lib/roomStore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = typeof body?.nickname === "string" ? body.nickname : "";
  const { room, playerId } = createRoom(nickname);

  return NextResponse.json({
    roomId: room.id,
    playerId,
    player: { id: playerId, name: room.players[0]!.name },
  });
}
