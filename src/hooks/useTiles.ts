import { useCallback } from "react";
import { toast } from "sonner";
import { COOLDOWN_MS } from "@/constants/app.constants";
import { Api } from "@/lib/api";
import { tileKey } from "@/lib/utils";
import { useTileStore } from "@/store/tileStore";
import { useUserStore } from "@/store/userStore";
import { getSocket } from "./useSocket";

export function useClaimTile() {
  const markPending = useTileStore((s) => s.markPending);
  const clearPending = useTileStore((s) => s.clearPending);
  const pending = useTileStore((s) => s.pending);
  const tiles = useTileStore((s) => s.tiles);

  return useCallback(
    (x: number, y: number) => {
      const socket = getSocket();
      const { id, username, color, nextClaimAt, setNextClaimAt } = useUserStore.getState();
      if (!socket || !id || !username || !color) return;

      const key = tileKey(x, y);
      const existing = tiles[key];
      if (existing?.ownerId) {
        toast(`Owned by ${existing.ownerName}`);
        return;
      }
      if (pending.has(key)) return;

      const now = Date.now();
      if (now < nextClaimAt) {
        const wait = ((nextClaimAt - now) / 1000).toFixed(1);
        toast(`Cooldown: ${wait}s`);
        return;
      }

      setNextClaimAt(now + COOLDOWN_MS);
      markPending(key);
      Api.claimTile(socket, { tileId: key, userId: id });

      // Safety timeout: if no response after 4s, clear pending so the user
      // can retry rather than being stuck.
      setTimeout(() => clearPending(key), 4000);
    },
    [markPending, clearPending, pending, tiles],
  );
}

/** Stable selector for one tile by key — used by memoized <Tile /> components. */
export function useTile(x: number, y: number) {
  return useTileStore((s) => s.tiles[tileKey(x, y)]);
}
