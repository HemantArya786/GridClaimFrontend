import { useEffect, useMemo, useState } from "react";
import { Shuffle, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PLAYER_COLORS } from "@/constants/app.constants";
import { useUserStore } from "@/store/userStore";
import { cn, pickRandomColor, readableOn } from "@/lib/utils";

const SUGGESTIONS = ["Nova", "Atlas", "Echo", "Vega", "Lyra", "Onyx", "Mira", "Orin"];

export function UsernameModal() {
  const { id, username, login } = useUserStore();
  const open = !id || !username;

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(() => pickRandomColor());
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const placeholder = useMemo(
    () => SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)],
    [],
  );

  useEffect(() => {
    if (!open) return;
    setName("");
  }, [open]);

  const valid = name.trim().length >= 2 && name.trim().length <= 16;

  const submit = async () => {
    if (!valid || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await login(name, color);
    } catch (err: any) {
      // toast.error("Connection failed", { description: err.message });
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md border-border bg-surface"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Sparkles className="h-4 w-4" />
          </div>
          <DialogTitle className="text-xl tracking-tight">Choose your handle</DialogTitle>
          <DialogDescription>
            Claim a name and color. You'll appear on the board for everyone connected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Username</label>
            <Input
              autoFocus
              maxLength={16}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={placeholder}
              className="h-11"
            />
            <p className="text-[11px] text-muted-foreground">2 – 16 characters</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Player color</label>
              <button
                type="button"
                onClick={() => setColor(pickRandomColor(color))}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shuffle className="h-3 w-3" />
                Shuffle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PLAYER_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Pick color ${c}`}
                  className={cn(
                    "h-8 w-8 rounded-md ring-offset-2 ring-offset-surface transition-all",
                    color === c
                      ? "ring-2 ring-foreground scale-110"
                      : "hover:scale-105",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold"
                style={{ backgroundColor: color, color: readableOn(color) }}
              >
                {(name.trim()[0] ?? placeholder[0]).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{name.trim() || placeholder}</p>
                <p className="text-xs text-muted-foreground">Ready to claim</p>
              </div>
            </div>
          </div>

          <Button
            onClick={submit}
            disabled={!valid || isLoggingIn}
            className="h-11 w-full text-sm font-medium"
          >
            {isLoggingIn ? "Connecting..." : "Enter board"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
