import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import type { LobbyState } from "@/lib/types";
import { getPlayerId, setSession, STORAGE_NICKNAME } from "@/lib/session";

export default function JoinRoomPage() {
  const router = useRouter();
  const { roomId: rawId } = router.query;
  const roomId = typeof rawId === "string" ? rawId.toUpperCase() : "";

  const [nickname, setNickname] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomMissing, setRoomMissing] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const redirectIfAlreadyMember = useCallback(async () => {
    const pid = getPlayerId();
    if (!roomId || !pid) {
      setCheckingSession(false);
      return;
    }
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`);
    if (res.status === 404) {
      setRoomMissing(true);
      setCheckingSession(false);
      return;
    }
    const data = (await res.json()) as LobbyState;
    if (data.players.some((p) => p.id === pid)) {
      await router.replace(`/lobby/${roomId}`);
      return;
    }
    setCheckingSession(false);
  }, [roomId, router]);

  useEffect(() => {
    if (!router.isReady || !roomId) return;
    void redirectIfAlreadyMember();
  }, [router.isReady, roomId, redirectIfAlreadyMember]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(STORAGE_NICKNAME);
    if (stored) setNickname(stored);
  }, []);

  async function handleJoin() {
    const name = nickname.trim();
    if (!name) {
      setErr("Enter your nickname.");
      return;
    }
    if (!roomId) return;
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, nickname: name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Could not join this room.");
        return;
      }
      setSession(data.playerId, data.player.name);
      await router.push(`/lobby/${data.roomId}`);
    } finally {
      setLoading(false);
    }
  }

  if (!router.isReady || !roomId) {
    return null;
  }

  if (roomMissing) {
    return (
      <>
        <Head>
          <title>Room not found</title>
        </Head>
        <div className="game-shell-bg flex min-h-screen flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-2xl border-4 border-[#0B0F14] bg-[#FFFDF8] p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-[#0B0F14]">Room not found</h1>
            <p className="mt-2 text-sm text-[#0B0F14]/65">This link may be wrong or the room has expired.</p>
            <Link href="/" className="mt-6 inline-block text-sm font-semibold text-[#0B0F14]/80 underline">
              Back to home
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (checkingSession) {
    return (
      <div className="game-shell-bg flex min-h-screen items-center justify-center text-sm text-[#0B0F14]/55">
        Loading…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{roomId ? `Join ${roomId}` : "Join room"}</title>
      </Head>
      <div className="game-shell-bg flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="mb-2 text-4xl" aria-hidden>
              🃏
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[#0B0F14] sm:text-4xl">
              You&apos;re invited
            </h1>
            <p className="mt-2 text-sm text-[#0B0F14]/65">
              Room <span className="font-mono font-semibold tracking-wider text-[#0B0F14]">{roomId}</span>
            </p>
          </div>

          <div className="space-y-6 rounded-2xl border-4 border-[#0B0F14] bg-[#FFFDF8] p-8">
            <div>
              <label htmlFor="join-nick" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#0B0F14]/55">
                Your nickname
              </label>
              <input
                id="join-nick"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="How should we call you?"
                maxLength={24}
                autoComplete="nickname"
                className="w-full rounded-xl border-2 border-[#0B0F14] bg-white px-4 py-3 text-[#0B0F14] placeholder:text-[#0B0F14]/40 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5C5C] focus-visible:outline-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleJoin();
                }}
              />
            </div>

            {err ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-2" role="alert">
                {err}
              </p>
            ) : null}

            <Button className="w-full py-3" disabled={loading} onClick={() => void handleJoin()}>
              {loading ? "Joining…" : "Join lobby"}
            </Button>

            <p className="text-center text-xs text-[#0B0F14]/45">
              <Link href="/" className="font-semibold text-[#0B0F14]/70 underline">
                Home
              </Link>
              {" · "}
              Create your own room from the home page
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
