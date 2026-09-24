"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import RubberSegment from "@/components/ui/rubber-segment";
import { useCase } from "@/lib/case-store";
import { STATUS_LABEL } from "@/lib/labels";
import type { CaseStatus } from "@/lib/types";
import { SimBadge } from "./badges";
import { DocViewerProvider } from "./doc-viewer";
import { DocumentsList, Timeline } from "./case-file-panel";
import { RAIL, StageRail } from "./stage-rail";
import { UploadStage } from "./stages/upload";
import { AnalyzingStage } from "./stages/analyzing";
import { UnderstandingStage } from "./stages/understanding";
import { BlockerStage } from "./stages/blocker";
import { ApprovalStage, PausedStage, PlanStage } from "./stages/plan";
import { TrackingStage } from "./stages/tracking";
import { EscalationStage, PersistingStage, ResolvedStage } from "./stages/outcome";

type View =
  | "upload" | "analyzing" | "understanding" | "blocker" | "plan" | "approval"
  | "paused" | "tracking" | "persisting" | "escalation" | "resolved";

function deriveView(status: CaseStatus, sub: string): View {
  switch (status) {
    case "CREATED":
    case "DOCUMENTS_PENDING":
      return "upload";
    case "ANALYZING":
      return "analyzing";
    case "ISSUE_FOUND":
      return sub === "next" ? "blocker" : "understanding";
    case "ACTION_REQUIRED":
      return "paused";
    case "AWAITING_APPROVAL":
      return sub === "next" ? "approval" : "plan";
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "RESUBMITTED":
      return "tracking";
    case "RESUBMISSION_REQUIRED":
    case "ISSUE_PERSISTS":
      return "persisting";
    case "ESCALATION_REQUIRED":
    case "ESCALATED":
      return "escalation";
    case "RESOLVED":
      return "resolved";
  }
}

const RAIL_INDEX: Record<View, number> = {
  upload: 0, analyzing: 1, understanding: 2, blocker: 3, plan: 4, approval: 5,
  paused: 5, tracking: 6, persisting: 6, escalation: 7, resolved: 7,
};

const TABS = ["step", "docs", "history"];
const TAB_LABEL = { step: "Current step", docs: "Documents", history: "History" };

export function Workspace({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { file, load, loading, reset } = useCase();
  const [tried, setTried] = useState(false);
  const [sub, setSub] = useState("");
  const [tab, setTab] = useState("step");
  const mainRef = useRef<HTMLDivElement>(null);
  const status = file?.case.status;

  useEffect(() => {
    if (!file || file.case.caseId !== caseId) {
      load(caseId).finally(() => setTried(true));
    } else setTried(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  // Sub-step (blocker / approval) resets whenever the backend status changes.
  useEffect(() => setSub(""), [status]);

  const view = useMemo(() => (status ? deriveView(status, sub) : null), [status, sub]);

  // Move focus to the new step heading for keyboard and screen-reader users.
  useEffect(() => {
    if (!view) return;
    const t = window.setTimeout(() => mainRef.current?.querySelector<HTMLElement>("#stage-title")?.focus({ preventScroll: true }), 350);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => window.clearTimeout(t);
  }, [view]);

  if (!file || !view) {
    return (
      <div className="grid min-h-svh place-items-center px-5 text-center">
        {loading || !tried ? (
          <p className="text-fg-muted" role="status">Opening the case…</p>
        ) : (
          <div>
            <h1 className="t-h2">This case is not available</h1>
            <p className="mt-3 text-fg-muted">Demo cases live only in this browser session.</p>
            <Link href="/start" className="btn btn-primary mt-6">Start a new case</Link>
          </div>
        )}
      </div>
    );
  }

  const next = () => setSub("next");
  const back = () => setSub("");

  return (
    <DocViewerProvider>
      <header className="sticky top-0 z-40 border-b bg-ink-900/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-[90rem] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
          <Logo />
          <div className="min-w-0 flex-1 text-sm">
            <p className="truncate">
              <span className="font-mono">{file.case.caseId}</span>
              <span className="text-fg-subtle"> · </span>
              <span className="font-semibold">{file.case.workerName}</span>
              <span className="hidden text-fg-muted sm:inline"> · {file.case.scheme}</span>
            </p>
          </div>
          <span className="rounded-full border border-white/20 px-3 py-1 text-[0.8rem] font-semibold">{STATUS_LABEL[file.case.status]}</span>
          <SimBadge className="hidden sm:inline-flex">Simulated government workflow</SimBadge>
          <button
            type="button"
            className="btn btn-quiet min-h-9 text-sm"
            onClick={() => {
              reset();
              router.push("/start");
            }}
          >
            <RotateCcw size={14} aria-hidden /> Reset demo
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[90rem] px-4 pb-24 pt-6 sm:px-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)_21rem] lg:gap-10 lg:pt-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <StageRail current={RAIL_INDEX[view]} warn={view === "persisting" || view === "paused"} />
          </div>
        </aside>

        {/* Mobile: compact progress and tabs */}
        <div className="mb-5 space-y-4 lg:hidden">
          <p className="text-sm text-fg-muted">
            Step {RAIL_INDEX[view] + 1} of {RAIL.length}: <span className="font-semibold text-fg">{RAIL[RAIL_INDEX[view]]}</span>
          </p>
          <div className="h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full rounded-full bg-turmeric transition-all duration-500" style={{ width: `${((RAIL_INDEX[view] + 1) / RAIL.length) * 100}%` }} />
          </div>
          <RubberSegment
            items={TABS}
            labels={TAB_LABEL}
            value={tab}
            onChange={setTab}
            ariaLabel="Case sections"
            trackColor="#0a1130"
            thumbColor="#eef1fb"
            textColor="#a9b3d9"
            activeTextColor="#0a1130"
            size="md"
            radius={14}
            inset={4}
            className="w-full"
          />
        </div>

        <div id="main" ref={mainRef} className={tab === "step" ? "min-w-0" : "hidden min-w-0 lg:block"}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === "upload" && <UploadStage />}
              {view === "analyzing" && <AnalyzingStage />}
              {view === "understanding" && <UnderstandingStage onNext={next} />}
              {view === "blocker" && <BlockerStage onBack={back} />}
              {view === "plan" && <PlanStage onNext={next} />}
              {view === "approval" && <ApprovalStage onBack={back} />}
              {view === "paused" && <PausedStage />}
              {view === "tracking" && <TrackingStage />}
              {view === "persisting" && <PersistingStage />}
              {view === "escalation" && <EscalationStage />}
              {view === "resolved" && <ResolvedStage />}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="min-w-0 space-y-9 lg:block">
          <div className={tab === "docs" ? "block" : "hidden lg:block"}>
            <DocumentsList />
          </div>
          <div className={tab === "history" ? "block" : "hidden lg:block"}>
            <Timeline />
          </div>
        </aside>
      </div>
    </DocViewerProvider>
  );
}
