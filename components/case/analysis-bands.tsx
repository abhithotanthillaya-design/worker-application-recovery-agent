"use client";

import { FileText } from "lucide-react";
import type { Analysis, Verification } from "@/lib/types";
import { VERIFY_STYLE, VerifyBadge } from "./badges";
import { useDocViewer } from "./doc-viewer";
import { cn } from "@/lib/utils";

function Band({
  kind,
  label,
  meaning,
  children,
  empty,
}: {
  kind: Verification;
  label?: string;
  meaning: string;
  children?: React.ReactNode;
  empty?: string;
}) {
  const s = VERIFY_STYLE[kind];
  const has = !!children && (Array.isArray(children) ? children.length > 0 : true);
  return (
    <section
      aria-label={label}
      className={cn(
        "grid gap-x-8 gap-y-3 border-l-4 py-5 pl-5 pr-2 sm:grid-cols-[11rem_1fr]",
        s.rule,
        kind === "UNKNOWN" && "border-dashed",
      )}
    >
      <div>
        <VerifyBadge kind={kind} label={label} />
        <p className="mt-2 text-[0.82rem] leading-snug text-fg-subtle">{meaning}</p>
      </div>
      <div className="space-y-3.5">
        {has ? children : <p className="text-[0.95rem] text-fg-subtle">{empty}</p>}
      </div>
    </section>
  );
}

function SourceChip({ documentId, label }: { documentId?: string; label: string }) {
  const viewer = useDocViewer();
  if (!documentId || documentId.startsWith("RESP")) {
    return documentId ? <span className="text-xs text-fg-subtle">Source: latest simulated response</span> : null;
  }
  return (
    <button
      type="button"
      onClick={() => viewer.open(documentId)}
      className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-white/20 px-2 py-1 text-xs font-medium text-fg-muted hover:border-white/40 hover:text-fg"
    >
      <FileText size={12} aria-hidden /> {label} <span className="font-mono text-fg-subtle">{documentId}</span>
    </button>
  );
}

export function AnalysisBands({ analysis }: { analysis: Analysis }) {
  return (
    <div className="divide-y divide-white/10 rounded-[var(--radius-panel)] border bg-white/[0.025] px-3 sm:px-5">
      <Band kind="DOCUMENT_CONFIRMED" meaning="Stated in a document you uploaded.">
        {analysis.confirmedFacts.map((f) => (
          <div key={f.text}>
            <p className="text-[1.02rem]">{f.text}</p>
            <SourceChip
              documentId={f.documentId}
              label={f.source === "REJECTION_NOTICE" ? "Notice" : f.source === "APPLICATION" ? "Application" : "Document"}
            />
          </div>
        ))}
      </Band>

      <Band
        kind="USER_REPORTED"
        label="Your information"
        meaning="What you told the agent. Not treated as proven."
        empty="You have not told the agent anything yet."
      >
        {analysis.userReported.map((u) => (
          <p key={u.text} className="text-[1.02rem]">
            {u.text}
          </p>
        ))}
      </Band>

      <Band
        kind="DOCUMENT_COMPARISON"
        label="Possible issue"
        meaning="Found by comparing documents. Needs your verification."
        empty="No possible issues found."
      >
        {analysis.detectedIssues.map((i) => (
          <div key={i.id} className={cn(i.status === "ADDRESSED" && "opacity-65")}>
            <p className="font-semibold">
              {i.title}
              {i.status === "ADDRESSED" && <span className="ml-2 text-sm font-normal text-fg-muted">Addressed in attempt 1</span>}
            </p>
            <p className="mt-0.5 text-[1.02rem] text-fg-muted">{i.description}</p>
            {i.verification === "DOCUMENT_CONFIRMED" && (
              <p className="mt-1 text-xs text-success">Stated in the latest official response</p>
            )}
          </div>
        ))}
        {analysis.inferences.map((inf) => (
          <div key={inf.text} className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
            <VerifyBadge kind="AI_INFERENCE" label="AI inference · needs verification" className="mt-0.5" />
            <p className="min-w-0 flex-1 basis-64 text-[1.02rem] text-fg-muted">{inf.text}</p>
          </div>
        ))}
      </Band>

      <Band kind="UNKNOWN" meaning="Cannot be established from what is available.">
        {analysis.unknowns.map((u) => (
          <p key={u.text} className="text-[1.02rem] text-fg-muted">
            {u.text}
          </p>
        ))}
      </Band>
    </div>
  );
}
