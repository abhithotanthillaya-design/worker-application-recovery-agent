import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const RAIL = ["Documents", "Analysis", "Understanding", "Blocker", "Plan", "Approval", "Tracking", "Outcome"] as const;

export function StageRail({ current, warn }: { current: number; warn?: boolean }) {
  return (
    <nav aria-label="Recovery progress">
      <ol className="space-y-1">
        {RAIL.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} aria-current={active ? "step" : undefined} className="relative flex items-center gap-3 py-1.5">
              {i < RAIL.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("absolute left-[11px] top-8 h-[calc(100%-6px)] w-px", done ? "bg-turmeric/70" : "bg-white/15")}
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[0.7rem] font-bold transition-colors",
                  done && "border-turmeric bg-turmeric text-ink-950",
                  active && !warn && "border-turmeric bg-ink-900 text-turmeric",
                  active && warn && "border-kumkum bg-ink-900 text-kumkum",
                  !done && !active && "border-white/25 bg-ink-900 text-fg-subtle",
                )}
              >
                {done ? <Check size={13} strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[0.95rem]",
                  active ? "font-semibold text-fg" : done ? "text-fg-muted" : "text-fg-subtle",
                )}
              >
                {label}
                <span className="sr-only">{done ? " (done)" : active ? " (current)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
