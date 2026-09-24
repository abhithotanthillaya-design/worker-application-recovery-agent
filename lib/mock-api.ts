import {
  DELAY_RESPONSE_TEXT,
  DEMO_FIELDS,
  DEMO_FILENAMES,
  SECOND_RESPONSE_TEXT,
  SIM_REFERENCE_ID,
  buildAnalysis,
  buildBlockers,
  buildEscalationPacket,
  buildFollowUpMessage,
  buildPlan,
} from "./mock-data";
import type {
  ApiError,
  Analysis,
  Blocker,
  CaseFile,
  CaseRecord,
  CaseStatus,
  CreateCaseRequest,
  DocumentRecord,
  DocumentType,
  Escalation,
  FollowUp,
  RecoveryPlan,
  SimulationScenario,
  Submission,
  TimelineEvent,
} from "./types";

/* ----------------------------------------------------------------------------
   Mock API. Each function corresponds to one endpoint in the contract and
   resolves with the same response shape. To go live, replace the body of each
   function with a fetch() to NEXT_PUBLIC_API_URL; the UI does not change.
   ---------------------------------------------------------------------------- */

export type ApiOk<T> = { success: true } & T;
export type ApiFail = { success: false; error: ApiError };
export type ApiResult<T> = ApiOk<T> | ApiFail;

const STORAGE_KEY = "worker-recovery-demo-v1";
const ANALYSIS_DURATION_MS = 5600;

let db: Record<string, CaseFile> = {};
let analysisStartedAt: Record<string, number> = {};
let counter = 1000;
let loaded = false;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();

function hydrate() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      db = parsed.db ?? {};
      analysisStartedAt = parsed.analysisStartedAt ?? {};
      counter = parsed.counter ?? 1000;
    }
  } catch {
    /* storage unavailable: run in memory */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ db, analysisStartedAt, counter }));
  } catch {
    /* ignore */
  }
}

function fail(code: ApiError["code"], message: string): ApiFail {
  return { success: false, error: { code, message } };
}

function getFile(caseId: string): CaseFile | null {
  hydrate();
  return db[caseId] ?? null;
}

function event(file: CaseFile, e: Omit<TimelineEvent, "id" | "timestamp">) {
  file.timeline.push({
    id: `EVENT-${String(file.timeline.length + 1).padStart(3, "0")}`,
    timestamp: now(),
    ...e,
  });
}

function setStatus(file: CaseFile, status: CaseStatus, progress?: number) {
  file.case.status = status;
  file.case.updatedAt = now();
  if (progress !== undefined) file.case.progress = progress;
}

const PROGRESS: Partial<Record<CaseStatus, number>> = {
  CREATED: 5,
  DOCUMENTS_PENDING: 15,
  ANALYZING: 30,
  ISSUE_FOUND: 45,
  AWAITING_APPROVAL: 60,
  SUBMITTED: 72,
  UNDER_REVIEW: 80,
  RESUBMISSION_REQUIRED: 80,
  ISSUE_PERSISTS: 85,
  ESCALATION_REQUIRED: 90,
  ESCALATED: 100,
  RESOLVED: 100,
};

/* ------------------------------ endpoints ------------------------------ */

export const mockApi = {
  /** GET /health */
  async health() {
    return { status: "ok", service: "worker-recovery-agent", version: "1.0.0" };
  },

  /** POST /cases */
  async createCase(req: CreateCaseRequest): Promise<ApiResult<{ case: CaseRecord }>> {
    hydrate();
    await wait(700);
    if (!req.workerName.trim()) return fail("INVALID_REQUEST", "Worker name is required.");
    counter += 1;
    const caseId = `CASE-${counter}`;
    const record: CaseRecord = {
      caseId,
      workerName: req.workerName.trim(),
      scheme: req.scheme,
      state: req.state,
      status: "DOCUMENTS_PENDING",
      createdAt: now(),
      updatedAt: now(),
      progress: PROGRESS.DOCUMENTS_PENDING,
    };
    const file: CaseFile = {
      case: record,
      documents: [],
      analysis: null,
      blockers: [],
      plan: null,
      submission: null,
      followUp: null,
      escalation: null,
      timeline: [],
      userStatement: { alreadySubmitted: false, note: "" },
      attempts: 0,
      latestResponse: null,
    };
    event(file, { type: "CASE_CREATED", title: "Case created" });
    db[caseId] = file;
    persist();
    return { success: true, case: record };
  },

  /** GET /cases/{caseId} */
  async getCase(caseId: string): Promise<ApiResult<{ case: CaseRecord }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    return { success: true, case: file.case };
  },

  /** Convenience for the prototype: the "most important shared object" (contract §53). */
  async getCaseFile(caseId: string): Promise<ApiResult<{ file: CaseFile }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    return { success: true, file: structuredClone(file) };
  },

  /** POST /cases/{caseId}/documents (multipart) */
  async uploadDocument(
    caseId: string,
    upload: { name: string; size: number },
    documentType: DocumentType,
    opts: { fast?: boolean } = {},
  ): Promise<ApiResult<{ document: DocumentRecord }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    if (!/\.(pdf|png|jpe?g)$/i.test(upload.name))
      return fail("INVALID_FILE_TYPE", "Only PDF, PNG, JPG and JPEG files are supported.");
    if (upload.size > 10 * 1024 * 1024) return fail("FILE_TOO_LARGE", "Each file must be 10 MB or smaller.");
    if (file.documents.length >= 10) return fail("INVALID_REQUEST", "A case can hold up to 10 documents.");
    await wait(opts.fast ? 250 : 900);

    // Prototype: the demo extraction always returns the synthetic fields for the chosen type.
    const document: DocumentRecord = {
      documentId: `DOC-${String(file.documents.length + 1).padStart(3, "0")}`,
      caseId,
      filename: upload.name,
      documentType,
      status: "UPLOADED",
      uploadedAt: now(),
      sizeBytes: upload.size,
      fields: DEMO_FIELDS[documentType],
    };
    file.documents.push(document);
    event(file, {
      type: "DOCUMENT_UPLOADED",
      title:
        documentType === "REJECTION_NOTICE"
          ? "Rejection notice uploaded"
          : `${document.filename.replace(/\.[^.]+$/, "").replace(/_/g, " ")} uploaded`,
    });
    persist();
    return { success: true, document: structuredClone(document) };
  },

  /** Prototype-only helper: uploads the four synthetic documents in one go. */
  async loadDemoDocuments(caseId: string, types: DocumentType[]): Promise<void> {
    for (const t of types) {
      await mockApi.uploadDocument(caseId, { name: DEMO_FILENAMES[t], size: 184_000 }, t, { fast: true });
    }
  },

  /** Prototype-only: what the worker tells the agent before analysis. */
  async saveUserStatement(caseId: string, statement: { alreadySubmitted: boolean; note: string }) {
    const file = getFile(caseId);
    if (!file) return;
    file.userStatement = statement;
    persist();
  },

  /** POST /cases/{caseId}/analyze */
  async analyze(caseId: string): Promise<ApiResult<{ caseId: string; status: "ANALYZING"; analysisId: string }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    const have = new Set(file.documents.map((d) => d.documentType));
    if (!(["APPLICATION", "REJECTION_NOTICE", "IDENTITY", "BANK"] as DocumentType[]).every((t) => have.has(t)))
      return fail("INVALID_CASE_STATE", "Upload the application, rejection notice, identity and bank documents first.");
    await wait(400);
    setStatus(file, "ANALYZING", PROGRESS.ANALYZING);
    analysisStartedAt[caseId] = Date.now();
    persist();
    return { success: true, caseId, status: "ANALYZING", analysisId: "ANALYSIS-001" };
  },

  /** GET /cases/{caseId}/analysis  (poll until status is COMPLETED) */
  async getAnalysis(
    caseId: string,
  ): Promise<ApiResult<{ status: "PROCESSING" | "COMPLETED"; analysis?: Analysis; blockers?: Blocker[] }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    await wait(250);

    if (file.case.status === "ANALYZING") {
      const started = analysisStartedAt[caseId] ?? 0;
      if (Date.now() - started < ANALYSIS_DURATION_MS) return { success: true, status: "PROCESSING" };
      file.analysis = buildAnalysis(file.documents, file.userStatement, 0);
      file.blockers = buildBlockers(file.documents, 0);
      setStatus(file, "ISSUE_FOUND", PROGRESS.ISSUE_FOUND);
      event(file, { type: "ANALYSIS_COMPLETED", title: "Documents compared" });
      event(file, { type: "ISSUE_DETECTED", title: "Potential document mismatch detected" });
      persist();
    } else if (file.attempts >= 1) {
      // Re-entering the recovery loop after a second response.
      file.analysis = buildAnalysis(file.documents, file.userStatement, file.attempts);
      file.blockers = buildBlockers(file.documents, file.attempts);
      persist();
    }

    if (!file.analysis) return fail("INVALID_CASE_STATE", "This case has not been analyzed yet.");
    return {
      success: true,
      status: "COMPLETED",
      analysis: structuredClone(file.analysis),
      blockers: structuredClone(file.blockers),
    };
  },

  /** POST /cases/{caseId}/recovery-plan */
  async createRecoveryPlan(caseId: string): Promise<ApiResult<{ plan: RecoveryPlan }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    if (!file.analysis) return fail("INVALID_CASE_STATE", "Analyze the documents before planning.");
    await wait(1100);
    file.plan = buildPlan();
    setStatus(file, "AWAITING_APPROVAL", PROGRESS.AWAITING_APPROVAL);
    event(file, { type: "PLAN_CREATED", title: "Recovery plan prepared" });
    persist();
    return { success: true, plan: structuredClone(file.plan) };
  },

  /** POST /cases/{caseId}/approval */
  async approve(
    caseId: string,
    body: { planId: string; approved: boolean },
  ): Promise<ApiResult<{ caseId: string; status: CaseStatus; message: string }>> {
    const file = getFile(caseId);
    if (!file || !file.plan) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    await wait(600);
    if (!body.approved) {
      file.plan.status = "DECLINED";
      setStatus(file, "ACTION_REQUIRED");
      persist();
      return {
        success: true,
        caseId,
        status: "ACTION_REQUIRED",
        message: "User did not approve the proposed recovery action.",
      };
    }
    file.plan.status = "APPROVED";
    setStatus(file, "SUBMITTED", PROGRESS.SUBMITTED);
    event(file, { type: "PLAN_APPROVED", title: "You approved the recovery plan" });
    persist();
    return {
      success: true,
      caseId,
      status: "SUBMITTED",
      message: "Recovery action approved and submitted to the simulated workflow.",
    };
  },

  /** POST /cases/{caseId}/mock-submit */
  async mockSubmit(
    caseId: string,
    body: { action: "RESUBMIT_CORRECTION"; planId: string },
  ): Promise<ApiResult<{ simulation: true; submission: Submission }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    if (!file.plan || file.plan.status !== "APPROVED" || file.plan.planId !== body.planId)
      return fail("APPROVAL_REQUIRED", "The recovery plan must be approved before anything is submitted.");
    await wait(1200);
    const submission: Submission = { referenceId: SIM_REFERENCE_ID, status: "UNDER_REVIEW", submittedAt: now() };
    file.submission = submission;
    setStatus(file, "UNDER_REVIEW", PROGRESS.UNDER_REVIEW);
    event(file, {
      type: "SUBMITTED",
      title: "Correction submitted to simulated workflow",
      detail: SIM_REFERENCE_ID,
      simulation: true,
    });
    event(file, { type: "UNDER_REVIEW", title: "Application is under simulated review", simulation: true });
    persist();
    return { success: true, simulation: true, submission: structuredClone(submission) };
  },

  /** GET /cases/{caseId}/status */
  async getStatus(caseId: string) {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    return {
      success: true as const,
      caseId,
      status: file.case.status,
      referenceId: file.submission?.referenceId ?? null,
      lastUpdated: file.case.updatedAt,
      timeline: file.timeline.map((t) => ({ timestamp: t.timestamp, status: t.type, message: t.title })),
    };
  },

  /** POST /cases/{caseId}/simulate/status */
  async simulateStatus(
    caseId: string,
    body: { scenario: SimulationScenario },
  ): Promise<ApiResult<{ simulation: true; case: { caseId: string; status: CaseStatus }; message: string }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    if (!file.submission) return fail("INVALID_CASE_STATE", "Nothing has been submitted to the simulated workflow yet.");
    await wait(1000);
    const receivedAt = now();
    switch (body.scenario) {
      case "SUCCESS":
        setStatus(file, "RESOLVED", PROGRESS.RESOLVED);
        file.latestResponse = {
          scenario: "SUCCESS",
          receivedAt,
          text: "Corrected details accepted. Benefit approved for disbursement (simulated).",
        };
        event(file, { type: "RESOLVED", title: "Application approved in the simulation", simulation: true });
        break;
      case "SECOND_REJECTION":
        file.attempts = 1;
        setStatus(file, "RESUBMISSION_REQUIRED", PROGRESS.RESUBMISSION_REQUIRED);
        file.latestResponse = { scenario: "SECOND_REJECTION", receivedAt, text: SECOND_RESPONSE_TEXT };
        event(file, {
          type: "RESUBMISSION_REQUIRED",
          title: "Second response: correction still required",
          simulation: true,
        });
        break;
      case "DELAY":
        file.latestResponse = { scenario: "DELAY", receivedAt, text: DELAY_RESPONSE_TEXT };
        event(file, { type: "DELAY_NOTED", title: "Review is running late", simulation: true });
        break;
      case "ESCALATION":
        setStatus(file, "ESCALATION_REQUIRED", PROGRESS.ESCALATION_REQUIRED);
        file.attempts = Math.max(file.attempts, 1);
        file.latestResponse = { scenario: "ESCALATION", receivedAt, text: SECOND_RESPONSE_TEXT };
        event(file, { type: "RESUBMISSION_REQUIRED", title: "Recovery stalled: human help needed", simulation: true });
        break;
    }
    persist();
    return {
      success: true,
      simulation: true,
      case: { caseId, status: file.case.status },
      message: "Simulated authority response generated.",
    };
  },

  /** POST /cases/{caseId}/follow-up */
  async followUp(
    caseId: string,
    body: { type: "REQUEST_CLARIFICATION"; message?: string },
  ): Promise<ApiResult<{ followUp: FollowUp }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    await wait(900);
    const followUp: FollowUp = {
      followUpId: "FOLLOW-001",
      status: "PREPARED",
      simulation: true,
      type: body.type,
      message: body.message ?? buildFollowUpMessage(caseId, file.case.workerName),
    };
    file.followUp = followUp;
    if (file.case.status === "RESUBMISSION_REQUIRED") setStatus(file, "ISSUE_PERSISTS", PROGRESS.ISSUE_PERSISTS);
    event(file, { type: "FOLLOW_UP_PREPARED", title: "Follow-up drafted, not sent", simulation: true });
    persist();
    return { success: true, followUp: structuredClone(followUp) };
  },

  /** POST /cases/{caseId}/escalate */
  async escalate(caseId: string): Promise<ApiResult<{ escalation: Escalation }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    await wait(1300);
    const escalation: Escalation = {
      escalationId: "ESC-001",
      status: "ESCALATED",
      reason: "Repeated application failure after attempted correction.",
      destination: "Simulated escalation desk (demo). No real office receives this.",
      packet: buildEscalationPacket(
        file.documents,
        file.case.workerName,
        file.timeline.map((t) => t.title),
      ),
    };
    file.escalation = escalation;
    setStatus(file, "ESCALATED", PROGRESS.ESCALATED);
    event(file, { type: "ESCALATED", title: "Human escalation packet prepared", simulation: true });
    persist();
    return { success: true, escalation: structuredClone(escalation) };
  },

  /** GET /cases/{caseId}/timeline */
  async getTimeline(caseId: string): Promise<ApiResult<{ timeline: TimelineEvent[] }>> {
    const file = getFile(caseId);
    if (!file) return fail("CASE_NOT_FOUND", "The requested case does not exist.");
    return { success: true, timeline: structuredClone(file.timeline) };
  },

  /** Prototype-only. */
  reset(caseId?: string) {
    hydrate();
    if (caseId) delete db[caseId];
    else db = {};
    persist();
  },
};
