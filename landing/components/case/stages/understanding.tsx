"use client";

import { ArrowRight } from "lucide-react";
import { useCase } from "@/lib/case-store";
import { AnalysisBands } from "../analysis-bands";
import { StageShell } from "./shell";

export function UnderstandingStage({ onNext }: { onNext: () => void }) {
  const { file } = useCase();
  if (!file?.analysis) return null;
  return (
    <StageShell
      title="Here is what the agent understands"
      lead="Four kinds of statements, kept apart on purpose. Only the first kind comes straight from an official document."
    >
      <AnalysisBands analysis={file.analysis} />
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="btn btn-primary min-h-12 px-6" onClick={onNext}>
          See the possible blocker <ArrowRight size={18} aria-hidden />
        </button>
        <p className="text-sm text-fg-subtle">
          Required next: {file.analysis.requiredDocuments.map((d) => d.name.toLowerCase()).join(", ")}.
        </p>
      </div>
    </StageShell>
  );
}
