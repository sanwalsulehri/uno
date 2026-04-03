/**
 * Fixed width + height (5:7 card ratio) so faces never collapse to 0×0
 * when parents use flex / only absolute children inside backs.
 */
export const TABLE_CARD_CLASS =
  "block w-[6.875rem] h-[9.625rem] shrink-0 sm:w-[7.375rem] sm:h-[10.325rem] md:w-[7.875rem] md:h-[11.025rem]";

/** Fan: minimal overlap so faces don’t sit on top of each other (~12–14% of width). */
export const HAND_OVERLAP_L =
  "-ml-[1rem] first:ml-0 sm:-ml-[1.1rem] md:-ml-[1.2rem]";

/** Vertical stack for left/right opponents — show more of each card. */
export const OPPONENT_STACK_OVERLAP =
  "-mt-[4.5rem] first:mt-0 sm:-mt-[4.85rem] md:-mt-[5.15rem]";
