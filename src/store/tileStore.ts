import { create } from "zustand";
import { ACTIVITY_LIMIT } from "@/constants/app.constants";
import type { ActivityEvent, Tile } from "@/types/tile.types";
import type { ConnectionStatus, LeaderboardEntry } from "@/types/user.types";
import { randomId, tileKey } from "@/lib/utils";

interface TileState {
  tiles: Record<string, Tile>;
  hydrated: boolean;
  pending: Set<string>; // tile keys with inflight optimistic claim
  leaderboard: LeaderboardEntry[];
  activity: ActivityEvent[];
  connection: ConnectionStatus;
  usingMock: boolean;

  setHydrated: (v: boolean) => void;
  hydrate: (tiles: Tile[]) => void;
  upsertTile: (t: Tile) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  pushActivity: (t: Tile) => void;
  markPending: (key: string) => void;
  clearPending: (key: string) => void;
  setConnection: (s: ConnectionStatus) => void;
  setUsingMock: (v: boolean) => void;
  reset: () => void;
}

export const useTileStore = create<TileState>((set) => ({
  tiles: {},
  hydrated: false,
  pending: new Set<string>(),
  leaderboard: [],
  activity: [],
  connection: "idle",
  usingMock: false,

  setHydrated: (v) => set({ hydrated: v }),

  hydrate: (list) =>
    set(() => {
      const tiles: Record<string, Tile> = {};
      for (const t of list) tiles[tileKey(t.x, t.y)] = t;
      return { tiles, hydrated: true };
    }),

  upsertTile: (t) =>
    set((s) => {
      const key = tileKey(t.x, t.y);
      const next = { ...s.tiles, [key]: t };
      const pending = new Set(s.pending);
      pending.delete(key);
      return { tiles: next, pending };
    }),

  setLeaderboard: (entries) => set({ leaderboard: entries }),

  pushActivity: (t) =>
    set((s) => {
      if (!t.ownerId || !t.ownerName || !t.ownerColor) return s;
      const ev: ActivityEvent = {
        id: randomId(),
        x: t.x,
        y: t.y,
        username: t.ownerName,
        color: t.ownerColor,
        at: Number(t.claimedAt) ?? Date.now(),
      };
      return { activity: [ev, ...s.activity].slice(0, ACTIVITY_LIMIT) };
    }),

  markPending: (key) =>
    set((s) => {
      const pending = new Set(s.pending);
      pending.add(key);
      return { pending };
    }),

  clearPending: (key) =>
    set((s) => {
      const pending = new Set(s.pending);
      pending.delete(key);
      return { pending };
    }),

  setConnection: (s) => set({ connection: s }),
  setUsingMock: (v) => set({ usingMock: v }),

  reset: () =>
    set({
      tiles: {},
      hydrated: false,
      pending: new Set(),
      leaderboard: [],
      activity: [],
    }),
}));
