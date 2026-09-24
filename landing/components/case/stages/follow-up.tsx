"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCase } from "@/lib/case-store";
import { SimBadge } from "../badges";

export function FollowUpDraft() {
  const { file } = useCase();
  const [copied, setCopied] = useState(false);
  if (!file?.followUp) return null;
  return (
    <section aria-labelledby="fu-h" className="panel-flat p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="fu-h" className="font-display text-lg font-semibold">
          Follow-up draft
        </h2>
        <SimBadge>Drafted, not sent</SimBadge>
      </div>
      <pre className="paper mt-4 whitespace-pre-wrap p-4 font-sans text-[0.92rem] leading-relaxed">{file.followUp.message}</pre>
      <button
        type="button"
        className="btn btn-ghost mt-3 min-h-10"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(file.followUp!.message);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard unavailable */
          }
        }}
      >
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        {copied ? "Copied" : "Copy draft"}
      </button>
    </section>
  );
}
