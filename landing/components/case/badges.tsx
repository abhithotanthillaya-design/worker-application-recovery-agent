import { CheckCircle2, CircleHelp, FlaskConical, Search, Sparkles, UserRound } from "lucide-react";
import type { Verification } from "@/lib/types";
import { VERIFICATION_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

/** Each evidence level has its own colour AND icon AND line style, so colour is never the only signal. */
export const VERIFY_STYLE: Record<
  Verification,
  { text: string; bg: string; border: string; rule: string; Icon: typeof CheckCircle2 }
> = {
  DOCUMENT_CONFIRMED: { text: "text-success", bg: "bg-success/12", border: "border-success/40", rule: "border-l-success", Icon: CheckCircle2 },
  USER_REPORTED: { text: "text-info", bg: "bg-info/12", border: "border-info/40", rule: "border-l-info", Icon: UserRound },
  DOCUMENT_COMPARISON: { text: "text-warn", bg: "bg-warn/12", border: "border-warn/45", rule: "border-l-warn", Icon: Search },
  AI_INFERENCE: { text: "text-infer", bg: "bg-infer/12", border: "border-infer/40", rule: "border-l-infer", Icon: Sparkles },
  UNKNOWN: { text: "text-fg-muted", bg: "bg-white/5", border: "border-dashed border-white/30", rule: "border-l-white/30", Icon: CircleHelp },
};

export function VerifyBadge({ kind, className, label }: { kind: Verification; className?: string; label?: string }) {
  const s = VERIFY_STYLE[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.78rem] font-semibold leading-none",
        s.text,
        s.bg,
        s.border,
        className,
      )}
    >
      <s.Icon size={13} aria-hidden />
      {label ?? VERIFICATION_LABEL[kind]}
    </span>
  );
}

export function SimBadge({ children = "Simulated", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-turmeric/50 bg-turmeric/12 px-2 py-1 text-[0.75rem] font-bold leading-none text-turmeric",
        className,
      )}
    >
      <FlaskConical size={12} aria-hidden />
      {children}
    </span>
  );
}
