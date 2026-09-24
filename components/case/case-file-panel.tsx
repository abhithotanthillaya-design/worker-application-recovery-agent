"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, FileText, Loader2, TriangleAlert } from "lucide-react";
import { useCase } from "@/lib/case-store";
import { DOCUMENT_LABEL } from "@/lib/labels";
import { formatBytes, formatTime, cn } from "@/lib/utils";
import { useDocViewer } from "./doc-viewer";
import { SimBadge } from "./badges";
import type { TimelineEvent } from "@/lib/types";

export function DocumentsList() {
  const { file } = useCase();
  const viewer = useDocViewer();
  const docs = file?.documents ?? [];
  return (
    <section aria-labelledby="docs-h">
      <h2 id="docs-h" className="font-display text-lg font-semibold">
        Documents
      </h2>
      {docs.length === 0 ? (
        <p className="mt-3 text-sm text-fg-muted">No documents yet. Add them in the step on the left.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {docs.map((d) => (
            <li key={d.documentId}>
              <button
                type="button"
                onClick={() => viewer.open(d.documentId)}
                className="group flex w-full items-center gap-3 rounded-xl border bg-white/[0.03] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.07]"
                aria-label={`Open ${DOCUMENT_LABEL[d.documentType]}, ${d.filename}`}
              >
                <FileText size={18} className="shrink-0 text-fg-muted" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.95rem] font-semibold">{DOCUMENT_LABEL[d.documentType]}</span>
                  <span className="block truncate text-xs text-fg-subtle">
                    <span className="font-mono">{d.documentId}</span> · {d.filename} · {formatBytes(d.sizeBytes)}
                  </span>
                </span>
                {d.status === "UPLOADED" && <CheckCircle2 size={16} className="shrink-0 text-success" aria-label="Uploaded" />}
                {d.status === "PROCESSING" && <Loader2 size={16} className="shrink-0 animate-spin text-info" aria-label="Processing" />}
                {d.status === "ERROR" && <TriangleAlert size={16} className="shrink-0 text-kumkum" aria-label="Error" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const DOT: Partial<Record<TimelineEvent["type"], string>> = {
  ISSUE_DETECTED: "bg-warn",
  RESUBMISSION_REQUIRED: "bg-kumkum",
  DELAY_NOTED: "bg-warn",
  ESCALATED: "bg-infer",
  RESOLVED: "bg-success",
};

export function Timeline() {
  const { file } = useCase();
  const events = file?.timeline ?? [];
  return (
    <section aria-labelledby="tl-h">
      <h2 id="tl-h" className="font-display text-lg font-semibold">
        Case history
      </h2>
      <ol className="relative mt-4 space-y-4 border-l border-white/15 pl-5">
        <AnimatePresence initial={false}>
          {events.map((e, i) => (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-ink-900",
                  DOT[e.type] ?? "bg-success",
                  i === events.length - 1 && "ring-turmeric/30",
                )}
              />
              <p className="text-[0.92rem] font-medium leading-snug">{e.title}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-subtle">
                <time dateTime={e.timestamp} className="tabular">
                  {formatTime(e.timestamp)}
                </time>
                {e.detail && <span className="font-mono">{e.detail}</span>}
                {e.simulation && <SimBadge className="!px-1.5 !py-0.5 !text-[0.68rem]">Simulated</SimBadge>}
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </section>
  );
}
