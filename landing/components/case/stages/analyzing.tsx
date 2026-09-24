"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useCase } from "@/lib/case-store";
import { DocumentPaper } from "../document-paper";
import { StageShell } from "./shell";
import { cn } from "@/lib/utils";

const LINES = [
  "Understanding your case",
  "Comparing documents",
  "Checking requirements",
  "Identifying possible blockers",
  "Preparing recovery options",
];

export function AnalyzingStage() {
  const { file } = useCase();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!file) return;
    const start = new Date(file.case.updatedAt).getTime();
    const t = window.setInterval(() => setElapsed(Date.now() - start), 250);
    return () => window.clearInterval(t);
  }, [file]);

  if (!file) return null;
  const idx = Math.min(LINES.length - 1, Math.floor(elapsed / 1100));
  const app = file.documents.find((d) => d.documentType === "APPLICATION");
  const bank = file.documents.find((d) => d.documentType === "BANK");

  return (
    <StageShell title="Reading your documents" lead="This usually takes a few seconds. Nothing is sent anywhere.">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
        <ol className="space-y-3.5" aria-live="polite">
          {LINES.map((l, i) => (
            <li
              key={l}
              className={cn(
                "flex items-center gap-3 text-[1.05rem] transition-colors",
                i < idx ? "text-fg-muted" : i === idx ? "text-fg" : "text-fg-subtle/60",
              )}
            >
              <span className="grid h-6 w-6 place-items-center">
                {i < idx ? (
                  <Check size={18} className="text-success" aria-label="done" />
                ) : i === idx ? (
                  <Loader2 size={18} className="animate-spin text-turmeric" aria-label="in progress" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white/25" />
                )}
              </span>
              {l}…
            </li>
          ))}
        </ol>

        <div className="relative" aria-hidden="true">
          <div className="grid gap-4 sm:grid-cols-2">
            {app && <DocumentPaper doc={{ ...app, fields: app.fields.slice(0, 3) }} compact />}
            {bank && <DocumentPaper doc={{ ...bank, fields: bank.fields.slice(0, 3) }} compact className="sm:mt-8" />}
          </div>
          <div className="scanline pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-turmeric/25 to-transparent" />
        </div>
      </div>
    </StageShell>
  );
}
