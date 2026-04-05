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
  const isInRoom = Boolean(
    lobby && playerId && lobby.players.some((p) => p.id === playerId)
  );

  const [copied, setCopied] = useState(false);
  const inviteUrl =
    typeof window !== "undefined" && roomId ? `${window.location.origin}/join/${roomId}` : "";

  async function copyInviteLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setErr("Could not copy — select the link and copy manually.");
    }
  }

  return (
    <>
      <Head>
        <title>{roomId ? `Lobby · ${roomId}` : "Lobby"}</title>
      </Head>
      <div className="game-shell-bg min-h-screen px-4 py-10">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="text-sm font-semibold text-[#0B0F14]/70 transition-colors hover:text-[#0B0F14]">
              ← Home
            </Link>
            <span className="text-xs font-medium text-[#0B0F14]/75">
              {lobby?.ownerId === playerId ? <span aria-hidden>👑 </span> : null}
              {nickname}
            </span>
          </div>

          <div className="rounded-2xl border-4 border-[#0B0F14] bg-[#FFFDF8] p-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#0B0F14]">Lobby</h1>
            <p className="mt-1 text-[#0B0F14]/60">
              {isOwner ? (
                <span className="font-semibold text-[#0B0F14]">Share the invite link</span>
              ) : (
                <span>Waiting for the host to start</span>
              )}
            </p>

            {roomId ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="min-w-0 flex-1 rounded-xl border-2 border-[#0B0F14] bg-white px-3 py-2.5 font-mono text-[11px] leading-snug text-[#0B0F14] sm:text-xs break-all">
                  {inviteUrl || `…/join/${roomId}`}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 py-3 sm:px-6"
                  onClick={() => void copyInviteLink()}
                >
                  {copied ? "Copied!" : "Copy link"}
                </Button>
              </div>
            ) : null}

            <p className="mt-3 text-xs text-[#0B0F14]/50">
              Code:{" "}
              <span className="font-mono font-semibold tracking-[0.15em] text-[#0B0F14]/80">{roomId || "…"}</span>
              {" · "}
              friends can open the link and only enter a name
            </p>

            {lobby && playerId && !isInRoom ? (
              <p className="mt-4 rounded-2xl border-2 border-[#0B0F14] bg-[#b8e0d2] px-4 py-3 text-sm text-[#0B0F14]">
                You&apos;re not in this room yet.{" "}
                <Link href={`/join/${roomId}`} className="font-bold underline">
                  Join here
                </Link>{" "}
                (nickname only).
              </p>
            ) : null}

            {lobby?.gameOver ? (
              <p className="mt-4 text-sm rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 px-4 py-3">
                Last round: <strong>{lobby.gameOver.winnerName}</strong> won. Start again when everyone is ready.
              </p>
            ) : null}

            {err ? (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-2">{err}</p>
            ) : null}

            <div className="mt-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#0B0F14]/55">
                Players ({lobby?.playerCount ?? 0}/4)
              </h2>
              {lobby ? (
                <PlayerList players={lobby.players} highlightId={playerId} ownerId={lobby.ownerId} />
              ) : (
                <p className="text-sm text-[#0B0F14]/45">Loading…</p>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button
                className="w-full py-3"
                disabled={!canStart || starting || !isInRoom}
                onClick={() => void handleStart()}
              >
                {starting ? "Starting…" : "Start game"}
              </Button>
              {lobby && !isInRoom ? null : lobby && lobby.playerCount < 2 && !lobby.gameStarted ? (
                <p className="text-center text-sm text-[#0B0F14]/60">Need at least two players to start.</p>
              ) : null}
              {lobby && isInRoom && lobby.playerCount >= 2 && !lobby.gameStarted && !isOwner ? (
                <p className="text-center text-sm text-[#0B0F14]/60">Only 👑 the room owner can start the game.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
