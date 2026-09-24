"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { mockApi } from "./mock-api";
import { useToast } from "@/components/ui/toast-host";
import { REQUIRED_DOCUMENT_TYPES } from "./labels";
import { SIM_REFERENCE_ID } from "./mock-data";
import type { CaseFile, CreateCaseRequest, DocumentType, SimulationScenario } from "./types";

interface CaseContextValue {
  file: CaseFile | null;
  loading: boolean;
  busy: string | null;
  load: (caseId: string) => Promise<boolean>;
  createCase: (req: CreateCaseRequest) => Promise<string | null>;
  addFile: (f: File, type: DocumentType) => Promise<boolean>;
  loadDemoDocuments: () => Promise<void>;
  saveStatement: (s: { alreadySubmitted: boolean; note: string }) => Promise<void>;
  analyze: () => Promise<void>;
  createPlan: () => Promise<void>;
  approve: (approved: boolean) => Promise<void>;
  simulate: (s: SimulationScenario) => Promise<void>;
  prepareFollowUp: () => Promise<void>;
  escalate: () => Promise<void>;
  reset: () => void;
}

const CaseContext = createContext<CaseContextValue | null>(null);

export function useCase() {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error("useCase must be used inside CaseProvider");
  return ctx;
}

export function CaseProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [file, setFile] = useState<CaseFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const polling = useRef(false);
  const idRef = useRef<string | null>(null);

  const refresh = useCallback(async (caseId: string) => {
    const r = await mockApi.getCaseFile(caseId);
    if (r.success) {
      setFile(r.file);
      return r.file;
    }
    return null;
  }, []);

  const fail = useCallback(
    (message: string) => toast.push({ title: "That did not work", description: message, tone: "warn" }),
    [toast],
  );

  const pollAnalysis = useCallback(
    async (caseId: string) => {
      if (polling.current) return;
      polling.current = true;
      try {
        for (let i = 0; i < 60; i++) {
          const r = await mockApi.getAnalysis(caseId);
          if (!r.success) {
            fail(r.error.message);
            break;
          }
          if (r.status === "COMPLETED") {
            await refresh(caseId);
            toast.push({ title: "Analysis ready", description: "One possible blocker found.", tone: "info" });
            break;
          }
          await new Promise((res) => setTimeout(res, 900));
        }
      } finally {
        polling.current = false;
        setBusy(null);
      }
    },
    [fail, refresh, toast],
  );

  const load = useCallback(
    async (caseId: string) => {
      setLoading(true);
      idRef.current = caseId;
      const f = await refresh(caseId);
      setLoading(false);
      if (f?.case.status === "ANALYZING") void pollAnalysis(caseId);
      return !!f;
    },
    [refresh, pollAnalysis],
  );

  const run = useCallback(
    async <T,>(key: string, fn: () => Promise<T>) => {
      setBusy(key);
      try {
        return await fn();
      } finally {
        if (key !== "analyze") setBusy(null);
      }
    },
    [],
  );

  const value = useMemo<CaseContextValue>(() => {
    const id = () => idRef.current as string;
    return {
      file,
      loading,
      busy,
      load,
      createCase: (req) =>
        run("create", async () => {
          const r = await mockApi.createCase(req);
          if (!r.success) {
            fail(r.error.message);
            return null;
          }
          idRef.current = r.case.caseId;
          await refresh(r.case.caseId);
          toast.push({ title: "Case created", description: r.case.caseId, tone: "success" });
          return r.case.caseId;
        }),
      addFile: (f, type) =>
        run("upload", async () => {
          const r = await mockApi.uploadDocument(id(), { name: f.name, size: f.size }, type);
          if (!r.success) {
            fail(r.error.message);
            return false;
          }
          await refresh(id());
          return true;
        }),
      loadDemoDocuments: () =>
        run("upload", async () => {
          const have = new Set(file?.documents.map((d) => d.documentType));
          const order: DocumentType[] = ["APPLICATION", "BANK", "IDENTITY", "REJECTION_NOTICE"];
          await mockApi.loadDemoDocuments(id(), order.filter((t) => !have.has(t)));
          await refresh(id());
          toast.push({ title: "Demo documents added", description: "Synthetic files, not real records.", tone: "sim" });
        }),
      saveStatement: async (s) => {
        await mockApi.saveUserStatement(id(), s);
        await refresh(id());
      },
      analyze: () =>
        run("analyze", async () => {
          const r = await mockApi.analyze(id());
          if (!r.success) {
            fail(r.error.message);
            setBusy(null);
            return;
          }
          await refresh(id());
          void pollAnalysis(id());
        }),
      createPlan: () =>
        run("plan", async () => {
          const r = await mockApi.createRecoveryPlan(id());
          if (!r.success) return fail(r.error.message);
          await refresh(id());
          toast.push({ title: "Recovery plan ready", description: "Review it before anything happens.", tone: "info" });
        }),
      approve: (approved) =>
        run("approve", async () => {
          const plan = file?.plan;
          if (!plan) return;
          const r = await mockApi.approve(id(), { planId: plan.planId, approved });
          if (!r.success) return fail(r.error.message);
          await refresh(id());
          if (!approved) {
            toast.push({ title: "Nothing was submitted", description: "The case is paused until you decide.", tone: "info" });
            return;
          }
          toast.push({ title: "Recovery plan approved", tone: "success", duration: 2600 });
          const s = await mockApi.mockSubmit(id(), { action: "RESUBMIT_CORRECTION", planId: plan.planId });
          if (!s.success) return fail(s.error.message);
          await refresh(id());
          toast.push({
            title: "Submitted to simulated workflow",
            description: SIM_REFERENCE_ID,
            tone: "sim",
          });
        }),
      simulate: (s) =>
        run("simulate", async () => {
          const r = await mockApi.simulateStatus(id(), { scenario: s });
          if (!r.success) return fail(r.error.message);
          if (s === "SECOND_REJECTION" || s === "ESCALATION") await mockApi.getAnalysis(id());
          await refresh(id());
          toast.push({ title: "Simulated authority response", description: r.message, tone: "sim" });
        }),
      prepareFollowUp: () =>
        run("followup", async () => {
          const r = await mockApi.followUp(id(), { type: "REQUEST_CLARIFICATION" });
          if (!r.success) return fail(r.error.message);
          await refresh(id());
          toast.push({ title: "Follow-up drafted", description: "It has not been sent to anyone.", tone: "sim" });
        }),
      escalate: () =>
        run("escalate", async () => {
          const r = await mockApi.escalate(id());
          if (!r.success) return fail(r.error.message);
          await refresh(id());
          toast.push({ title: "Human escalation packet prepared", tone: "success" });
        }),
      reset: () => {
        if (idRef.current) mockApi.reset(idRef.current);
        idRef.current = null;
        setFile(null);
      },
    };
  }, [file, loading, busy, load, run, fail, refresh, toast, pollAnalysis]);

  useEffect(() => {
    /* keep ref in sync if file replaced */
    if (file) idRef.current = file.case.caseId;
  }, [file]);

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export { REQUIRED_DOCUMENT_TYPES };
