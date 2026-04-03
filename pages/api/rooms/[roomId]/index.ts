import type { NextApiRequest, NextApiResponse } from "next";
import { getRoom, lobbySnapshot } from "@/lib/roomStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const roomId = String(req.query.roomId || "");
  const room = getRoom(roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  return res.status(200).json(lobbySnapshot(room));
}
