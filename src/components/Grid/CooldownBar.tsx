import { useEffect, useState } from "react";
import { COOLDOWN_MS } from "@/constants/app.constants";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

export function CooldownBar() {
  const nextClaimAt = useUserStore((s) => s.nextClaimAt);
  const [, force] = useState(0);

  useEffect(() => {
    const remaining = nextClaimAt - Date.now();
    if (remaining <= 0) return;
    let raf = 0;
    const tick = () => {
      force((n) => n + 1);
      if (Date.now() < nextClaimAt) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [nextClaimAt]);

  const remaining = Math.max(0, nextClaimAt - Date.now());
  const pct = (remaining / COOLDOWN_MS) * 100;
  const active = remaining > 0;

  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full bg-foreground transition-[width] duration-75 ease-linear",
            !active && "opacity-0",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
        {active ? `${(remaining / 1000).toFixed(1)}s cooldown` : "Ready"}
      </span>
    </div>
  );
}
