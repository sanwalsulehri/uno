import type { NextApiRequest, NextApiResponse } from "next";
import { drawCard } from "@/lib/roomStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const roomId = String(req.query.roomId || "");
  const playerId = typeof req.body?.playerId === "string" ? req.body.playerId : "";

  const result = drawCard(roomId, playerId);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({ ok: true });
}
