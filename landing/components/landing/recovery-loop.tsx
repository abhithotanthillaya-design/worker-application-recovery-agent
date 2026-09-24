"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText } from "lucide-react";
import { registerGsap, prefersReducedMotion } from "@/lib/gsap";
import { SimBadge, VerifyBadge } from "@/components/case/badges";
import { cn } from "@/lib/utils";

const STEPS: { title: string; body: string; panel: ReactNode }[] = [
  {
    title: "Rebuild the case",
    body: "You upload the application, the notice and your supporting papers. The agent reads them into one case file.",
    panel: (
      <ul className="space-y-2.5">
        {["Application", "Bank document", "Identity document", "Rejection notice"].map((d) => (
          <li key={d} className="flex items-center gap-3 rounded-lg border bg-white/[0.04] px-4 py-3">
            <FileText size={18} className="text-fg-muted" aria-hidden />
            <span className="flex-1">{d}</span>
            <Check size={16} className="text-success" aria-label="read" />
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Compare across documents",
    body: "A fixed rule, not a model's opinion, checks whether the same field says the same thing everywhere.",
    panel: (
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Application", "Ramesh Kumar"],
          ["Bank document", "Ramesh K."],
        ].map(([k, v], i) => (
          <div key={k} className="paper p-4">
            <p className="text-xs text-paper-muted">{k}</p>
            <p className={cn("mt-1 font-display text-xl font-semibold", i === 1 && "mark-mismatch")}>{v}</p>
          </div>
        ))}
        <p className="col-span-2 text-sm text-fg-muted">Different text in the name field. Flagged for you to verify.</p>
      </div>
    ),
  },
  {
    title: "Separate fact from guess",
    body: "Every statement is labeled. An AI inference never appears as an official decision.",
    panel: (
      <div className="space-y-2.5 text-sm">
        {(
          [
            ["DOCUMENT_CONFIRMED", "The notice says a bank document needs correction."],
            ["DOCUMENT_COMPARISON", "The names differ between two documents."],
            ["AI_INFERENCE", "The mismatch may have played a part."],
            ["UNKNOWN", "Whether it was the official reason."],
          ] as const
        ).map(([k, t]) => (
          <div key={k} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <VerifyBadge kind={k} />
            <span className="text-fg-muted">{t}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Plan the next step",
    body: "A short recovery plan says who does what: you, the agent, or both.",
    panel: (
      <ol className="space-y-2 text-sm">
        {[
          ["Verify the correct name", "You"],
          ["Get the corrected bank document", "You and agent"],
          ["Prepare the correction", "Agent"],
          ["Submit the correction", "Agent"],
          ["Watch the response", "Agent"],
        ].map(([t, who], i) => (
          <li key={t} className="flex items-center gap-3 rounded-lg border bg-white/[0.04] px-3.5 py-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs font-bold tabular">{i + 1}</span>
            <span className="flex-1">{t}</span>
            <span className="text-fg-subtle">{who}</span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    title: "Wait for your approval",
    body: "Anything with consequences stops at a gate. Say no and the case simply pauses.",
    panel: (
      <div className="rounded-xl border border-turmeric/40 bg-turmeric/8 p-5">
        <p className="font-display text-lg font-semibold">The agent proposes</p>
        <ul className="mt-3 space-y-1.5 text-sm text-fg-muted">
          <li>✓ Prepare a corrected-document checklist</li>
          <li>✓ Prepare the resubmission details</li>
          <li>✓ Submit through the simulated workflow</li>
        </ul>
        <p className="mt-4 text-sm font-semibold text-turmeric">Nothing will be submitted without your approval.</p>
      </div>
    ),
  },
  {
    title: "Track and read the response",
    body: "When the next answer arrives, the agent compares it with the earlier attempts instead of starting over.",
    panel: (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-sm">MOCK-BOCW-78241</span>
          <SimBadge>Simulated status</SimBadge>
        </div>
        <ol className="space-y-3 border-l border-white/20 pl-5 text-sm">
          {["Issue detected", "Correction submitted", "Under review", "Second response: still returned"].map((t, i, a) => (
            <li key={t} className="relative">
              <span
                className={cn(
                  "absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full",
                  i === a.length - 1 ? "bg-kumkum" : "bg-success",
                )}
              />
              {t}
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    title: "Verify, or hand over to a person",
    body: "If the same problem comes back, the agent stops retrying and prepares a packet for a human.",
    panel: (
      <ul className="space-y-2 text-sm">
        {["Case history", "Application information", "Previous responses", "Relevant documents", "Actions attempted", "Remaining issue"].map((t) => (
          <li key={t} className="flex items-center gap-3 rounded-lg border bg-white/[0.04] px-4 py-2.5">
            <Check size={16} className="text-success" aria-hidden />
            {t}
          </li>
        ))}
      </ul>
    ),
  },
];

export function RecoveryLoop() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: `+=${STEPS.length * 65}%`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          setActive(Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length)));
          if (barRef.current) barRef.current.style.transform = `scaleY(${self.progress})`;
        },
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="loop" aria-labelledby="loop-title" className="relative border-y bg-ink-950/60">
      <div className="mx-auto grid min-h-svh max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-0">
        <div>
          <h2 id="loop-title" className="t-h2 max-w-[18ch]">
            A recovery loop, not a single answer
          </h2>
          <p className="t-lead mt-4 max-w-xl">
            The case keeps its state. Each response feeds the next decision.
          </p>
          <div className="relative mt-10 pl-8">
            <div aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-white/15">
              <div ref={barRef} className="h-full origin-top scale-y-0 bg-turmeric" />
            </div>
            <ol className="space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative" aria-current={i === active ? "step" : undefined}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -left-8 top-1.5 h-[15px] w-[15px] rounded-full border-2 transition-colors duration-300",
                      i <= active ? "border-turmeric bg-turmeric" : "border-white/30 bg-ink-900",
                    )}
                  />
                  <h3
                    className={cn(
                      "t-h3 transition-colors duration-300 lg:text-[1.35rem]",
                      i === active ? "text-fg" : "text-fg-muted lg:text-fg-subtle",
                    )}
                  >
                    {s.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 max-w-md text-fg-muted transition-all duration-300 lg:overflow-hidden",
                      i === active ? "lg:max-h-24 lg:opacity-100" : "lg:max-h-0 lg:opacity-0",
                    )}
                  >
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="panel hidden min-h-[26rem] p-7 lg:block" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
              {STEPS[active].panel}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
