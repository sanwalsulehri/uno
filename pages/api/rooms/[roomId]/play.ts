import type { NextApiRequest, NextApiResponse } from "next";
import { playCard } from "@/lib/roomStore";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const roomId = String(req.query.roomId || "");
  const playerId = typeof req.body?.playerId === "string" ? req.body.playerId : "";
  const color = typeof req.body?.color === "string" ? req.body.color : "";
  const number = req.body?.number;
  const chosenColor =
    typeof req.body?.chosenColor === "string" ? req.body.chosenColor : undefined;

  const result = playCard(roomId, playerId, color, number, chosenColor);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({ ok: true });
}
