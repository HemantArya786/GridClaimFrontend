export interface User {
  id: string;
  username: string;
  color: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  color: string;
  tiles: number;
}

export type ConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";
