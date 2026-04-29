import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/constants/app.constants";
import { createMockSocket } from "./mockSocket";

/**
 * Minimal socket-like interface so the rest of the app doesn't care whether
 * it's a real Socket.IO connection or the in-memory mock.
 */
export interface SocketLike {
  readonly id: string;
  connected: boolean;
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  connect: () => void;
  disconnect: () => void;
}

interface CreateOptions {
  auth?: Record<string, unknown>;
  /** ms to wait for real backend before falling back to mock. */
  fallbackTimeoutMs?: number;
  onFallback?: () => void;
}

/**
 * Try the configured backend URL first; if no URL is configured, or the
 * connection doesn't open within `fallbackTimeoutMs`, return the mock so
 * the UI is fully alive for demos without a server.
 */
export function createSocket(opts: CreateOptions = {}): SocketLike {
  const { auth, fallbackTimeoutMs = 1500, onFallback } = opts;

  if (!SOCKET_URL) {
    return createMockSocket(auth);
  }

  const real = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    transports: ["websocket"],
    auth,
  });

  let switched = false;
  const fallback = createMockSocket(auth);

  const wrap: SocketLike = {
    get id() {
      return switched ? fallback.id : real.id ?? "pending";
    },
    get connected() {
      return switched ? fallback.connected : real.connected;
    },
    set connected(_v: boolean) {
      /* read-only proxy */
    },
    emit: (e, ...a) => (switched ? fallback.emit(e, ...a) : real.emit(e, ...a)),
    on: (e, h) => (switched ? fallback.on(e, h) : real.on(e, h)),
    off: (e, h) => (switched ? fallback.off(e, h) : real.off(e, h)),
    connect: () => (switched ? fallback.connect() : real.connect()),
    disconnect: () => (switched ? fallback.disconnect() : real.disconnect()),
  };

  const switchToMock = () => {
    if (switched) return;
    switched = true;
    try {
      real.disconnect();
    } catch {
      /* noop */
    }
    onFallback?.();
    fallback.connect();
  };

  const timer = setTimeout(() => {
    if (!real.connected) switchToMock();
  }, fallbackTimeoutMs);

  real.on("connect_error", () => {
    if (!real.connected) switchToMock();
  });
  real.on("connect", () => clearTimeout(timer));

  return wrap;
}

export type { Socket };
