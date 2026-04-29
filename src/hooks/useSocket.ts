import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { SOCKET_EVENTS } from "@/constants/app.constants";
import { Api } from "@/lib/api";
import { createSocket, type SocketLike } from "@/lib/socket";
import { useTileStore } from "@/store/tileStore";
import { useUserStore } from "@/store/userStore";
import type { ClaimFailedPayload } from "@/types/tile.types";

let singleton: SocketLike | null = null;

export function getSocket(): SocketLike | null {
  return singleton;
}

/**
 * Mounts once at the app root. Establishes the socket connection,
 * wires all server -> store event handlers, and handles initial data load.
 */
export function useSocketBootstrap() {
  const userId = useUserStore((s) => s.id);
  const username = useUserStore((s) => s.username);
  const color = useUserStore((s) => s.color);

  const setConnection = useTileStore((s) => s.setConnection);
  const setUsingMock = useTileStore((s) => s.setUsingMock);
  const hydrate = useTileStore((s) => s.hydrate);
  const upsertTile = useTileStore((s) => s.upsertTile);
  const setLeaderboard = useTileStore((s) => s.setLeaderboard);
  const pushActivity = useTileStore((s) => s.pushActivity);
  const clearPending = useTileStore((s) => s.clearPending);

  const isValidId = userId && /^[0-9a-fA-F]{24}$/.test(userId);
  const ready = !!(isValidId && username && color);
  const startedRef = useRef(false);

  // 1. Initial Grid Load (REST)
  useEffect(() => {
    const fetchInitialGrid = async () => {
      try {
        const tiles = await Api.fetchGrid();
        const mapped = tiles.map((t: any) => ({
          ...t,
          ownerColor: t.color || t.ownerColor,
          claimedAt: t.claimedAt ? new Date(t.claimedAt).getTime() : null,
        }));
        hydrate(mapped);
      } catch (err) {
        console.warn("REST grid fetch failed, will retry via socket", err);
      }
    };

    fetchInitialGrid();
  }, [hydrate]);

  // 2. Socket Connection & Real-time Updates
  useEffect(() => {
    if (!ready || startedRef.current) return;
    startedRef.current = true;
    setConnection("connecting");

    const socket = createSocket({
      auth: { userId, username, color },
      onFallback: () => {
        setUsingMock(true);
        toast("Demo mode", {
          description: "No backend detected — running with simulated players.",
        });
      },
    });
    singleton = socket;

    const onConnect = () => {
      setConnection("connected");
      // Re-fetch grid on reconnect to ensure consistency
      Api.getGrid(socket);
    };

    const onDisconnect = () => setConnection("disconnected");
    const onReconnectAttempt = () => setConnection("reconnecting");
    const onGridData = (data: { tiles: any[] }) => {
      const mapped = data.tiles.map((t) => ({
        ...t,
        ownerColor: t.color || t.ownerColor, // map backend 'color' to 'ownerColor'
        claimedAt: t.claimedAt ? new Date(t.claimedAt).getTime() : null,
      }));
      hydrate(mapped);
    };

    const onTileUpdated = (t: any) => {
      const mapped = {
        ...t,
        ownerColor: t.color || t.ownerColor,
        claimedAt: t.claimedAt ? new Date(t.claimedAt).getTime() : null,
      };
      upsertTile(mapped);
      pushActivity(mapped);
    };
    const onLeaderboardUpdated = (data: { leaderboard: any[] }) => {
      const mapped = data.leaderboard.map((e) => ({
        ...e,
        tiles: e.totalClaims || e.tiles, // map backend 'totalClaims' to frontend 'tiles'
      }));
      setLeaderboard(mapped);
    };
    const onClaimFailed = (p: ClaimFailedPayload) => {
      clearPending(p.tileId);
      toast.error("Claim failed", { description: p.reason });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect_attempt", onReconnectAttempt);
    socket.on(SOCKET_EVENTS.GRID_DATA, onGridData);
    socket.on(SOCKET_EVENTS.TILE_UPDATED, onTileUpdated);
    socket.on(SOCKET_EVENTS.LEADERBOARD_UPDATED, onLeaderboardUpdated);
    socket.on(SOCKET_EVENTS.CLAIM_FAILED, onClaimFailed);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect_attempt", onReconnectAttempt);
      socket.off(SOCKET_EVENTS.GRID_DATA, onGridData);
      socket.off(SOCKET_EVENTS.TILE_UPDATED, onTileUpdated);
      socket.off(SOCKET_EVENTS.LEADERBOARD_UPDATED, onLeaderboardUpdated);
      socket.off(SOCKET_EVENTS.CLAIM_FAILED, onClaimFailed);

      socket.disconnect();
      singleton = null;
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userId, username, color]);
}
