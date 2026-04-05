import { TABLE_CARD_CLASS } from "@/lib/cardLayout";

type Props = {
  className?: string;
};

/** Flat deck back — geometric frame + vertical rules (solid divs, no gradients). */
export function CardBack({ className = "" }: Props) {
  return (
    <div
      className={`
        relative isolate overflow-hidden rounded-md border-[3px] border-[#0B0F14]
        bg-[#1A535C]
        ${TABLE_CARD_CLASS}
        ${className}
      `}
    >
      <div
        className="pointer-events-none absolute inset-[10px] rounded-sm border-2 border-[#F4F1DE]"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 flex justify-evenly" aria-hidden>
        <span className="h-full w-px bg-[#F4F1DE]" />
        <span className="h-full w-px bg-[#F4F1DE]" />
        <span className="h-full w-px bg-[#F4F1DE]" />
        <span className="h-full w-px bg-[#F4F1DE]" />
        <span className="h-full w-px bg-[#F4F1DE]" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-3">
        <div className="border-2 border-[#0B0F14] bg-[#FF5C5C] px-4 py-2 sm:px-5 sm:py-2.5">
          <p className="font-display text-center text-lg font-bold uppercase leading-none tracking-[0.2em] text-[#0B0F14] sm:text-xl">
            UNO
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute left-2 top-2 h-2 w-2 border-2 border-[#F4F1DE] bg-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border-2 border-[#F4F1DE] bg-transparent"
        aria-hidden
      />
    </div>
  );
}
