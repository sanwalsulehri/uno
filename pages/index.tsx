import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "@/components/Button";
import { setSession } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState<"create" | "join" | null>(null);

  async function handleCreate() {
    const name = nickname.trim();
    if (!name) {
      setErr("Enter a nickname to play.");
      return;
    }
    setErr("");
    setLoading("create");
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Could not create room.");
        return;
      }
      setSession(data.playerId, data.player.name);
      await router.push(`/lobby/${data.roomId}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleJoin() {
    const name = nickname.trim();
    const code = roomCode.trim().toUpperCase();
    if (!name) {
      setErr("Enter a nickname to play.");
      return;
    }
    if (!code) {
      setErr("Enter a room code.");
      return;
    }
    setErr("");
    setLoading("join");
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: code, nickname: name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Could not join room.");
        return;
      }
      setSession(data.playerId, data.player.name);
      await router.push(`/lobby/${data.roomId}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Head>
        <title>UNO — Play</title>
        <meta name="description" content="Minimal UNO-style multiplayer (guests)" />
      </Head>
      <div className="game-shell-bg flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <p className="mb-2 text-5xl" aria-hidden>
              🃏
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[#0B0F14] sm:text-5xl">Play UNO online</h1>
            <p className="mt-2 text-sm text-[#0B0F14]/65">
              Create a room, copy the invite link from the lobby, friends open it and pick a name.
            </p>
          </div>

          <div className="space-y-6 rounded-2xl border-4 border-[#0B0F14] bg-[#FFFDF8] p-8">
            <div>
              <label htmlFor="nick" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#0B0F14]/55">
                Nickname
              </label>
              <input
                id="nick"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="How should we call you?"
                maxLength={24}
                className="w-full rounded-xl border-2 border-[#0B0F14] bg-white px-4 py-3 text-[#0B0F14] placeholder:text-[#0B0F14]/40 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5C5C] focus-visible:outline-offset-2"
              />
            </div>

            {err ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-2" role="alert">
                {err}
              </p>
            ) : null}

            <Button
              className="w-full py-3"
              disabled={loading !== null}
              onClick={() => void handleCreate()}
            >
              {loading === "create" ? "Creating…" : "Create room"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t-2 border-[#0B0F14]/15" />
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider text-[#0B0F14]/45">
                <span className="bg-[#FFFDF8] px-3">Or join with a code</span>
              </div>
            </div>

            <p className="text-center text-xs text-[#0B0F14]/45">
              If you don&apos;t have a link, ask for the 6-character code.
            </p>

            <div className="flex gap-2">
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="CODE"
                maxLength={8}
                className="flex-1 rounded-xl border-2 border-[#0B0F14] bg-white px-4 py-3 font-mono tracking-[0.2em] text-[#0B0F14] placeholder:text-[#0B0F14]/40 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF5C5C] focus-visible:outline-offset-2"
              />
              <Button
                variant="secondary"
                className="shrink-0 py-3"
                disabled={loading !== null}
                onClick={() => void handleJoin()}
              >
                {loading === "join" ? "…" : "Join"}
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-[#0B0F14]/45">No accounts · In-memory rooms · 1s polling</p>
        </div>
      </div>
    </>
  );
}
