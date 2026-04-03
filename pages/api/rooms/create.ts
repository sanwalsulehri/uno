import type { NextApiRequest, NextApiResponse } from "next";
import { createRoom } from "@/lib/roomStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const nickname = typeof req.body?.nickname === "string" ? req.body.nickname : "";
  const { room, playerId } = createRoom(nickname);

  return res.status(200).json({
    roomId: room.id,
    playerId,
    player: { id: playerId, name: room.players[0]!.name },
  });
}
