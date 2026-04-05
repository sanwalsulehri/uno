import type { RoomPlayer } from "@/lib/types";

type Props = {
  players: RoomPlayer[];
  highlightId?: string | null;
  ownerId?: string | null;
};

export function PlayerList({ players, highlightId, ownerId }: Props) {
  return (
    <ul className="space-y-2">
      {players.map((p) => {
        const active = highlightId && p.id === highlightId;
        const host = ownerId && p.id === ownerId;
        return (
          <li
            key={p.id}
            className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm transition-colors ${
              active
                ? "border-[#0B0F14] bg-[#b8e0d2]"
                : "border-[#0B0F14]/25 bg-white hover:border-[#0B0F14]/50"
            }`}
          >
            <span className="font-medium text-[#0B0F14]">
              {host ? (
                <span className="mr-1" title="Room owner" aria-hidden>
                  👑
                </span>
              ) : null}
              {p.name}
            </span>
            <span className="text-xs tabular-nums text-[#0B0F14]/55">{p.cardCount} cards</span>
          </li>
        );
      })}
    </ul>
  );
}
