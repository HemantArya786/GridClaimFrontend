import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/types/user.types";

const COLORS: Record<ConnectionStatus, string> = {
  idle: "bg-muted-foreground",
  connecting: "bg-warning",
  connected: "bg-success",
  reconnecting: "bg-warning",
  disconnected: "bg-destructive",
};

const LABELS: Record<ConnectionStatus, string> = {
  idle: "Idle",
  connecting: "Connecting",
  connected: "Live",
  reconnecting: "Reconnecting",
  disconnected: "Offline",
};

export function ConnectionDot({
  status,
  showLabel = true,
}: {
  status: ConnectionStatus;
  showLabel?: boolean;
}) {
  const live = status === "connected";
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="relative flex h-2 w-2">
        {live && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", COLORS[status])} />
      </span>
      {showLabel && <span className="font-medium tabular-nums">{LABELS[status]}</span>}
    </div>
  );
}
