import type { Card as CardType, CardColor } from "@/lib/types";
import { TABLE_CARD_CLASS } from "@/lib/cardLayout";

export { TABLE_CARD_CLASS } from "@/lib/cardLayout";
export { HAND_OVERLAP_L } from "@/lib/cardLayout";

const faceSolid: Record<CardColor, string> = {
  red: "bg-[#e53935]",
  blue: "bg-[#1e88e5]",
  green: "bg-[#43a047]",
  yellow: "bg-[#fdd835]",
};

const wildActiveGlow: Record<CardColor, string> = {
  red: "shadow-[0_0_0_3px_rgb(229,57,53),0_10px_28px_rgba(229,57,53,0.45)]",
  blue: "shadow-[0_0_0_3px_rgb(30,136,229),0_10px_28px_rgba(30,136,229,0.45)]",
  green: "shadow-[0_0_0_3px_rgb(67,160,71),0_10px_28px_rgba(67,160,71,0.45)]",
  yellow: "shadow-[0_0_0_3px_rgb(253,216,53),0_10px_28px_rgba(253,216,53,0.5)]",
};

function isWild(card: CardType): boolean {
  return card.color === "black" && (card.number === 11 || card.number === 12);
}

function isDraw2(card: CardType): boolean {
  return card.number === 10;
}

function pipClassForCard(card: CardType): string {
  if (isWild(card)) return "text-white";
  if (card.color === "yellow") return "text-slate-900";
  return "text-white";
}

function centerTextClass(card: CardType): string {
  if (card.color === "yellow" && !isWild(card)) return "text-slate-900";
  return "text-slate-900";
}

export function cardDisplayLabel(card: CardType): string {
  if (card.number === 10) return "+2";
  if (card.number === 11) return "WILD";
  if (card.number === 12) return "+4";
  return String(card.number);
}

export type CardVariant = "table" | "tiny";

type Props = {
  card: CardType;
  variant?: CardVariant;
  className?: string;
  /** For wild / wild +4 on the discard pile: color the card with the active (chosen) color. */
  activeColor?: CardColor;
};

const cornerTl: Record<CardVariant, string> = {
  table: "left-1.5 top-1.5 text-sm sm:text-base md:text-lg font-black",
  tiny: "left-1 top-1 text-[10px] font-black",
};

const cornerBr: Record<CardVariant, string> = {
  table: "right-1.5 bottom-1.5 text-sm sm:text-base md:text-lg font-black",
  tiny: "right-1 bottom-1 text-[10px] font-black",
};

const centerSize: Record<CardVariant, string> = {
  table: "text-3xl sm:text-4xl md:text-[2.75rem] font-black",
  tiny: "text-lg",
};

const centerSizeSpecial: Record<CardVariant, string> = {
  table: "text-lg sm:text-xl md:text-2xl font-black leading-tight",
  tiny: "text-lg font-black",
};

const shell: Record<CardVariant, string> = {
  table: TABLE_CARD_CLASS,
  tiny: "w-10 h-14",
};

export function PlayingCard({ card, variant = "table", className = "", activeColor }: Props) {
  const label = cardDisplayLabel(card);
  const wild = isWild(card);
  const wild4 = card.color === "black" && card.number === 12;
  const draw2 = isDraw2(card);
  const showChosen = Boolean(wild && activeColor);

  const faceBg = wild
    ? showChosen && activeColor
      ? faceSolid[activeColor]
      : wild4
        ? "bg-[#1a1a1a]"
        : "bg-[#252525]"
    : faceSolid[card.color as CardColor];

  const cornerPip =
    showChosen && activeColor === "yellow" ? "text-slate-900" : pipClassForCard(card);

  return (
    <div
      className={`
        relative isolate block select-none rounded-[9px] border-2 border-white
        ${faceBg}
        ${showChosen && activeColor ? wildActiveGlow[activeColor] : "shadow-none"}
        ${shell[variant]}
        ${className}
      `}
    >
      {wild && !wild4 && !showChosen ? (
        <div
          className="pointer-events-none absolute bottom-[22%] left-1/2 h-1.5 w-[58%] -translate-x-1/2 rounded-sm overflow-hidden flex"
          aria-hidden
        >
          <span className="h-full w-1/4 bg-red-500" />
          <span className="h-full w-1/4 bg-yellow-400" />
          <span className="h-full w-1/4 bg-green-500" />
          <span className="h-full w-1/4 bg-blue-500" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-[4px] rounded-[6px] border border-white/30" />

      <span className={`absolute leading-none ${cornerPip} ${cornerTl[variant]}`}>{label}</span>
      <span className={`absolute leading-none rotate-180 ${cornerPip} ${cornerBr[variant]}`}>
        {label}
      </span>

      <div className="absolute inset-0 flex items-center justify-center px-1">
        {wild4 ? (
          <div
            className="
              flex h-[56%] w-[62%] flex-col items-center justify-center gap-0.5 rounded-[50%]
              bg-white border border-slate-200/80
            "
          >
            <span className={`text-slate-900 ${centerSizeSpecial[variant]}`}>WILD</span>
            <span className={`text-slate-900 ${centerSize[variant]}`}>+4</span>
          </div>
        ) : wild ? (
          <div
            className="
              flex h-[56%] w-[62%] items-center justify-center rounded-[50%]
              bg-white border border-slate-200/80
            "
          >
            <span className={`uppercase tracking-tight text-slate-900 ${centerSizeSpecial[variant]}`}>
              Wild
            </span>
          </div>
        ) : draw2 ? (
          <div
            className="
              flex h-[56%] w-[62%] flex-col items-center justify-center rounded-[50%]
              bg-white border border-slate-200/80
            "
          >
            <span className={`leading-none ${centerTextClass(card)} ${centerSize[variant]}`}>+2</span>
          </div>
        ) : (
          <div
            className="
              flex h-[56%] w-[62%] items-center justify-center rounded-[50%]
              bg-white border border-slate-200/80
            "
          >
            <span className={`leading-none font-black ${centerTextClass(card)} ${centerSize[variant]}`}>
              {card.number}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
