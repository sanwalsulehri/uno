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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="text-5xl mb-2" aria-hidden>
              🍕
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Play UNO online</h1>
            <p className="mt-2 text-slate-500 text-sm">Like Pizzuno · Guests · 2–4 players</p>
          </div>

          <div className="rounded-3xl bg-white/90 border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 space-y-6 backdrop-blur-sm">
            <div>
              <label htmlFor="nick" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Nickname
              </label>
              <input
                id="nick"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="How should we call you?"
                maxLength={24}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
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
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                <span className="bg-white px-3">Join a room</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="CODE"
                maxLength={8}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono tracking-[0.2em] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
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

          <p className="text-center text-xs text-slate-400 mt-8">No accounts · In-memory rooms · 1s polling</p>
        </div>
      </div>
    </>
  );
}
