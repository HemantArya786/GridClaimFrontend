import { useCallback, useState } from "react";
import { GRID_SIZE } from "@/constants/app.constants";
import { useTileStore } from "@/store/tileStore";
import { useClaimTile } from "@/hooks/useTiles";
import { GridSkeleton } from "@/components/Common/LoadingSkeleton";
import { tileKey } from "@/lib/utils";
import { Tile } from "./Tile";
import { TileTooltip } from "./TileTooltip";
import { CooldownBar } from "./CooldownBar";

const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
  x: i % GRID_SIZE,
  y: Math.floor(i / GRID_SIZE),
}));

export function GridBoard() {
  const hydrated = useTileStore((s) => s.hydrated);
  const tiles = useTileStore((s) => s.tiles);
  const claim = useClaimTile();
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const onHover = useCallback((x: number, y: number) => setHover({ x, y }), []);
  const onLeave = useCallback(() => setHover(null), []);
  const onClaim = useCallback((x: number, y: number) => claim(x, y), [claim]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-3 sm:p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">The board</h2>
          <p className="text-[11px] text-muted-foreground">
            {GRID_SIZE} × {GRID_SIZE} · click any tile to claim
          </p>
        </div>
        <TileTooltip
          hover={hover}
          tile={hover ? tiles[tileKey(hover.x, hover.y)] : undefined}
        />
      </div>

      {!hydrated ? (
        <GridSkeleton />
      ) : (
        <div
          role="grid"
          aria-rowcount={GRID_SIZE}
          aria-colcount={GRID_SIZE}
          onMouseLeave={onLeave}
          onBlur={onLeave}
          className="grid w-full gap-px overflow-hidden rounded-lg bg-border"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {cells.map((c) => (
            <Tile
              key={`${c.x}:${c.y}`}
              x={c.x}
              y={c.y}
              onClaim={onClaim}
              onHover={onHover}
            />
          ))}
        </div>
      )}

      <CooldownBar />
    </section>
  );
}
