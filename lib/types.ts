export type CardColor = "red" | "blue" | "green" | "yellow";

/** 0–9 number cards; 10 = Draw Two (+2); 11 = Wild; 12 = Wild Draw Four (+4). Black only for 11/12. */
export type Card = { color: CardColor | "black"; number: number };

export type RoomPlayer = { id: string; name: string; cardCount: number };

export type GameOver = { winnerId: string; winnerName: string } | null;

export type LobbyState = {
  id: string;
  /** First player who created the room — only they may start the game. */
  ownerId: string;
  players: RoomPlayer[];
  gameStarted: boolean;
  playerCount: number;
  gameOver: GameOver;
};

export type GameState = {
  roomId: string;
  ownerId: string;
  gameStarted: boolean;
  myCards: Card[];
  topCard: Card | null;
  /** Color to match when the top discard is a Wild / Wild +4 */
  activeColor: CardColor;
  currentTurnPlayerId: string | null;
  currentTurnPlayerName: string | null;
  direction: number;
  players: RoomPlayer[];
  gameOver: GameOver;
};
