import { GRID_SIZE } from "@/constants/app.constants";
import { cn } from "@/lib/utils";

export function GridSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid w-full gap-px rounded-xl bg-border p-px",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
        <div key={i} className="aspect-square grid-shimmer" />
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
        >
          <div className="h-6 w-6 grid-shimmer rounded-md" />
          <div className="h-3 w-3 grid-shimmer rounded-full" />
          <div className="h-3 flex-1 grid-shimmer rounded-md" />
          <div className="h-3 w-8 grid-shimmer rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-4 space-y-2"
        >
          <div className="h-3 w-16 grid-shimmer rounded-md" />
          <div className="h-6 w-12 grid-shimmer rounded-md" />
        </div>
      ))}
    </div>
  );
}
