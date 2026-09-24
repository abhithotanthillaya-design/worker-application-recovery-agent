"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Download, FileText, Loader2, PartyPopper, Copy } from "lucide-react";
import { useCase } from "@/lib/case-store";
import { AnalysisBands } from "../analysis-bands";
import { SimBadge } from "../badges";
import { useDocViewer } from "../doc-viewer";
import { StageShell } from "./shell";
import { FollowUpDraft } from "./follow-up";
import { formatDateTime } from "@/lib/utils";

/* Second failure: the agent re-enters the recovery loop. */
export function PersistingStage() {
  const { file, prepareFollowUp, escalate, busy } = useCase();
  const [review, setReview] = useState(false);
  if (!file) return null;
  const res = file.latestResponse;

  return (
    <StageShell
      title="The problem may not be resolved"
      lead="The latest response indicates that the application still requires correction. The agent compared it with your previous attempt."
    >
      <section aria-labelledby="resp-h" className="panel p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="resp-h" className="font-display text-lg font-semibold">
            Latest response
          </h2>
          <SimBadge>Simulated response</SimBadge>
        </div>
        <blockquote className="mt-3 border-l-4 border-kumkum pl-4 text-[1.05rem]">{res?.text}</blockquote>
        {res && <p className="mt-2 text-xs text-fg-subtle">Received {formatDateTime(res.receivedAt)}</p>}

        <h3 className="mt-7 font-semibold">What changed since your last attempt</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-[0.95rem]">
            <thead>
              <tr className="text-sm text-fg-muted">
                <th className="border-b py-2 pr-4 font-medium">Item</th>
                <th className="border-b py-2 pr-4 font-medium">First attempt</th>
                <th className="border-b py-2 font-medium">Latest response</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="border-b py-3 pr-4 font-medium">Bank document name</th>
                <td className="border-b py-3 pr-4 text-fg-muted">“Ramesh K.” differed from the application</td>
                <td className="border-b py-3">Corrected. Not raised again.</td>
              </tr>
              <tr>
                <th scope="row" className="py-3 pr-4 font-medium">What is asked for</th>
                <td className="py-3 pr-4 text-fg-muted">A corrected bank document</td>
                <td className="py-3 text-kumkum">Branch seal and signature on it</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost" onClick={() => setReview((r) => !r)} aria-expanded={review}>
          {review ? "Hide the new analysis" : "Review new issue"}
        </button>
        {!file.followUp && (
          <button type="button" className="btn btn-primary" onClick={() => prepareFollowUp()} disabled={busy === "followup"}>
            {busy === "followup" && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Prepare follow-up
          </button>
        )}
      </div>

      {review && file.analysis && <AnalysisBands analysis={file.analysis} />}
      {file.followUp && <FollowUpDraft />}

      {file.followUp && (
        <section className="rounded-[var(--radius-panel)] border border-infer/40 bg-infer/[0.07] p-5">
          <h2 className="font-display text-lg font-semibold">The remaining step needs a person</h2>
          <p className="mt-1.5 text-fg-muted">
            A branch seal has to be obtained in person, and a human at the labour office has to accept it. The agent will
            stop retrying and prepare a handover.
          </p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => escalate()} disabled={busy === "escalate"}>
            {busy === "escalate" && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Prepare human escalation <ArrowRight size={16} aria-hidden />
          </button>
        </section>
      )}
    </StageShell>
  );
}

const PACKET_ITEMS = [
  "Case history",
  "Application information",
  "Previous responses",
  "Relevant documents",
  "Recovery actions attempted",
  "Remaining issue",
];

export function EscalationStage() {
  const { file, escalate, busy } = useCase();
  const viewer = useDocViewer();
  const [copied, setCopied] = useState(false);
  if (!file) return null;
  const esc = file.escalation;

  const summaryText = esc
    ? [
        `Escalation ${esc.escalationId} for ${file.case.caseId}`,
        `Reason: ${esc.reason}`,
        "",
        esc.packet.caseSummary,
        "",
        "Attempts:",
        ...esc.packet.attempts.map((a) => `- ${a}`),
        "",
        `Remaining issue: ${esc.packet.remainingIssue}`,
        `Documents: ${esc.packet.documents.join(", ")}`,
        "",
        "Simulated escalation packet from a prototype. Not sent to any office.",
      ].join("\n")
    : "";

  if (!esc) {
    return (
      <StageShell
        title="Automated recovery was unsuccessful"
        lead="The case has now had multiple unresolved issues. The agent has stopped retrying and can prepare everything a person needs."
      >
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {PACKET_ITEMS.map((t) => (
            <li key={t} className="panel-flat flex items-center gap-3 px-4 py-3">
              <Check size={16} className="text-success" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary min-h-12 px-6" onClick={() => escalate()} disabled={busy === "escalate"}>
          {busy === "escalate" && <Loader2 size={18} className="animate-spin" aria-hidden />}
          Prepare human escalation
        </button>
      </StageShell>
    );
  }

  return (
    <StageShell title="Human escalation packet prepared" lead={esc.reason}>
      <div className="panel space-y-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono">{esc.escalationId}</p>
          <SimBadge>Simulated escalation</SimBadge>
        </div>
        <p className="text-sm text-fg-muted">{esc.destination}</p>

        <div>
          <h2 className="font-display text-lg font-semibold">Case summary</h2>
          <p className="mt-1.5 text-[1.02rem]">{esc.packet.caseSummary}</p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Attempts so far</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-fg-muted">
            {esc.packet.attempts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Remaining issue</h2>
          <p className="mt-1.5 text-kumkum">{esc.packet.remainingIssue}</p>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Documents in the packet</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {esc.packet.documents.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => viewer.open(id)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm hover:bg-white/10"
                >
                  <FileText size={14} aria-hidden /> <span className="font-mono">{id}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(summaryText);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            } catch {
              /* clipboard unavailable */
            }
          }}
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied ? "Copied" : "Copy packet summary"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            const url = URL.createObjectURL(new Blob([summaryText], { type: "text/plain" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `${file.case.caseId}-escalation-packet.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download size={16} aria-hidden /> Download packet (.txt)
        </button>
      </div>
    </StageShell>
  );
}

export function ResolvedStage() {
  const { file, reset } = useCase();
  if (!file) return null;
  return (
    <StageShell title="The case is resolved" lead={file.latestResponse?.text}>
      <div className="panel flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
            <PartyPopper size={24} aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl font-semibold">Recovered after one correction</p>
            <p className="font-mono text-sm text-fg-muted">{file.submission?.referenceId}</p>
          </div>
        </div>
        <SimBadge className="w-fit">Simulated outcome. No real benefit was approved.</SimBadge>
        <div className="flex flex-wrap gap-3">
          <Link href="/start" onClick={() => reset()} className="btn btn-primary">
            Try the failure path
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back to overview
          </Link>
        </div>
      </div>
    </StageShell>
  );
}
