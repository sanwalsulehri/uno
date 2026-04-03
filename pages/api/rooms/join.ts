import type { NextApiRequest, NextApiResponse } from "next";
import { joinRoom } from "@/lib/roomStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const roomId = typeof req.body?.roomId === "string" ? req.body.roomId : "";
  const nickname = typeof req.body?.nickname === "string" ? req.body.nickname : "";

  const result = joinRoom(roomId, nickname);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const p = result.room.players.find((x) => x.id === result.playerId)!;
  return res.status(200).json({
    roomId: result.room.id,
    playerId: result.playerId,
    player: { id: p.id, name: p.name },
  });
}
