export const GRID_SIZE = 20;
export const TOTAL_TILES = GRID_SIZE * GRID_SIZE;
export const COOLDOWN_MS = 800;
export const ACTIVITY_LIMIT = 30;
export const LEADERBOARD_LIMIT = 10;

/** Hand-tuned palette: harmonious saturation, distinguishable on a light board. */
export const PLAYER_COLORS: string[] = [
  "#ef4444", // rose-red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export const SOCKET_EVENTS = {
  GET_GRID: "get-grid",
  CLAIM_TILE: "claim-tile",
  GRID_DATA: "grid-data",
  TILE_UPDATED: "tile-updated",
  CLAIM_FAILED: "claim-failed",
  LEADERBOARD_UPDATED: "leaderboard-updated",
} as const;

/** Comma-separated origins to attempt; first one wins. Override via VITE_SOCKET_URL. */
export const SOCKET_URL: string =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? "";

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export const APP_NAME = "Grid Claim";