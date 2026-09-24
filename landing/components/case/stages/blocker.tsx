"use client";

import { ArrowLeft, ArrowRight, FileText, Loader2, Scale } from "lucide-react";
import { useCase } from "@/lib/case-store";
import { useDocViewer } from "../doc-viewer";
import { VerifyBadge } from "../badges";
import { StageShell } from "./shell";

export function BlockerStage({ onBack }: { onBack: () => void }) {
  const { file, createPlan, busy } = useCase();
  const viewer = useDocViewer();
  const blocker = file?.blockers.find((b) => b.status === "OPEN");
  const detail = file?.analysis?.detectedIssues.find((i) => i.id === blocker?.id);
  if (!file || !blocker) return null;

  return (
    <StageShell title="Possible blocker: document information mismatch" lead={detail?.description}>
      <div className="panel p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <VerifyBadge kind="DOCUMENT_COMPARISON" label="Needs verification" />
          <span className="text-sm text-fg-muted">Priority: {blocker.severity === "HIGH" ? "high" : "normal"}</span>
        </div>

        <div className="mt-6 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          {blocker.evidence.map((ev, i) => {
            const doc = file.documents.find((d) => d.documentId === ev.documentId);
            const item = (
              <div key={ev.documentId} className="paper flex flex-col p-5">
                <p className="text-sm text-paper-muted">{i === 0 ? "Application" : "Bank document"}</p>
                <p className={i === 1 ? "mark-mismatch mt-2 w-fit font-display text-3xl font-semibold" : "mt-2 w-fit font-display text-3xl font-semibold"}>
                  {ev.value}
                </p>
                <button
                  type="button"
                  onClick={() => viewer.open(ev.documentId)}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-700 underline-offset-4 hover:underline"
                  aria-label={`Open ${doc?.filename ?? "document"}`}
                >
                  <FileText size={14} aria-hidden /> {ev.documentId}, field “{ev.field}”
                </button>
              </div>
            );
            return i === 0 ? (
              <div key="pair" className="contents">
                {item}
                <div className="grid place-items-center text-3xl font-bold text-turmeric" aria-label="does not match">
                  ≠
                </div>
              </div>
            ) : (
              item
            );
          })}
        </div>

        <dl className="mt-7 grid gap-6 border-t pt-6 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-2 font-semibold">
              <Scale size={16} className="text-fg-muted" aria-hidden /> Why the agent flagged this
            </dt>
            <dd className="mt-1.5 text-[0.98rem] text-fg-muted">
              The two uploaded documents contain different versions of the worker&apos;s name. This came from a direct
              text comparison of the two fields, not from a model&apos;s judgement.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">What the agent cannot say</dt>
            <dd className="mt-1.5 text-[0.98rem] text-fg-muted">
              Whether this difference is the reason the application was returned. The notice only says a bank-related
              document needs correction.
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden /> Back
        </button>
        <button type="button" className="btn btn-primary min-h-12 px-6" onClick={() => createPlan()} disabled={busy === "plan"}>
          {busy === "plan" ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
          {busy === "plan" ? "Preparing plan" : "Generate recovery plan"}
          {busy !== "plan" && <ArrowRight size={18} aria-hidden />}
        </button>
      </div>
    </StageShell>
  );
}
