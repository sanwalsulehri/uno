import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { PlayerList } from "@/components/PlayerList";
import type { LobbyState } from "@/lib/types";
import { getPlayerId, STORAGE_NICKNAME } from "@/lib/session";

const POLL_MS = 1000;

export default function LobbyPage() {
  const router = useRouter();
  const { roomId: rawId } = router.query;
  const roomId = typeof rawId === "string" ? rawId.toUpperCase() : "";

  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(false);
  const [nickname, setNickname] = useState("");
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    setNickname(sessionStorage.getItem(STORAGE_NICKNAME) || "");
    setPlayerId(getPlayerId());
  }, []);

  const fetchLobby = useCallback(async () => {
    if (!roomId) return;
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`);
    if (res.status === 404) {
      setErr("Room not found.");
      setLobby(null);
      return;
    }
    const data = (await res.json()) as LobbyState;
    setLobby(data);
    setErr("");
    if (data.gameStarted) {
      await router.push(`/game/${roomId}`);
    }
  }, [roomId, router]);

  useEffect(() => {
    if (!router.isReady || !roomId) return;
    void fetchLobby();
    const id = setInterval(() => void fetchLobby(), POLL_MS);
    return () => clearInterval(id);
  }, [router.isReady, roomId, fetchLobby]);

  async function handleStart() {
    const pid = getPlayerId();
    if (!roomId || !pid) {
      setErr("Session missing — go back home.");
      return;
    }
    setStarting(true);
    setErr("");
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: pid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Could not start.");
        return;
      }
      await router.push(`/game/${roomId}`);
    } finally {
      setStarting(false);
    }
  }

  const isOwner = Boolean(lobby && playerId && lobby.ownerId === playerId);
  const canStart = lobby && lobby.playerCount >= 2 && !lobby.gameStarted && isOwner;

  return (
    <>
      <Head>
        <title>{roomId ? `Lobby · ${roomId}` : "Lobby"}</title>
      </Head>
      <div className="min-h-screen px-4 py-10 bg-[#eceff4]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              ← Home
            </Link>
            <span className="text-xs font-medium text-slate-500">
              {lobby?.ownerId === playerId ? <span aria-hidden>👑 </span> : null}
              {nickname}
            </span>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8">
            <h1 className="text-2xl font-bold text-slate-900">Lobby 🍕</h1>
            <p className="mt-1 text-slate-500">
              Room code:{" "}
              <span className="font-mono font-semibold tracking-[0.15em] text-slate-800">{roomId || "…"}</span>
            </p>

            {lobby?.gameOver ? (
              <p className="mt-4 text-sm rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 px-4 py-3">
                Last round: <strong>{lobby.gameOver.winnerName}</strong> won. Start again when everyone is ready.
              </p>
            ) : null}

            {err ? (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-2">{err}</p>
            ) : null}

            <div className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Players ({lobby?.playerCount ?? 0}/4)
              </h2>
              {lobby ? (
                <PlayerList players={lobby.players} highlightId={playerId} ownerId={lobby.ownerId} />
              ) : (
                <p className="text-slate-400 text-sm">Loading…</p>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button
                className="w-full py-3"
                disabled={!canStart || starting}
                onClick={() => void handleStart()}
              >
                {starting ? "Starting…" : "Start game"}
              </Button>
              {lobby && lobby.playerCount < 2 && !lobby.gameStarted ? (
                <p className="text-center text-sm text-slate-500">Need at least two players to start.</p>
              ) : null}
              {lobby && lobby.playerCount >= 2 && !lobby.gameStarted && !isOwner ? (
                <p className="text-center text-sm text-slate-500">Only 👑 the room owner can start the game.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
