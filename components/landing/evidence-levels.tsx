"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import RubberSegment from "@/components/ui/rubber-segment";
import { VerifyBadge, VERIFY_STYLE } from "@/components/case/badges";
import type { Verification } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVELS: { key: string; kind: Verification; statement: string; how: string; source: string }[] = [
  {
    key: "Confirmed",
    kind: "DOCUMENT_CONFIRMED",
    statement: "The rejection notice states that a bank-related document requires correction.",
    how: "Shown as fact, and always with the document it comes from.",
    source: "Source: the notice you uploaded",
  },
  {
    key: "Your information",
    kind: "USER_REPORTED",
    statement: "You reported that the bank document was already submitted with the application.",
    how: "Kept as your account. The agent does not treat it as proven.",
    source: "Source: what you told the agent",
  },
  {
    key: "Possible issue",
    kind: "DOCUMENT_COMPARISON",
    statement: "The application says “Ramesh Kumar”. The bank document says “Ramesh K.”",
    how: "Found by a fixed comparison of two fields. It says the text differs, not why the application failed.",
    source: "Source: comparing two documents",
  },
  {
    key: "Unknown",
    kind: "UNKNOWN",
    statement: "The documents do not prove that the name difference was the official reason for rejection.",
    how: "Stated openly, so a guess never gets presented as a finding.",
    source: "Source: nothing yet",
  },
];

export function EvidenceLevels() {
  const [i, setI] = useState(0);
  const cur = LEVELS[i];
  const style = VERIFY_STYLE[cur.kind];
  return (
    <section id="evidence" aria-labelledby="evidence-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="min-w-0">
          <h2 id="evidence-title" className="t-h2 max-w-[16ch]">
            Every statement says how sure it is
          </h2>
          <p className="t-lead mt-4 max-w-md">
            The agent never says “this is why you were rejected” unless the official notice says so. Pick a level to see
            how it is shown.
          </p>
          <div className="mt-8 w-full max-w-full overflow-x-auto pb-1">
            <RubberSegment
              items={LEVELS.map((l) => l.key)}
              defaultValue="Confirmed"
              onChange={(_, idx) => setI(idx)}
              ariaLabel="Evidence level"
              trackColor="#0a1130"
              thumbColor="#f6b92b"
              textColor="#a9b3d9"
              activeTextColor="#0a1130"
              className="evidence-segment"
              size="md"
              radius={14}
              inset={4}
              equalSlots={false}
              stretch={100}
              squash={3}
              draggable
            />
          </div>
        </div>

        <div className="panel min-w-0 min-h-[15rem] p-6 sm:p-8" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={cur.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className={cn("border-l-4 pl-5", style.rule, cur.kind === "UNKNOWN" && "border-dashed")}
            >
              <VerifyBadge kind={cur.kind} />
              <p className="mt-4 font-display text-[1.45rem] font-semibold leading-snug sm:text-[1.7rem]">
                {cur.statement}
              </p>
              <p className="mt-4 text-fg-muted">{cur.how}</p>
              <p className="mt-2 text-sm text-fg-subtle">{cur.source}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
