import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PLAYER_COLORS } from "@/constants/app.constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tileKey(x: number, y: number): string {
  return `${x}_${y}`;
}

export function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function pickRandomColor(exclude?: string): string {
  const pool = exclude ? PLAYER_COLORS.filter((c) => c !== exclude) : PLAYER_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function relativeTime(from: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - from);
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

/** Light text for dark colors and vice versa. Returns '#fff' or '#0b0b0c'. */
export function readableOn(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0b0b0c" : "#ffffff";
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}
