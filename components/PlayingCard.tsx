import type { Card as CardType, CardColor } from "@/lib/types";
import { HAND_CARD_CLASS, HAND_CARD_CLASS_SM, TABLE_CARD_CLASS } from "@/lib/cardLayout";

export { TABLE_CARD_CLASS } from "@/lib/cardLayout";
export { HAND_OVERLAP_L } from "@/lib/cardLayout";

/** Flat face fills — no gradients */
const faceSolid: Record<CardColor, string> = {
  red: "bg-[#E23D4B]",
  blue: "bg-[#2E5BBA]",
  green: "bg-[#0F9D7A]",
  yellow: "bg-[#F0C808]",
};

const wildFace = "bg-[#1A1A1A]";
const wild4Face = "bg-[#0D0D0D]";

const stripeWild = ["#E23D4B", "#F0C808", "#0F9D7A", "#2E5BBA"] as const;

function isWild(card: CardType): boolean {
  return card.color === "black" && (card.number === 11 || card.number === 12);
}

function isDraw2(card: CardType): boolean {
  return card.number === 10;
}

function isSkip(card: CardType): boolean {
  return card.number === 13;
}

function isReverse(card: CardType): boolean {
  return card.number === 14;
}

function pipClass(card: CardType): string {
  if (isWild(card)) return "text-white";
  if (card.color === "yellow") return "text-[#0B0F14]";
  return "text-white";
}

function centerInk(card: CardType): string {
  if (card.color === "yellow" && !isWild(card)) return "text-[#0B0F14]";
  return "text-[#0B0F14]";
}

export function cardDisplayLabel(card: CardType): string {
  if (card.number === 10) return "+2";
  if (card.number === 11) return "★";
  if (card.number === 12) return "+4";
  if (card.number === 13) return "⊘";
  if (card.number === 14) return "⇄";
  return String(card.number);
}

export type CardVariant = "table" | "tiny" | "hand" | "handSm";

type Props = {
  card: CardType;
  variant?: CardVariant;
  className?: string;
  activeColor?: CardColor;
};

const cornerTl: Record<CardVariant, string> = {
  table: "left-2 top-2 text-sm sm:text-base md:text-lg font-black tracking-tight",
  tiny: "left-1 top-1 text-[10px] font-black",
  hand: "left-1.5 top-1.5 text-xs sm:text-sm md:text-base font-black tracking-tight",
  handSm: "left-1 top-1 text-[10px] sm:text-xs md:text-sm font-black tracking-tight",
};

const cornerBr: Record<CardVariant, string> = {
  table: "right-2 bottom-2 text-sm sm:text-base md:text-lg font-black tracking-tight",
  tiny: "right-1 bottom-1 text-[10px] font-black",
  hand: "right-1.5 bottom-1.5 text-xs sm:text-sm md:text-base font-black tracking-tight",
  handSm: "right-1 bottom-1 text-[10px] sm:text-xs md:text-sm font-black tracking-tight",
};

const centerSize: Record<CardVariant, string> = {
  table: "text-3xl sm:text-4xl md:text-[2.75rem] font-black tracking-tight font-display",
  tiny: "text-lg font-display",
  hand: "text-2xl sm:text-3xl md:text-4xl font-black tracking-tight font-display",
  handSm: "text-xl sm:text-2xl md:text-3xl font-black tracking-tight font-display",
};

const centerSizeSpecial: Record<CardVariant, string> = {
  table: "text-base sm:text-lg md:text-xl font-bold leading-tight tracking-wide font-display",
  tiny: "text-lg font-black font-display",
  hand: "text-sm sm:text-base md:text-lg font-bold leading-tight tracking-wide font-display",
  handSm: "text-xs sm:text-sm md:text-base font-bold leading-tight tracking-wide font-display",
};

const shell: Record<CardVariant, string> = {
  table: TABLE_CARD_CLASS,
  tiny: "w-10 h-14",
  hand: HAND_CARD_CLASS,
  handSm: HAND_CARD_CLASS_SM,
};

/** Center badge: white field, hard black border */
const centerBadge =
  "flex items-center justify-center border-[3px] border-[#0B0F14] bg-[#FFFDF8] rounded-md";

export function PlayingCard({ card, variant = "table", className = "", activeColor }: Props) {
  const label = cardDisplayLabel(card);
  const wild = isWild(card);
  const wild4 = card.color === "black" && card.number === 12;
  const draw2 = isDraw2(card);
  const skip = isSkip(card);
  const reverse = isReverse(card);
  const showChosen = Boolean(wild && activeColor);

  const face =
    showChosen && activeColor
      ? faceSolid[activeColor]
      : wild
        ? wild4
          ? wild4Face
          : wildFace
        : faceSolid[card.color as CardColor];

  const corner = showChosen && activeColor === "yellow" ? "text-[#0B0F14]" : pipClass(card);

  const chosenFrame =
    showChosen && activeColor
      ? "outline outline-[3px] outline-[#0B0F14] outline-offset-[3px]"
      : "";

  return (
    <div
      className={`
        relative isolate block select-none overflow-hidden rounded-md
        border-[3px] border-[#0B0F14] bg-[#0B0F14]
        ${shell[variant]}
        ${chosenFrame}
        ${className}
      `}
    >
      <div className={`pointer-events-none absolute inset-[3px] rounded-sm ${face}`} aria-hidden />

      {wild && !wild4 && !showChosen ? (
        <div
          className="pointer-events-none absolute bottom-[18%] left-1/2 z-[1] flex h-2.5 w-[62%] -translate-x-1/2 overflow-hidden border-y border-[#0B0F14]"
          aria-hidden
        >
          {stripeWild.map((c, i) => (
            <span key={i} className="h-full w-1/4" style={{ backgroundColor: c }} />
          ))}
        </div>
      ) : null}

      <span className={`absolute z-[2] leading-none ${corner} ${cornerTl[variant]}`}>{label}</span>
      <span className={`absolute z-[2] leading-none rotate-180 ${corner} ${cornerBr[variant]}`}>
        {label}
      </span>

      <div className="absolute inset-0 z-[2] flex items-center justify-center px-1">
        {wild4 ? (
          <div
            className={`${centerBadge} h-[56%] w-[62%] flex-col gap-0.5 px-1 py-2 sm:py-3`}
          >
            <span className={`${centerInk(card)} ${centerSizeSpecial[variant]}`}>WILD</span>
            <span className={`${centerInk(card)} ${centerSize[variant]}`}>+4</span>
          </div>
        ) : wild ? (
          <div className={`${centerBadge} h-[56%] w-[62%] px-2`}>
            <span className={`uppercase tracking-[0.15em] ${centerInk(card)} ${centerSizeSpecial[variant]}`}>
              Wild
            </span>
          </div>
        ) : draw2 ? (
          <div className={`${centerBadge} h-[56%] w-[62%]`}>
            <span className={`leading-none ${centerInk(card)} ${centerSize[variant]}`}>+2</span>
          </div>
        ) : skip ? (
          <div className={`${centerBadge} h-[56%] w-[62%] flex-col gap-0.5 px-1`}>
            <span
              className={`text-center font-black uppercase leading-tight ${centerInk(card)} ${centerSizeSpecial[variant]}`}
            >
              Skip
            </span>
          </div>
        ) : reverse ? (
          <div className={`${centerBadge} h-[56%] w-[62%] flex-col gap-0.5 px-1`}>
            <span className={`font-black ${centerInk(card)} ${centerSize[variant]}`}>⇄</span>
            <span
              className={`text-center font-black uppercase leading-none ${centerInk(card)} ${centerSizeSpecial[variant]}`}
            >
              Rev
            </span>
          </div>
        ) : (
          <div className={`${centerBadge} h-[56%] w-[62%]`}>
            <span className={`leading-none font-black ${centerInk(card)} ${centerSize[variant]}`}>
              {card.number}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
