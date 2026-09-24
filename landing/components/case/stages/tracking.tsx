"use client";

import { useState } from "react";
import { Check, Clock, Loader2 } from "lucide-react";
import { useCase } from "@/lib/case-store";
import { SCENARIO_LABEL, SCENARIO_ORDER } from "@/lib/labels";
import RubberSegment from "@/components/ui/rubber-segment";
import type { SimulationScenario } from "@/lib/types";
import { SimBadge } from "../badges";
import { StageShell } from "./shell";
import { cn } from "@/lib/utils";
import { FollowUpDraft } from "./follow-up";

const STEPS = ["Application submitted", "Issue detected", "Correction prepared", "Correction submitted", "Under review", "Resolution"];

export function TrackingStage() {
  const { file, simulate, busy, prepareFollowUp } = useCase();
  const [scenario, setScenario] = useState<SimulationScenario>("SECOND_REJECTION");
  if (!file) return null;
  const delayed = file.latestResponse?.scenario === "DELAY";
  const running = busy === "simulate";

  return (
    <StageShell title="Your correction is under review" lead="The agent is watching for the response and will compare it with what happened before.">
      <div className="panel p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-fg-muted">Reference</p>
            <p className="font-mono text-lg font-medium">{file.submission?.referenceId}</p>
          </div>
          <SimBadge>Simulated status</SimBadge>
        </div>
        <ol className="mt-6 space-y-3.5">
          {STEPS.map((s, i) => {
            const done = i <= 4;
            return (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full border-2",
                    done ? "border-success bg-success text-ink-950" : "border-white/30 text-fg-subtle",
                  )}
                >
                  {done ? <Check size={13} strokeWidth={3} aria-hidden /> : <Clock size={12} aria-hidden />}
                </span>
                <span className={done ? "text-fg" : "text-fg-subtle"}>
                  {s}
                  <span className="sr-only">{done ? " (done)" : " (pending)"}</span>
                </span>
              </li>
            );
          })}
        </ol>
        {delayed && (
          <div role="status" className="mt-6 rounded-xl border border-warn/40 bg-warn/10 p-4">
            <p className="font-semibold">The review is running late</p>
            <p className="mt-1 text-[0.95rem] text-fg-muted">{file.latestResponse?.text}</p>
            {!file.followUp && (
              <button type="button" className="btn btn-ghost mt-3" onClick={() => prepareFollowUp()} disabled={busy === "followup"}>
                {busy === "followup" && <Loader2 size={16} className="animate-spin" aria-hidden />}
                Prepare a follow-up
              </button>
            )}
          </div>
        )}
      </div>

      {file.followUp && <FollowUpDraft />}

      <section aria-labelledby="demo-ctl" className="rounded-[var(--radius-panel)] border border-dashed border-turmeric/50 bg-turmeric/[0.05] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="demo-ctl" className="font-display text-lg font-semibold">
            Demo control
          </h2>
          <SimBadge>Not part of the real product</SimBadge>
        </div>
        <p className="mt-1.5 text-sm text-fg-muted">
          A real integration would receive the authority&apos;s answer. Choose what the simulated authority sends back.
        </p>
        <div className="mt-4 flex max-w-full flex-wrap items-center gap-3">
          <div className="max-w-full overflow-x-auto">
            <RubberSegment
              items={SCENARIO_ORDER}
              labels={SCENARIO_LABEL}
              value={scenario}
              onChange={(v) => setScenario(v as SimulationScenario)}
              ariaLabel="Simulated authority response"
              trackColor="#0a1130"
              thumbColor="#f6b92b"
              textColor="#a9b3d9"
              activeTextColor="#0a1130"
              size="md"
              radius={14}
              inset={4}
              equalSlots
              draggable
              disabled={running}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => simulate(scenario)} disabled={running}>
            {running && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Simulate response
          </button>
        </div>
      </section>
    </StageShell>
  );
}
