import {
  GRID_SIZE,
  PLAYER_COLORS,
  SOCKET_EVENTS,
  TOTAL_TILES,
} from "@/constants/app.constants";
import type { ClaimFailedPayload, ClaimPayload, Tile } from "@/types/tile.types";
import type { LeaderboardEntry } from "@/types/user.types";
import { randomId, tileKey } from "./utils";
import type { SocketLike } from "./socket";

/**
 * In-memory adapter that implements the same event contract as the real
 * Socket.IO server. Used as a fallback when no VITE_SOCKET_URL is set so
 * the UI is fully demoable. A few bot players claim tiles on a timer.
 */
export function createMockSocket(auth?: Record<string, unknown>): SocketLike {
  const handlers = new Map<string, Set<(...args: any[]) => void>>();
  const tiles = new Map<string, Tile>();
  let connected = false;
  let botTimer: ReturnType<typeof setInterval> | null = null;

  const id = "mock-" + randomId().slice(0, 8);

  const bots = [
    { id: "bot-aria", name: "Aria", color: PLAYER_COLORS[0] },
    { id: "bot-ken", name: "Ken", color: PLAYER_COLORS[6] },
    { id: "bot-mira", name: "Mira", color: PLAYER_COLORS[10] },
    { id: "bot-leo", name: "Leo", color: PLAYER_COLORS[4] },
  ];

  function emitTo(event: string, ...args: unknown[]) {
    handlers.get(event)?.forEach((h) => {
      try {
        h(...args);
      } catch {
        /* ignore handler errors */
      }
    });
  }

  function buildLeaderboard(): LeaderboardEntry[] {
    const counts = new Map<string, LeaderboardEntry>();
    for (const t of tiles.values()) {
      if (!t.ownerId) continue;
      const e = counts.get(t.ownerId);
      if (e) e.tiles += 1;
      else
        counts.set(t.ownerId, {
          userId: t.ownerId,
          username: t.ownerName ?? "Unknown",
          color: t.ownerColor ?? "#999",
          tiles: 1,
        });
    }
    return [...counts.values()].sort((a, b) => b.tiles - a.tiles);
  }

  function snapshot(): Tile[] {
    const list: Tile[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        list.push(
          tiles.get(tileKey(x, y)) ?? {
            x,
            y,
            ownerId: null,
            ownerName: null,
            ownerColor: null,
            claimedAt: null,
          },
        );
      }
    }
    return list;
  }

  function botTick() {
    if (tiles.size >= TOTAL_TILES) return;
    const bot = bots[Math.floor(Math.random() * bots.length)];
    // try a few random spots
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const k = tileKey(x, y);
      if (tiles.has(k)) continue;
      const t: Tile = {
        x,
        y,
        ownerId: bot.id,
        ownerName: bot.name,
        ownerColor: bot.color,
        claimedAt: Date.now(),
      };
      tiles.set(k, t);
      emitTo(SOCKET_EVENTS.TILE_UPDATED, t);
      emitTo(SOCKET_EVENTS.LEADERBOARD_UPDATED, buildLeaderboard());
      return;
    }
  }

  function startBots() {
    if (botTimer) return;
    // seed a few claims so the board doesn't start cold
    for (let i = 0; i < 12; i++) botTick();
    botTimer = setInterval(botTick, 1800);
  }

  function stopBots() {
    if (botTimer) clearInterval(botTimer);
    botTimer = null;
  }

  const socket: SocketLike = {
    id,
    connected: false,
    emit(event, ...args) {
      if (event === SOCKET_EVENTS.GET_GRID) {
        // simulate latency
        setTimeout(() => {
          emitTo(SOCKET_EVENTS.GRID_DATA, snapshot());
          emitTo(SOCKET_EVENTS.LEADERBOARD_UPDATED, buildLeaderboard());
        }, 250);
        return;
      }
      if (event === SOCKET_EVENTS.CLAIM_TILE) {
        const p = args[0] as ClaimPayload;
        const k = tileKey(p.x, p.y);
        const existing = tiles.get(k);
        if (existing && existing.ownerId) {
          const fail: ClaimFailedPayload = {
            x: p.x,
            y: p.y,
            reason: `Tile already owned by ${existing.ownerName}`,
          };
          setTimeout(() => emitTo(SOCKET_EVENTS.CLAIM_FAILED, fail), 80);
          return;
        }
        const t: Tile = {
          x: p.x,
          y: p.y,
          ownerId: p.userId,
          ownerName: p.username,
          ownerColor: p.color,
          claimedAt: Date.now(),
        };
        tiles.set(k, t);
        setTimeout(() => {
          emitTo(SOCKET_EVENTS.TILE_UPDATED, t);
          emitTo(SOCKET_EVENTS.LEADERBOARD_UPDATED, buildLeaderboard());
        }, 60);
      }
    },
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler);
    },
    off(event, handler) {
      if (!handler) handlers.delete(event);
      else handlers.get(event)?.delete(handler);
    },
    connect() {
      if (connected) return;
      connected = true;
      this.connected = true;
      setTimeout(() => emitTo("connect"), 30);
      startBots();
    },
    disconnect() {
      connected = false;
      this.connected = false;
      stopBots();
      emitTo("disconnect");
    },
  };

  // auth is just consumed; bots never collide with the user id
  void auth;
  return socket;
}
