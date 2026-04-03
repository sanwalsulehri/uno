import type { NextApiRequest, NextApiResponse } from "next";
import { gameSnapshot, getRoom } from "@/lib/roomStore";

/** GET game state for polling (named `state` to avoid clashing with `pages/game` in tooling). */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const roomId = String(req.query.roomId || "");
  const playerId = typeof req.query.playerId === "string" ? req.query.playerId : "";

  const room = getRoom(roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  if (!playerId) {
    return res.status(400).json({ error: "Missing playerId" });
  }

  const inRoom = room.players.some((p) => p.id === playerId);
  if (!inRoom) {
    return res.status(403).json({ error: "Not in this room" });
  }

  return res.status(200).json(gameSnapshot(room, playerId));
}
