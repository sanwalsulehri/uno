import { io, type Socket } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(url, { autoConnect: true, transports: ["websocket", "polling"] });
  }
  return socket;
}
