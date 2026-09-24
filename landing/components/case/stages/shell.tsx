import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StageShell({
  title,
  lead,
  children,
  className,
}: {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby="stage-title" className={cn("space-y-7", className)}>
      <header>
        <h1 id="stage-title" tabIndex={-1} className="t-h2 !text-[clamp(1.7rem,3vw,2.4rem)] outline-none">
          {title}
        </h1>
        {lead && <p className="mt-3 max-w-2xl text-[1.05rem] text-fg-muted">{lead}</p>}
      </header>
      {children}
    </section>
  );
}
