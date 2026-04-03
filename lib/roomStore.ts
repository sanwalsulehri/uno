import { randomUUID } from "crypto";

export type CardColor = "red" | "blue" | "green" | "yellow";

export type Card = { color: CardColor | "black"; number: number };

export type Player = { id: string; name: string; cards: Card[] };

export type Room = {
  id: string;
  players: Player[];
  currentTurn: number;
  direction: 1 | -1;
  deck: Card[];
  discardPile: Card[];
  gameStarted: boolean;
  gameOver: { winnerId: string; winnerName: string } | null;
  activeColor: CardColor;
};

const COLORS: CardColor[] = ["red", "blue", "green", "yellow"];

const g = globalThis as typeof globalThis & { __unoRooms?: Map<string, Room> };
if (!g.__unoRooms) g.__unoRooms = new Map<string, Room>();
const rooms = g.__unoRooms;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const color of COLORS) {
    for (let n = 0; n <= 9; n++) {
      deck.push({ color, number: n });
      deck.push({ color, number: n });
    }
    deck.push({ color, number: 10 });
    deck.push({ color, number: 10 });
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ color: "black", number: 11 });
    deck.push({ color: "black", number: 12 });
  }
  return shuffle(deck);
}

export function topDiscard(room: Room): Card | null {
  const d = room.discardPile;
  return d.length ? d[d.length - 1]! : null;
}

function isWild(card: Card): boolean {
  return card.color === "black" && (card.number === 11 || card.number === 12);
}

export function canPlay(card: Card, top: Card | null, activeColor: CardColor): boolean {
  if (!top) return true;
  if (isWild(card)) return true;
  if (isWild(top)) {
    return card.color === activeColor || isWild(card);
  }
  if (card.number === 10 && top.number === 10) return true;
  if (card.color === top.color) return true;
  if (card.number === top.number) return true;
  return false;
}

export function ensureDeckNotEmpty(room: Room): void {
  if (room.deck.length > 0) return;
  const top = room.discardPile.pop();
  if (!top) return;
  room.deck = shuffle(room.discardPile);
  room.discardPile = [top];
}

function randomRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)]!;
  return id;
}

function normalizeNickname(raw: string): string {
  const s = raw.trim().slice(0, 24);
  return s || "Guest";
}

export function getRoom(roomId: string): Room | undefined {
  return rooms.get(roomId.toUpperCase());
}

export function createRoom(nickname: string): { room: Room; playerId: string } {
  let roomId = randomRoomId();
  while (rooms.has(roomId)) roomId = randomRoomId();

  const playerId = randomUUID();
  const name = normalizeNickname(nickname);
  const room: Room = {
    id: roomId,
    players: [{ id: playerId, name, cards: [] }],
    currentTurn: 0,
    direction: 1,
    deck: [],
    discardPile: [],
    gameStarted: false,
    gameOver: null,
    activeColor: "red",
  };
  rooms.set(roomId, room);
  return { room, playerId };
}

export function joinRoom(
  roomId: string,
  nickname: string
): { ok: true; room: Room; playerId: string } | { ok: false; error: string } {
  const id = roomId.toUpperCase().trim();
  const room = rooms.get(id);
  if (!room) return { ok: false, error: "Room not found" };
  if (room.gameStarted) return { ok: false, error: "Game already started" };
  if (room.players.length >= 4) return { ok: false, error: "Room is full" };

  const playerId = randomUUID();
  const name = normalizeNickname(nickname);
  room.players.push({ id: playerId, name, cards: [] });
  return { ok: true, room, playerId };
}

export function startGame(
  roomId: string,
  startedByPlayerId: string
): { ok: true } | { ok: false; error: string } {
  const room = getRoom(roomId);
  if (!room) return { ok: false, error: "Room not found" };
  const owner = room.players[0];
  if (!owner || owner.id !== startedByPlayerId) {
    return { ok: false, error: "Only the room owner can start the game" };
  }
  if (room.gameStarted) return { ok: false, error: "Game already started" };
  if (room.players.length < 2) return { ok: false, error: "Need at least 2 players" };

  room.gameOver = null;
  room.deck = buildDeck();
  room.discardPile = [];
  room.players.forEach((p) => {
    p.cards = [];
  });

  for (let i = 0; i < 5; i++) {
    for (const p of room.players) {
      ensureDeckNotEmpty(room);
      const c = room.deck.pop();
      if (c) p.cards.push(c);
    }
  }

  ensureDeckNotEmpty(room);
  let starter = room.deck.pop();
  while (starter === undefined && room.deck.length) {
    starter = room.deck.pop();
  }
  if (!starter) return { ok: false, error: "Could not start game" };

  while (starter !== undefined && isWild(starter) && room.deck.length > 0) {
    room.deck.unshift(starter);
    starter = room.deck.pop();
  }
  if (!starter) return { ok: false, error: "Could not start game" };

  room.discardPile.push(starter);
  room.activeColor = isWild(starter)
    ? COLORS[Math.floor(Math.random() * COLORS.length)]!
    : (starter.color as CardColor);
  room.currentTurn = 0;
  room.direction = 1;
  room.gameStarted = true;
  return { ok: true };
}

function validCardShape(color: string, number: number): boolean {
  if (!Number.isInteger(number) || number < 0 || number > 12) return false;
  if (number === 11 || number === 12) return color === "black";
  if (color === "black") return false;
  return COLORS.includes(color as CardColor);
}

export function playCard(
  roomId: string,
  playerId: string,
  color: string,
  number: unknown,
  chosenColor?: string
): { ok: true } | { ok: false; error: string } {
  const room = getRoom(roomId);
  if (!room || !room.gameStarted) return { ok: false, error: "No active game" };

  const current = room.players[room.currentTurn];
  if (!current || current.id !== playerId) return { ok: false, error: "Not your turn" };

  if (typeof number !== "number" || !validCardShape(color, number)) {
    return { ok: false, error: "Invalid card" };
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { ok: false, error: "Player not in room" };

  const card = { color: color as Card["color"], number } as Card;
  if (isWild(card)) {
    if (!chosenColor || !COLORS.includes(chosenColor as CardColor)) {
      return { ok: false, error: "Choose a color for Wild" };
    }
  }

  const cardIndex = player.cards.findIndex((c) => c.color === color && c.number === number);
  if (cardIndex === -1) return { ok: false, error: "You don't have that card" };

  const cardToPlay = player.cards[cardIndex]!;
  const top = topDiscard(room);
  if (!canPlay(cardToPlay, top, room.activeColor)) return { ok: false, error: "Cannot play that card" };

  player.cards.splice(cardIndex, 1);
  room.discardPile.push(cardToPlay);

  if (isWild(cardToPlay)) {
    room.activeColor = (chosenColor as CardColor) || room.activeColor;
  } else {
    room.activeColor = cardToPlay.color !== "black" ? cardToPlay.color : room.activeColor;
  }

  if (player.cards.length === 0) {
    room.gameOver = { winnerId: player.id, winnerName: player.name };
    room.gameStarted = false;
    room.deck = [];
    room.discardPile = [];
    room.players.forEach((p) => {
      p.cards = [];
    });
    return { ok: true };
  }

  const n = room.players.length;
  room.currentTurn = (room.currentTurn + room.direction + n) % n;
  return { ok: true };
}

export function drawCard(roomId: string, playerId: string): { ok: true } | { ok: false; error: string } {
  const room = getRoom(roomId);
  if (!room || !room.gameStarted) return { ok: false, error: "No active game" };

  const current = room.players[room.currentTurn];
  if (!current || current.id !== playerId) return { ok: false, error: "Not your turn" };

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { ok: false, error: "Player not in room" };

  const top = topDiscard(room);
  ensureDeckNotEmpty(room);
  if (room.deck.length === 0) return { ok: false, error: "No cards to draw" };

  const drawn = room.deck.pop()!;
  const playable = canPlay(drawn, top, room.activeColor);
  player.cards.push(drawn);

  if (!playable) {
    const n = room.players.length;
    room.currentTurn = (room.currentTurn + room.direction + n) % n;
  }

  return { ok: true };
}

export function lobbySnapshot(room: Room) {
  const ownerId = room.players[0]?.id ?? "";
  return {
    id: room.id,
    ownerId,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      cardCount: p.cards.length,
    })),
    gameStarted: room.gameStarted,
    playerCount: room.players.length,
    gameOver: room.gameOver,
  };
}

export function gameSnapshot(room: Room, playerId: string) {
  const top = topDiscard(room);
  const me = room.players.find((p) => p.id === playerId);
  const currentPlayer = room.players[room.currentTurn];
  const ownerId = room.players[0]?.id ?? "";

  return {
    roomId: room.id,
    ownerId,
    gameStarted: room.gameStarted,
    myCards: me ? me.cards : [],
    topCard: top,
    activeColor: room.activeColor,
    currentTurnPlayerId: currentPlayer ? currentPlayer.id : null,
    currentTurnPlayerName: currentPlayer ? currentPlayer.name : null,
    direction: room.direction,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      cardCount: p.cards.length,
    })),
    gameOver: room.gameOver,
  };
}
