import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { CardBack } from "@/components/CardBack";
import { PlayingCard } from "@/components/PlayingCard";
import type { Card, CardColor, GameState } from "@/lib/types";
import { HAND_OVERLAP_L, OPPONENT_STACK_OVERLAP, TABLE_CARD_CLASS } from "@/lib/cardLayout";
import { isCardPlayable } from "@/lib/playable";
import { getPlayerId, STORAGE_NICKNAME } from "@/lib/session";

const POLL_MS = 1000;

const COLOR_PICK: { id: CardColor; label: string; className: string }[] = [
  { id: "red", label: "Red", className: "bg-[#E23D4B] border-2 border-[#0B0F14] hover:brightness-95" },
  { id: "blue", label: "Blue", className: "bg-[#2E5BBA] border-2 border-[#0B0F14] hover:brightness-95" },
  { id: "green", label: "Green", className: "bg-[#0F9D7A] border-2 border-[#0B0F14] hover:brightness-95" },
  { id: "yellow", label: "Yellow", className: "bg-[#F0C808] border-2 border-[#0B0F14] text-[#0B0F14] hover:brightness-95" },
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
  const pendingDraw = game?.pendingDraw ?? 0;

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

      <div className="game-shell-bg flex min-h-screen flex-col text-[#0B0F14]">
        <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between gap-3 border-b-4 border-[#0B0F14] bg-[#FFFDF8] px-4 py-3">
          <Link
            href={`/lobby/${roomId}`}
            className="text-sm font-semibold text-[#0B0F14]/70 transition-colors hover:text-[#0B0F14]"
          >
            ← Lobby
          </Link>
          <div className="flex min-w-0 items-center gap-3 text-xs">
            <span className="shrink-0 rounded-md border-2 border-[#0B0F14] bg-white px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.18em] text-[#0B0F14]">
              {roomId}
            </span>
            <span className="inline max-w-[36vw] truncate text-[#0B0F14]/75 sm:max-w-none">
              {game?.ownerId === playerId ? (
                <span className="mr-1 opacity-80" title="Room owner" aria-hidden>
                  👑
                </span>
              ) : null}
              {nickname || "Guest"}
            </span>
          </div>
        </header>

        {game?.gameOver ? (
          <div className="flex flex-1 items-center justify-center px-4 py-14">
            <div className="w-full max-w-md rounded-2xl border-4 border-[#0B0F14] bg-[#FFFDF8] p-10 text-center">
              <p className="font-display text-4xl font-semibold tracking-tight text-[#0B0F14] sm:text-5xl">Round over</p>
              <p className="mt-6 text-2xl font-bold text-[#0B0F14]">{game.gameOver.winnerName}</p>
              <p className="mt-1 text-[#0B0F14]/60">won this hand.</p>
              <Button className="mt-10 w-full py-3.5" variant="secondary" onClick={() => void router.push(`/lobby/${roomId}`)}>
                Return to lobby
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex min-h-0 flex-1 flex-col p-2 sm:p-3 md:p-5">
              <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
                <div className="relative flex min-h-0 flex-1 flex-col overflow-visible rounded-2xl border-4 border-[#0B0F14] bg-[#b8e0d2] p-2 sm:p-3">
                  <div className="relative flex min-h-0 flex-1 flex-col overflow-visible rounded-xl border-2 border-[#0B0F14] bg-[#b8e0d2]">
                    {topOpponent ? (
                      <div className="relative z-10 flex w-full shrink-0 flex-col items-center gap-2 px-2 pt-3 sm:pt-4">
                        <div className="flex max-w-full flex-wrap items-end justify-center gap-0 overflow-x-auto pb-0.5">
                          {Array.from({ length: topOpponent.cardCount }).map((_, i) => (
                            <div key={`top-${i}`} className={`${HAND_OVERLAP_L} shrink-0`}>
                              <CardBack />
                            </div>
                          ))}
                        </div>
                        <div className="rounded-full border-2 border-[#0B0F14] bg-[#FFFDF8] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0B0F14] sm:text-[11px]">
                          {topOpponent.name.toUpperCase()} · {topOpponent.cardCount} cards
                        </div>
                      </div>
                    ) : null}

                    <div className="relative z-20 flex min-h-0 flex-1 flex-col">
                      {leftOpponent ? (
                        <div className="absolute left-1 top-1/2 z-10 flex max-h-[min(85vh,100%)] -translate-y-1/2 items-start gap-1.5 sm:left-2">
                          <div className="flex max-h-[min(85vh,100%)] flex-col flex-wrap content-start items-center gap-0">
                            {Array.from({ length: leftOpponent.cardCount }).map((_, i) => (
                              <div key={`left-${i}`} className={`${OPPONENT_STACK_OVERLAP} shrink-0`}>
                                <CardBack />
                              </div>
                            ))}
                          </div>
                          <div className="-rotate-90 whitespace-nowrap rounded-full border-2 border-[#0B0F14] bg-[#FFFDF8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0B0F14]">
                            {leftOpponent.name.toUpperCase()}
                          </div>
                        </div>
                      ) : null}

                      {rightOpponent ? (
                        <div className="absolute right-1 top-1/2 z-10 flex max-h-[min(85vh,100%)] -translate-y-1/2 items-start gap-1.5 sm:right-2">
                          <div className="rotate-90 whitespace-nowrap rounded-full border-2 border-[#0B0F14] bg-[#FFFDF8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0B0F14]">
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
                          <span className="inline-block rounded-full border-2 border-[#0B0F14] bg-[#FFFDF8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0B0F14]">
                            +{extraOpponents.length} more
                          </span>
                        </div>
                      ) : null}

                      {err ? (
                        <p className="absolute left-1/2 top-2 z-30 max-w-[min(92%,24rem)] -translate-x-1/2 rounded-xl border-2 border-[#0B0F14] bg-[#FF5C5C] px-4 py-2.5 text-center text-sm font-semibold text-[#0B0F14]">
                          {err}
                        </p>
                      ) : null}

                      <div className="flex flex-1 items-center justify-center px-2 py-4 sm:px-4 sm:py-6">
                        <div className="flex w-full max-w-4xl flex-row items-end justify-center gap-7 sm:gap-12 md:gap-20 lg:gap-28">
                          <div className="flex flex-col items-center gap-2">
                            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0B0F14]/80 sm:text-[11px]">
                              {pendingDraw > 0 && isMyTurn ? `Take ${pendingDraw}` : "Draw"}
                            </span>
                            <button
                              type="button"
                              disabled={!isMyTurn || pending !== null}
                              title={
                                !isMyTurn
                                  ? "Not your turn"
                                  : pendingDraw > 0
                                    ? `Take ${pendingDraw} stacked card${pendingDraw === 1 ? "" : "s"} (+2/+4 chain)`
                                    : "Draw one card from the deck"
                              }
                              onClick={() => void draw()}
                              className={`
                            group relative shrink-0 rounded-md focus:outline-none
                            focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B0F14] focus-visible:outline-offset-2
                            disabled:cursor-not-allowed disabled:opacity-45
                            ${isMyTurn && !pending ? "cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0" : ""}
                          `}
                              aria-label={
                                pendingDraw > 0 && isMyTurn
                                  ? `Take ${pendingDraw} cards from the penalty`
                                  : "Draw one card from the deck"
                              }
                            >
                              <CardBack
                                className={`${isMyTurn && !pending ? "outline outline-[3px] outline-[#0B0F14] outline-offset-2" : "opacity-90"}`}
                              />
                            </button>
                          </div>

                          <div
                            className="
                          flex min-h-[9.625rem] min-w-[5.5rem] flex-col items-center justify-end gap-2
                          px-2 sm:min-h-[10.325rem] sm:min-w-[7rem] md:min-h-[11.025rem] md:min-w-[8rem]
                        "
                            aria-live="polite"
                          >
                            {game?.gameStarted && game.currentTurnPlayerId ? (
                              <>
                                <div className="flex flex-1 flex-col items-center justify-center pb-1">
                                  <div
                                    className={`rounded-full border-[3px] border-[#0B0F14] bg-[#FFFDF8] px-3 py-2 ${game.currentTurnPlayerId === playerId ? "animate-turn-border" : ""}`}
                                  >
                                    <div className="animate-turn-arrow-bob">
                                      <div
                                        className="text-2xl font-black leading-none text-[#FF5C5C] sm:text-3xl"
                                        style={{
                                          transform: `rotate(${turnArrowRotateDeg(game.currentTurnPlayerId, playerId, topOpponent, rightOpponent, leftOpponent)}deg)`,
                                        }}
                                        aria-hidden
                                      >
                                        ▲
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <span className="max-w-[min(12rem,28vw)] truncate text-center text-[10px] font-semibold text-[#0B0F14] sm:max-w-[14rem] sm:text-[11px]">
                                  {game.currentTurnPlayerName}&apos;s turn
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] text-[#0B0F14]/45 sm:text-[11px]">Waiting…</span>
                            )}
                          </div>

                          <div className="flex flex-col items-center gap-2">
                            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0B0F14]/80 sm:text-[11px]">
                              Discard
                            </span>
                            <div className="relative">
                              {game?.topCard ? (
                                <PlayingCard
                                  card={game.topCard}
                                  activeColor={
                                    isWildCard(game.topCard) ? game.activeColor : undefined
                                  }
                                />
                              ) : (
                                <div
                                  className={`rounded-md border-[3px] border-dashed border-[#0B0F14]/40 bg-[#FFFDF8]/80 ${TABLE_CARD_CLASS}`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-30 shrink-0 px-1 pb-2 [padding-bottom:calc(env(safe-area-inset-bottom)+0.65rem)] sm:px-2">
                      <div className="relative mx-auto max-w-full rounded-t-2xl border-t-2 border-x-2 border-[#0B0F14] border-b-0 bg-[#FFFDF8] px-2 pb-3 pt-3 sm:px-5 sm:pt-4">
                        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B0F14]/65 sm:text-[11px] md:text-xs">
                          Your hand · {nickname || "Guest"} · {myCards.length}{" "}
                          {myCards.length === 1 ? "card" : "cards"}
                          {pendingDraw > 0 && isMyTurn ? (
                            <span className="mt-1 block font-display normal-case tracking-normal text-[#FF5C5C]">
                              +2/+4 chain: play another +2 or +4, or use the deck to take {pendingDraw} cards.
                            </span>
                          ) : null}
                        </p>
                        <div className="mx-auto flex max-w-full flex-wrap content-end items-end justify-center gap-0 [isolation:isolate]">
                          {myCards.map((card, i) => {
                            const playable =
                              game &&
                              isCardPlayable(
                                card,
                                game.topCard,
                                game.activeColor,
                                myCards,
                                pendingDraw
                              );
                            const canClick = isMyTurn && pending === null && playable;
                            return (
                              <button
                                key={`${card.color}-${card.number}-${i}`}
                                type="button"
                                disabled={!canClick}
                                onClick={() => void playCard(card)}
                                className={`
                          ${HAND_OVERLAP_L}
                          relative z-0 shrink-0 origin-bottom rounded-xl border-0 bg-transparent p-0
                          focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0B0F14] focus-visible:outline-offset-1
                          disabled:cursor-not-allowed
                          active:translate-y-px
                          hover:!z-30
                        ${!canClick ? (isMyTurn ? "opacity-45" : "opacity-90") : ""}
                        `}
                                style={{ zIndex: i }}
                              >
                                <PlayingCard card={card} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {wildPending ? (
                <div
                  className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0B0F14]/35 px-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="wild-pick-title"
                >
                  <div className="w-full max-w-sm rounded-2xl border-4 border-[#0B0F14] bg-[#FFFDF8] p-7">
                    <p id="wild-pick-title" className="text-center font-display text-2xl font-semibold text-[#0B0F14]">
                      Choose color
                    </p>
                    <p className="mt-2 text-center text-sm text-[#0B0F14]/60">The next card must match this color.</p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {COLOR_PICK.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`rounded-xl py-4 text-sm font-bold transition active:scale-[0.98] ${c.className} ${c.id === "yellow" ? "" : "text-white"}`}
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
                      className="mt-5 w-full rounded-xl border-2 border-[#0B0F14] bg-white py-2.5 text-sm font-semibold text-[#0B0F14] transition hover:bg-[#edeae4]"
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
