import { TABLE_CARD_CLASS } from "@/lib/cardLayout";

type Props = {
  className?: string;
};

/** Face-down deck — same outer size as `PlayingCard` when using default sizing. */
export function CardBack({ className = "" }: Props) {
  return (
    <div
      className={`relative isolate rounded-[9px] border-2 border-white shadow-none overflow-hidden ${TABLE_CARD_CLASS} ${className}`}
    >
      <div className="absolute inset-0 bg-[#c62828]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.88)_26%,transparent_27%)] bg-[length:6px_6px] opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-[#f9c22f] px-2 py-0.5 text-[10px] font-black tracking-wide text-[#3d2810] sm:text-[11px] sm:px-2.5 sm:py-1">
          PIZZUNO
        </div>
      </div>
    </div>
  );
}
