import { useMemo } from "react";
import { motion } from "framer-motion";
import { TOTAL_TILES } from "@/constants/app.constants";
import { useTileStore } from "@/store/tileStore";
import { useUserStore } from "@/store/userStore";
import { StatSkeleton } from "@/components/Common/LoadingSkeleton";

export function StatsBar() {
  const tiles = useTileStore((s) => s.tiles);
  const hydrated = useTileStore((s) => s.hydrated);
  const userId = useUserStore((s) => s.id);

  const { claimed, mine, rank } = useMemo(() => {
    let claimed = 0;
    let mine = 0;
    const counts: Record<string, number> = {};
    for (const t of Object.values(tiles)) {
      if (t.ownerId) {
        claimed++;
        counts[t.ownerId] = (counts[t.ownerId] ?? 0) + 1;
        if (t.ownerId === userId) mine++;
      }
    }
    let rank: number | null = null;
    if (userId && counts[userId]) {
      const sorted = Object.values(counts).sort((a, b) => b - a);
      rank = sorted.indexOf(counts[userId]) + 1;
    }
    return { claimed, mine, rank };
  }, [tiles, userId]);

  if (!hydrated) return <StatSkeleton />;

  const remaining = TOTAL_TILES - claimed;
  const pct = ((claimed / TOTAL_TILES) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card label="Claimed" value={claimed} sub={`${pct}%`} />
      <Card label="Remaining" value={remaining} sub={`of ${TOTAL_TILES}`} />
      <Card
        label="Your tiles"
        value={mine}
        sub={rank ? `Rank #${rank}` : "Unranked"}
        accent
      />
    </div>
  );
}

function Card({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      layout
      className="rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      <p className={`mt-0.5 text-[11px] tabular-nums ${accent ? "text-foreground" : "text-muted-foreground"}`}>
        {sub}
      </p>
    </motion.div>
  );
}
