import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Tile } from "@/types/tile.types";
import { relativeTime } from "@/lib/utils";

interface Props {
  hover: { x: number; y: number } | null;
  tile: Tile | undefined;
}

export function TileTooltip({ hover, tile }: Props) {
  return (
    <AnimatePresence>
      {hover && (
        <motion.div
          key="tt"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] shadow-sm"
        >
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium tabular-nums">
            {hover.x},{hover.y}
          </span>
          {tile?.ownerId ? (
            <>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tile.ownerColor ?? undefined }}
              />
              <span className="font-medium">{tile.ownerName}</span>
              {tile.claimedAt && (
                <span className="text-muted-foreground">
                  · {relativeTime(Number(tile.claimedAt))}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Unclaimed</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
