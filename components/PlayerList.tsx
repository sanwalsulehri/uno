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
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm shadow-sm transition-colors ${
              active
                ? "border-slate-900 bg-slate-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="font-medium text-slate-800">
              {host ? (
                <span className="mr-1" title="Room owner" aria-hidden>
                  👑
                </span>
              ) : null}
              {p.name}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">{p.cardCount} cards</span>
          </li>
        );
      })}
    </ul>
  );
}
