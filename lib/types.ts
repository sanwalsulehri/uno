export type CardColor = "red" | "blue" | "green" | "yellow";

export type Card = { color: CardColor; number: number };

export type RoomPlayer = { id: string; name: string; cardCount: number };

export type RoomUpdate = {
  id: string;
  players: RoomPlayer[];
  gameStarted: boolean;
  playerCount: number;
};

export type GameUpdate = {
  roomId: string;
  gameStarted: boolean;
  myCards: Card[];
  topCard: Card | null;
  currentTurnPlayerId: string | null;
  currentTurnPlayerName: string | null;
  direction: number;
  players: RoomPlayer[];
};
