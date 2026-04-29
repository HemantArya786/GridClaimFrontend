import { Grid3x3 } from "lucide-react";
import { APP_NAME } from "@/constants/app.constants";
import { ConnectionDot } from "@/components/Common/ConnectionDot";
import { useTileStore } from "@/store/tileStore";
import { useUserStore } from "@/store/userStore";
import { initials, readableOn } from "@/lib/utils";

export function AppHeader() {
  const connection = useTileStore((s) => s.connection);
  const usingMock = useTileStore((s) => s.usingMock);
  const username = useUserStore((s) => s.username);
  const color = useUserStore((s) => s.color);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Grid3x3 className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">{APP_NAME}</h1>
            <p className="text-[11px] text-muted-foreground">Capture board</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {usingMock && (
            <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Demo
            </span>
          )}
          <ConnectionDot status={connection} />
          {username && color && (
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: color, color: readableOn(color) }}
              >
                {initials(username)}
              </span>
              <span className="text-xs font-medium">{username}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
