import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, History } from "lucide-react";
import { useTileStore } from "../../store/tileStore";
import { EmptyState } from "../../components/Common/EmptyState";
import { relativeTime } from "../../lib/utils";

export function ActivityFeed() {
  const activity = useTileStore((s) => s.activity);
  const [, setTick] = useState(0);

  // Refresh relative timestamps every 10s without re-rendering parents.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="text-sm font-semibold tracking-tight">Live activity</h2>
        </div>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {activity.length}
        </span>
      </header>

      <div className="p-3">
        {activity.length === 0 ? (
          <EmptyState
            icon={History}
            title="Quiet on the board"
            description="Claims will stream here in real time."
          />
        ) : (
          <ul className="scrollbar-thin max-h-[280px] space-y-1 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {activity.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-surface-2"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full ring-1 ring-inset ring-black/5"
                    style={{ backgroundColor: e.color }}
                  />
                  <p className="min-w-0 flex-1 truncate text-xs">
                    <span className="font-medium">{e.username}</span>
                    <span className="text-muted-foreground"> claimed </span>
                    <span className="font-medium tabular-nums">
                      ({e.x},{e.y})
                    </span>
                  </p>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {relativeTime(e.at)}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  );
}
