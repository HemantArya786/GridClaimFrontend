export interface Tile {
  x: number;
  y: number;
  ownerId: string | null;
  ownerName: string | null;
  ownerColor: string | null;
  claimedAt: number | null;
}

export interface ClaimPayload {
  tileId: string;
  userId: string;
}

export interface ClaimFailedPayload {
  tileId: string;
  reason: string;
  // backend sometimes adds x/y if it's convenient, but schema says tileId
  x?: number;
  y?: number;
}

export interface ActivityEvent {
  id: string;
  x: number;
  y: number;
  username: string;
  color: string;
  at: number;
}
