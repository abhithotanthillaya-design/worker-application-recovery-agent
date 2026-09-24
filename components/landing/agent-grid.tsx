"use client";

import { FileSearch, FolderClock, HandHelping, Repeat2, ShieldCheck } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function AgentGrid() {
  return (
    <section aria-labelledby="agent-title" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-32">
      <h2 id="agent-title" className="t-h2 max-w-[20ch]">
        Why this needs an agent, not a search box
      </h2>
      <p className="t-lead mt-4 max-w-2xl">
        A chatbot can list required documents. Recovering a case means remembering what happened, checking it, acting
        with permission and knowing when to stop.
      </p>
      <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-3 xl:max-h-[34rem] xl:grid-rows-2">
        <GridItem
          area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
          icon={<FolderClock className="h-4 w-4" />}
          title="It keeps the case"
          description="Documents, responses and attempts are stored as one case, so the second answer is read against the first."
        />
        <GridItem
          area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
          icon={<FileSearch className="h-4 w-4" />}
          title="It checks documents against each other"
          description="Names, numbers and dates are compared by fixed rules. The model explains the result; it does not decide it."
        />
        <GridItem
          area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
          icon={<ShieldCheck className="h-4 w-4" />}
          title="It asks before it acts"
          description="Submitting anything is a separate step that needs your yes. If you decline, the case pauses and nothing is sent."
        />
        <GridItem
          area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
          icon={<Repeat2 className="h-4 w-4" />}
          title="It notices repeat failures"
          description="A second return is treated as new evidence, not as a reason to retry the same thing."
        />
        <GridItem
          area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
          icon={<HandHelping className="h-4 w-4" />}
          title="It hands over cleanly"
          description="When a person has to step in, the agent prepares the full case summary for them."
        />
      </ul>
    </section>
  );
}

function GridItem({
  area,
  icon,
  title,
  description,
}: {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <li className={`min-h-[13rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border border-white/8 bg-ink-850/60 p-6">
          <div className="w-fit rounded-lg border border-white/25 p-2 text-fg-muted">{icon}</div>
          <div className="space-y-2.5">
            <h3 className="font-display text-xl font-semibold text-balance md:text-2xl">{title}</h3>
            <p className="text-[0.95rem] text-fg-muted md:text-base">{description}</p>
          </div>
        </div>
      </div>
    </li>
  );
}
