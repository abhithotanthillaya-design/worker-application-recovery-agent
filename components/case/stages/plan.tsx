"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Pause } from "lucide-react";
import { useCase } from "@/lib/case-store";
import { ACTION_LABEL } from "@/lib/labels";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { StageShell } from "./shell";
import { cn } from "@/lib/utils";

const ACTOR = { WORKER: "You", AGENT: "Agent", WORKER_AND_AGENT: "You and agent" } as const;

export function PlanStage({ onNext }: { onNext: () => void }) {
  const { file } = useCase();
  const plan = file?.plan;
  if (!plan) return null;
  return (
    <StageShell title="Your recovery plan" lead={plan.summary}>
      <ol className="space-y-3">
        {plan.steps.map((s) => (
          <li key={s.step} className="panel-flat flex items-start gap-4 p-4 sm:p-5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 font-bold tabular">{s.step}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{ACTION_LABEL[s.action]}</p>
              <p className="mt-0.5 text-[0.98rem] text-fg-muted">{s.description}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
                s.actor === "WORKER" ? "border-turmeric/50 text-turmeric" : "border-white/25 text-fg-muted",
              )}
            >
              {ACTOR[s.actor]}
            </span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" className="btn btn-primary min-h-12 px-6" onClick={onNext}>
          Review and approve <ArrowRight size={18} aria-hidden />
        </button>
        <p className="text-sm text-fg-muted">
          {plan.steps.length} steps. Action required: <strong className="text-fg">your approval</strong>.
        </p>
      </div>
    </StageShell>
  );
}

export function ApprovalStage({ onBack }: { onBack: () => void }) {
  const { file, approve, busy } = useCase();
  const [name, setName] = useState<string | null>(null);
  const plan = file?.plan;
  if (!file || !plan) return null;
  const busyNow = busy === "approve";
  const options = [
    { id: "kumar", label: "Ramesh Kumar", hint: "As on the application and the identity document" },
    { id: "k", label: "Ramesh K.", hint: "As on the bank document" },
    { id: "other", label: "Something else", hint: "I will confirm the correct name with the bank first" },
  ];

  return (
    <StageShell title="Approve the recovery plan" lead="Review exactly what the agent will do. You can go back or decline at any point.">
      <div className="relative rounded-[calc(var(--radius-panel)+4px)] border p-1.5">
        <GlowingEffect spread={44} glow proximity={80} inactiveZone={0.05} disabled={false} borderWidth={2} />
        <div className="relative rounded-[var(--radius-panel)] bg-ink-850 p-5 sm:p-7">
          <h2 className="t-h3">The agent proposes to</h2>
          <ul className="mt-4 space-y-2.5">
            {[
              "Prepare a corrected-document checklist",
              "Prepare the resubmission information from your confirmed name",
              "Submit through the simulated recovery workflow",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <Check size={18} className="mt-1 shrink-0 text-success" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <fieldset className="mt-7 border-t pt-6">
            <legend className="font-semibold">Before that: which name is correct?</legend>
            <p className="mt-1 text-sm text-fg-muted">The agent needs your answer. It will not guess.</p>
            <div className="mt-4 grid gap-2.5">
              {options.map((o) => (
                <label
                  key={o.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors hover:bg-white/[0.05]",
                    name === o.id && "border-turmeric bg-turmeric/10",
                  )}
                >
                  <input
                    type="radio"
                    name="correct-name"
                    checked={name === o.id}
                    onChange={() => setName(o.id)}
                    className="mt-1 h-4 w-4 accent-[#f6b92b]"
                  />
                  <span>
                    <span className="block font-semibold">{o.label}</span>
                    <span className="block text-sm text-fg-muted">{o.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {name === "k" && (
              <p role="status" className="mt-3 rounded-lg border border-warn/40 bg-warn/10 p-3 text-sm">
                The application and the identity document both say “Ramesh Kumar”. Confirm with your bank branch before
                using the shorter form.
              </p>
            )}
          </fieldset>

          <p className="mt-6 font-semibold text-turmeric">Nothing will be submitted without your approval.</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-primary min-h-12 px-6"
              disabled={!name || busyNow}
              onClick={() => approve(true)}
            >
              {busyNow && <Loader2 size={18} className="animate-spin" aria-hidden />}
              {busyNow ? "Submitting to simulation" : "Approve recovery plan"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onBack} disabled={busyNow}>
              <ArrowLeft size={16} aria-hidden /> Go back
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => approve(false)} disabled={busyNow}>
              Decline and pause
            </button>
          </div>
        </div>
      </div>
    </StageShell>
  );
}

export function PausedStage() {
  const { createPlan, busy } = useCase();
  return (
    <StageShell title="The case is paused" lead="You did not approve the plan, so nothing was submitted. Nothing changes until you decide.">
      <div className="panel-flat flex flex-wrap items-center gap-4 p-5">
        <Pause size={22} className="text-fg-muted" aria-hidden />
        <p className="min-w-0 flex-1 basis-56 text-fg-muted">The plan is still available if you want to look at it again.</p>
        <button type="button" className="btn btn-primary" onClick={() => createPlan()} disabled={busy === "plan"}>
          {busy === "plan" && <Loader2 size={16} className="animate-spin" aria-hidden />}
          Review the plan again
        </button>
      </div>
    </StageShell>
  );
}
