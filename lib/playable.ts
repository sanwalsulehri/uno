import type { Card, CardColor } from "@/lib/types";

function isWild(card: Card): boolean {
  return card.color === "black" && (card.number === 11 || card.number === 12);
}

/** Client-side mirror of `roomStore.canPlay` (optional `hand` for Wild +4 legality). */
export function isCardPlayable(
  card: Card,
  top: Card | null,
  activeColor: CardColor,
  hand?: Card[],
  pendingDraw = 0
): boolean {
  if (pendingDraw > 0) {
    if (!top) return false;
    if (top.number === 10) return card.number === 10;
    if (top.number === 12) return card.number === 12;
    return false;
  }
  if (!top) return true;
  if (card.number === 12 && hand) {
    if (hand.some((c) => c.color !== "black" && c.color === activeColor)) return false;
  }
  if (isWild(card)) return true;
  if (isWild(top)) {
    return card.color === activeColor || isWild(card);
  }
  if (card.number === 10 && top.number === 10) return true;
  if (card.number === 13 && top.number === 13) return true;
  if (card.number === 14 && top.number === 14) return true;
  if (card.color === top.color) return true;
  if (card.number === top.number) return true;
  return false;
}
