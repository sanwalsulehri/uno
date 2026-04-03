import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { CardBack } from "@/components/CardBack";
import { PlayingCard } from "@/components/PlayingCard";
import type { Card, CardColor, GameState } from "@/lib/types";
import { HAND_OVERLAP_L, OPPONENT_STACK_OVERLAP, TABLE_CARD_CLASS } from "@/lib/cardLayout";
import { getPlayerId, STORAGE_NICKNAME } from "@/lib/session";

const POLL_MS = 1000;

const COLOR_PICK: { id: CardColor; label: string; className: string }[] = [
  { id: "red", label: "Red", className: "bg-gradient-to-br from-[#ff3b5c] to-[#c2184a]" },
  { id: "blue", label: "Blue", className: "bg-gradient-to-br from-[#00b4ff] to-[#006dbf]" },
  { id: "green", label: "Green", className: "bg-gradient-to-br from-[#00d97e] to-[#009624]" },
  { id: "yellow", label: "Yellow", className: "bg-gradient-to-br from-[#ffe566] to-[#ffb300]" },
];

function isWildCard(card: Card): boolean {
  return card.color === "black" && (card.number === 11 || card.number === 12);
}

/** ▲ points up (toward top seat). */
function turnArrowRotateDeg(
  turnId: string | null | undefined,
  myId: string | null,
  top: { id: string } | null,
  right: { id: string } | null,
  left: { id: string } | null
): number {
  if (!turnId || !myId) return 0;
  if (turnId === myId) return 180;
  if (top?.id === turnId) return 0;
  if (right?.id === turnId) return 90;
  if (left?.id === turnId) return 270;
  return 0;
}

export default function GamePage() {
  const router = useRouter();
  const { roomId: rawId } = router.query;
  const roomId = typeof rawId === "string" ? rawId.toUpperCase() : "";

  const [game, setGame] = useState<GameState | null>(null);
  const [err, setErr] = useState("");
  const [nickname, setNickname] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [pending, setPending] = useState<"play" | "draw" | null>(null);
  const [wildPending, setWildPending] = useState<Card | null>(null);

  useEffect(() => {
    setNickname(sessionStorage.getItem(STORAGE_NICKNAME) || "");
    setPlayerId(getPlayerId());
  }, []);

  const fetchGame = useCallback(async () => {
    const pid = getPlayerId();
    if (!roomId || !pid) return;
    const res = await fetch(
      `/api/rooms/${encodeURIComponent(roomId)}/state?playerId=${encodeURIComponent(pid)}`
    );
    if (res.status === 404 || res.status === 403) {
      setErr(res.status === 403 ? "Not in this room." : "Room not found.");
      setGame(null);
      return;
    }
    const data = (await res.json()) as GameState;
    setGame(data);
    setErr("");
    if (!data.gameStarted && !data.gameOver) {
      await router.replace(`/lobby/${roomId}`);
    }
  }, [roomId, router]);

  useEffect(() => {
    if (!router.isReady || !roomId) return;
    void fetchGame();
    const id = setInterval(() => void fetchGame(), POLL_MS);
    return () => clearInterval(id);
  }, [router.isReady, roomId, fetchGame]);

  const isMyTurn = Boolean(
    game && playerId && game.currentTurnPlayerId === playerId && game.gameStarted
  );

  async function playCard(card: Card, chosenColor?: CardColor) {
    const pid = getPlayerId();
    if (!roomId || !pid) return;
    if (isWildCard(card) && !chosenColor) {
      setWildPending(card);
      return;
    }
    setPending("play");
    setErr("");
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: pid,
          color: card.color,
          number: card.number,
          ...(chosenColor ? { chosenColor } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Cannot play that card.");
        return;
      }
      await fetchGame();
    } finally {
      setPending(null);
    }
  }

  async function draw() {
    const pid = getPlayerId();
    if (!roomId || !pid) return;
    setPending("draw");
    setErr("");
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: pid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Cannot draw.");
        return;
      }
      await fetchGame();
    } finally {
      setPending(null);
    }
  }

  const myCards = game?.myCards ?? [];
  const opponents = (game?.players ?? []).filter((p) => p.id !== playerId);
  const topOpponent = opponents[0] ?? null;
  const rightOpponent = opponents[1] ?? null;
  const leftOpponent = opponents[2] ?? null;
  const extraOpponents = opponents.slice(3);

  return (
    <>
      <Head>
        <title>{roomId ? `Game · ${roomId}` : "Game"}</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-[#24160e] text-slate-900">
        <header className="shrink-0 flex items-center justify-between gap-3 border-b border-white/[0.08] bg-gradient-to-r from-[#1e140c]/95 via-[#2a1a12]/95 to-[#1e140c]/95 px-4 py-3 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-[10px]">
          <Link
            href={`/lobby/${roomId}`}
            className="text-sm font-semibold text-white/90 transition-colors hover:text-white"
          >
            ← Lobby
          </Link>
          <div className="flex min-w-0 items-center gap-2.5 text-xs">
            <span className="shrink-0 rounded-md border border-white/15 bg-black/35 px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.14em] text-white/95 shadow-inner">
              {roomId}
            </span>
            <span className="inline max-w-[40vw] truncate text-white/80 sm:max-w-none">
              {game?.ownerId === playerId ? (
                <span className="mr-0.5" title="Room owner" aria-hidden>
                  👑
                </span>
              ) : null}
              {nickname || "Guest"}
            </span>
          </div>
        </header>

        {game?.gameOver ? (
          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 text-center">
              <p className="text-5xl mb-2" aria-hidden>
                🏆
              </p>
              <p className="text-2xl font-bold text-slate-900">{game.gameOver.winnerName} wins!</p>
              <p className="text-slate-500 mt-2 text-sm">Head back to the lobby for another round.</p>
              <Button className="mt-8 w-full py-3" variant="secondary" onClick={() => void router.push(`/lobby/${roomId}`)}>
                Return to lobby
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex min-h-0 flex-1 flex-col p-2 sm:p-3 md:p-4">
              <div
                className="
                  relative flex min-h-0 flex-1 flex-col overflow-visible rounded-[1.05rem]
                  border-[5px] border-[#3d2816] pb-0
                  bg-gradient-to-b from-[#5c4030] via-[#4a3322] to-[#2f1f14]
                  shadow-[0_1px_0_rgba(255,255,255,0.07)_inset,0_20px_50px_rgba(0,0,0,0.45),0_4px_0_#1a120c]
                "
              >
                {/* Wood rail highlight */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[1rem] shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]"
                  aria-hidden
                />
                {/* Felt well — layered for depth */}
                <div
                  className="
                    pointer-events-none absolute inset-[11px] rounded-[0.72rem]
                    bg-[#3d5c38]
                    shadow-[inset_0_0_100px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.11)]
                  "
                  aria-hidden
                />
                <div
                  className="
                    pointer-events-none absolute inset-[11px] rounded-[0.72rem]
                    bg-[radial-gradient(ellipse_92%_72%_at_50%_38%,rgba(95,139,90,0.97)_0%,rgba(62,97,60,1)_48%,rgba(42,72,44,1)_100%)]
                  "
                  aria-hidden
                />
                <div
                  className="
                    pointer-events-none absolute inset-[11px] rounded-[0.72rem] opacity-[0.4]
                    bg-[radial-gradient(circle_at_12px_12px,rgba(28,48,32,0.55)_0_2px,transparent_3px)]
                    bg-[length:26px_26px]
                  "
                  aria-hidden
                />
                {/* Soft vignette on felt */}
                <div
                  className="
                    pointer-events-none absolute inset-[11px] rounded-[0.72rem]
                    shadow-[inset_0_0_120px_rgba(0,0,0,0.28)]
                  "
                  aria-hidden
                />

                {topOpponent ? (
                  <div className="relative z-10 flex w-full shrink-0 flex-col items-center gap-1 px-1 pt-2 sm:pt-3">
                    <div className="flex max-w-full flex-wrap items-end justify-center gap-0 overflow-x-auto">
                      {Array.from({ length: topOpponent.cardCount }).map((_, i) => (
                        <div key={`top-${i}`} className={`${HAND_OVERLAP_L} shrink-0`}>
                          <CardBack />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-full border border-white/15 bg-black/25 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/95 shadow-sm backdrop-blur-sm sm:text-[11px]">
                      {topOpponent.name.toUpperCase()} · {topOpponent.cardCount} cards
                    </div>
                  </div>
                ) : null}

                <div className="relative z-20 flex min-h-0 flex-1 flex-col">
                  {leftOpponent ? (
                    <div className="absolute left-1 top-1/2 z-10 flex max-h-[min(85vh,100%)] -translate-y-1/2 items-start gap-1 sm:left-2">
                      <div className="flex max-h-[min(85vh,100%)] flex-col flex-wrap content-start items-center gap-0">
                        {Array.from({ length: leftOpponent.cardCount }).map((_, i) => (
                          <div key={`left-${i}`} className={`${OPPONENT_STACK_OVERLAP} shrink-0`}>
                            <CardBack />
                          </div>
                        ))}
                      </div>
                      <div className="-rotate-90 whitespace-nowrap rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/95 shadow-sm backdrop-blur-sm">
                        {leftOpponent.name.toUpperCase()}
                      </div>
                    </div>
                  ) : null}

                  {rightOpponent ? (
                    <div className="absolute right-1 top-1/2 z-10 flex max-h-[min(85vh,100%)] -translate-y-1/2 items-start gap-1 sm:right-2">
                      <div className="rotate-90 whitespace-nowrap rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/95 shadow-sm backdrop-blur-sm">
                        {rightOpponent.name.toUpperCase()}
                      </div>
                      <div className="flex max-h-[min(85vh,100%)] flex-col flex-wrap content-start items-center gap-0">
                        {Array.from({ length: rightOpponent.cardCount }).map((_, i) => (
                          <div key={`right-${i}`} className={`${OPPONENT_STACK_OVERLAP} shrink-0`}>
                            <CardBack />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {extraOpponents.length ? (
                    <div className="absolute right-2 top-3 z-20 sm:right-3 sm:top-4">
                      <span className="inline-block rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-white/95 shadow-sm backdrop-blur-sm">
                        +{extraOpponents.length} more
                      </span>
                    </div>
                  ) : null}

                  {err ? (
                    <p className="absolute left-1/2 top-2 z-30 max-w-[90%] -translate-x-1/2 text-center text-sm font-medium text-red-800 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      {err}
                    </p>
                  ) : null}

                  {/* Vertically centered on the felt: Draw | turn arrow | Discard */}
                  <div className="flex flex-1 items-center justify-center px-2 py-3 sm:px-4 sm:py-6">
                    <div
                      className="
                        flex w-full max-w-4xl flex-row items-end justify-center
                        gap-8 sm:gap-12 md:gap-20 lg:gap-28
                      "
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.45)] sm:text-[11px]">
                          Draw
                        </span>
                        <button
                          type="button"
                          disabled={!isMyTurn || pending !== null}
                          title={isMyTurn ? "Click to draw one card" : "Not your turn"}
                          onClick={() => void draw()}
                          className={`
                            group relative shrink-0 rounded-lg focus:outline-none
                            focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                            disabled:cursor-not-allowed disabled:opacity-50
                            ${isMyTurn && !pending ? "cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0" : ""}
                          `}
                          aria-label="Draw one card from the deck"
                        >
                          <CardBack
                            className={`${isMyTurn && !pending ? "ring-2 ring-amber-300/50" : "opacity-90"}`}
                          />
                        </button>
                      </div>

                      <div
                        className="
                          flex min-h-[9.625rem] min-w-[5.5rem] flex-col items-center justify-end gap-1
                          px-2 sm:min-h-[10.325rem] sm:min-w-[7rem] md:min-h-[11.025rem] md:min-w-[8rem]
                        "
                        aria-live="polite"
                      >
                        {game?.gameStarted && game.currentTurnPlayerId ? (
                          <>
                            <div className="flex flex-1 flex-col items-center justify-center pb-1">
                              <div className="animate-turn-arrow-bob drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                                <div
                                  className="text-2xl font-black leading-none text-amber-100 sm:text-3xl"
                                  style={{
                                    transform: `rotate(${turnArrowRotateDeg(game.currentTurnPlayerId, playerId, topOpponent, rightOpponent, leftOpponent)}deg)`,
                                  }}
                                  aria-hidden
                                >
                                  ▲
                                </div>
                              </div>
                            </div>
                            <span className="max-w-[min(12rem,28vw)] truncate text-center text-[10px] font-semibold text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] sm:max-w-[14rem] sm:text-[11px]">
                              {game.currentTurnPlayerName}&apos;s turn
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-white/40 sm:text-[11px]">Waiting…</span>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.45)] sm:text-[11px]">
                          Discard
                        </span>
                        <div className="relative drop-shadow-[0_10px_24px_rgba(0,0,0,0.4)]">
                          {game?.topCard ? (
                            <PlayingCard
                              card={game.topCard}
                              activeColor={
                                isWildCard(game.topCard) ? game.activeColor : undefined
                              }
                            />
                          ) : (
                            <div
                              className={`rounded-[9px] border-2 border-dashed border-white/50 bg-white/12 ${TABLE_CARD_CLASS}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-30 shrink-0 px-0 pb-2 [padding-bottom:calc(env(safe-area-inset-bottom)+0.5rem)] sm:px-1">
                  <p className="mb-1.5 text-center text-[10px] font-semibold tracking-wide text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)] sm:text-[11px] md:text-xs">
                    Your hand · {nickname || "Guest"} · {myCards.length}{" "}
                    {myCards.length === 1 ? "card" : "cards"}
                  </p>
                  <div className="mx-auto flex max-w-full flex-wrap content-end items-end justify-center gap-0 [isolation:isolate]">
                    {myCards.map((card, i) => (
                      <button
                        key={`${card.color}-${card.number}-${i}`}
                        type="button"
                        disabled={!isMyTurn || pending !== null}
                        onClick={() => void playCard(card)}
                        className={`
                          ${HAND_OVERLAP_L}
                          relative z-0 shrink-0 origin-bottom rounded-lg border-0 bg-transparent p-0
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60
                          disabled:opacity-100
                          active:translate-y-px
                          hover:!z-30
                        `}
                        style={{ zIndex: i }}
                      >
                        <PlayingCard card={card} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {wildPending ? (
                <div
                  className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="wild-pick-title"
                >
                  <div className="w-full max-w-sm rounded-2xl bg-white p-6 border border-slate-200">
                    <p id="wild-pick-title" className="text-center text-lg font-bold text-slate-900">
                      Pick a color
                    </p>
                    <p className="mt-1 text-center text-sm text-slate-500">Next cards must match this color.</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {COLOR_PICK.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`rounded-xl py-4 text-sm font-bold text-white border border-black/10 ${c.className}`}
                          onClick={() => {
                            const card = wildPending;
                            setWildPending(null);
                            void playCard(card, c.id);
                          }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setWildPending(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );
}
