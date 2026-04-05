import { NextResponse } from "next/server";
import { getRoom, lobbySnapshot } from "@/lib/roomStore";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ roomId: string }> };

export async function GET(_req: Request, context: Ctx) {
  const { roomId } = await context.params;
  const room = getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json(lobbySnapshot(room));
}
