import { memo } from "react";
import { motion } from "framer-motion";
import { useTile } from "@/hooks/useTiles";
import { useTileStore } from "@/store/tileStore";
import { useUserStore } from "@/store/userStore";
import { cn, hexWithAlpha, readableOn, tileKey } from "@/lib/utils";

interface Props {
  x: number;
  y: number;
  onClaim: (x: number, y: number) => void;
  onHover: (x: number, y: number) => void;
}

function TileImpl({ x, y, onClaim, onHover }: Props) {
  const tile = useTile(x, y);
  const myColor = useUserStore((s) => s.color);
  const myId = useUserStore((s) => s.id);
  const pending = useTileStore((s) => s.pending.has(tileKey(x, y)));

  const owned = !!tile?.ownerId;
  const isMine = tile?.ownerId === myId;
  const ownerColor = tile?.ownerColor ?? null;

  const bg = owned
    ? ownerColor!
    : pending && myColor
    ? hexWithAlpha(myColor, 0.55)
    : undefined;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClaim(x, y);
    }
  };

  return (
    <motion.button
      type="button"
      role="gridcell"
      aria-label={
        owned
          ? `Tile ${x}, ${y}, owned by ${tile?.ownerName}`
          : `Tile ${x}, ${y}, unclaimed`
      }
      aria-disabled={owned}
      tabIndex={owned ? -1 : 0}
      onClick={() => !owned && onClaim(x, y)}
      onMouseEnter={() => onHover(x, y)}
      onFocus={() => onHover(x, y)}
      onKeyDown={handleKey}
      initial={false}
      animate={
        owned
          ? { scale: [0.85, 1.04, 1], opacity: 1 }
          : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        backgroundColor: bg,
        color: owned ? readableOn(ownerColor!) : undefined,
      }}
      className={cn(
        "group relative aspect-square w-full select-none outline-none transition-colors",
        "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        !owned && [
          "bg-[hsl(var(--tile-empty))]",
          "hover:bg-[hsl(var(--tile-empty-hover))]",
          "cursor-pointer",
        ],
        owned && "cursor-not-allowed",
        isMine && "ring-1 ring-inset ring-black/20",
        pending && "animate-pulse-ring",
      )}
    />
  );
}

export const Tile = memo(TileImpl, (a, b) => a.x === b.x && a.y === b.y);
