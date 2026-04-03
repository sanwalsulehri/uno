export const STORAGE_PLAYER_ID = "uno_playerId";
export const STORAGE_NICKNAME = "uno_nickname";

export function getPlayerId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_PLAYER_ID);
}

export function setSession(playerId: string, nickname: string) {
  sessionStorage.setItem(STORAGE_PLAYER_ID, playerId);
  sessionStorage.setItem(STORAGE_NICKNAME, nickname);
}
