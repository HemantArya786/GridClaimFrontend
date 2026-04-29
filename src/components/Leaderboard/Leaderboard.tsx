import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import { LEADERBOARD_LIMIT, TOTAL_TILES } from "@/constants/app.constants";
import { useTileStore } from "@/store/tileStore";
import { useUserStore } from "@/store/userStore";
import { LeaderboardSkeleton } from "@/components/Common/LoadingSkeleton";
import { EmptyState } from "@/components/Common/EmptyState";
import { cn } from "@/lib/utils";

export function Leaderboard() {
  const leaderboard = useTileStore((s) => s.leaderboard);
  const tiles = useTileStore((s) => s.tiles);
  const hydrated = useTileStore((s) => s.hydrated);
  const userId = useUserStore((s) => s.id);

  // Derive from tiles if backend hasn't sent leaderboard yet.
  const entries = useMemo(() => {
    if (leaderboard.length) return leaderboard.slice(0, LEADERBOARD_LIMIT);
    const counts = new Map<
      string,
      { userId: string; username: string; color: string; tiles: number }
    >();
    for (const t of Object.values(tiles)) {
      if (!t.ownerId) continue;
      const e = counts.get(t.ownerId);
      if (e) e.tiles++;
      else
        counts.set(t.ownerId, {
          userId: t.ownerId,
          username: t.ownerName ?? "Unknown",
          color: t.ownerColor ?? "#999",
          tiles: 1,
        });
    }
    return [...counts.values()]
      .sort((a, b) => b.tiles - a.tiles)
      .slice(0, LEADERBOARD_LIMIT);
  }, [leaderboard, tiles]);

  return (
    <section className="rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">Leaderboard</h2>
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          Top {Math.min(LEADERBOARD_LIMIT, entries.length || LEADERBOARD_LIMIT)}
        </span>
      </header>

      <div className="p-3">
        {!hydrated ? (
          <LeaderboardSkeleton />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No claims yet"
            description="Be the first to capture a tile."
          />
        ) : (
          <ol className="space-y-1.5">
            <AnimatePresence initial={false}>
              {entries.map((e, i) => {
                const isMe = e.userId === userId;
                const pct = (e.tiles / TOTAL_TILES) * 100;
                return (
                  <motion.li
                    key={e.userId}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg border bg-surface px-3 py-2 transition-colors",
                      isMe
                        ? "border-foreground/20 bg-surface-2"
                        : "border-transparent hover:bg-surface-2",
                    )}
                  >
                    {isMe && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-foreground" />
                    )}
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums",
                        i === 0 && "bg-amber-100 text-amber-900",
                        i === 1 && "bg-zinc-200 text-zinc-800",
                        i === 2 && "bg-orange-100 text-orange-900",
                        i > 2 && "bg-muted text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-black/5"
                      style={{ backgroundColor: e.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium">{e.username}</p>
                        {isMe && (
                          <span className="rounded bg-foreground px-1.5 py-px text-[9px] font-medium uppercase tracking-wide text-background">
                            You
                          </span>
                        )}
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            backgroundColor: e.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{e.tiles}</span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </section>
  );
}
