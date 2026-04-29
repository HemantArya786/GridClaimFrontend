import { API_URL, SOCKET_EVENTS } from "@/constants/app.constants";
import type { ClaimPayload, Tile } from "@/types/tile.types";
import type { SocketLike } from "./socket";
import type { User } from "@/types/user.types";

export const Api = {
  // ── REST API ───────────────────────────────────────────────────────────────

  async fetchGrid(): Promise<Tile[]> {
    const res = await fetch(`${API_URL}/api/tiles`);
    if (!res.ok) throw new Error("Failed to fetch grid");
    const json = await res.json();
    return json.data.tiles; // Backend wraps in { success: true, data: { tiles: [...] } }
  },

  async createUser(username: string, color: string): Promise<User> {
    const res = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, color }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create user");
    }
    const json = await res.json();
    const { user } = json.data;
    
    return {
      id: user.userId || user.id || user._id, // Handle various naming conventions
      username: user.username,
      color: user.color,
    };
  },

  // ── Socket Events (Convenience) ────────────────────────────────────────────

  getGrid(socket: SocketLike) {
    socket.emit(SOCKET_EVENTS.GET_GRID);
  },

  claimTile(socket: SocketLike, payload: ClaimPayload) {
    socket.emit(SOCKET_EVENTS.CLAIM_TILE, payload);
  },
};
