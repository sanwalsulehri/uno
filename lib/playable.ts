import type { Card, CardColor } from "@/lib/types";

function isWild(card: Card): boolean {
  return card.color === "black" && (card.number === 11 || card.number === 12);
}

export function isCardPlayable(card: Card, top: Card | null, activeColor: CardColor): boolean {
  if (!top) return true;
  if (isWild(card)) return true;
  if (isWild(top)) {
    return card.color === activeColor || isWild(card);
  }
  if (card.number === 10 && top.number === 10) return true;
  if (card.color === top.color) return true;
  if (card.number === top.number) return true;
  return false;
}
