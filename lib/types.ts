/* Types mirror "Prototype Frontend / Backend Contract — v1". Names and enums are kept exactly. */

export type CaseStatus =
  | "CREATED"
  | "DOCUMENTS_PENDING"
  | "ANALYZING"
  | "ISSUE_FOUND"
  | "ACTION_REQUIRED"
  | "AWAITING_APPROVAL"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "RESUBMISSION_REQUIRED"
  | "RESUBMITTED"
  | "RESOLVED"
  | "ISSUE_PERSISTS"
  | "ESCALATION_REQUIRED"
  | "ESCALATED";

export type DocumentType =
  | "IDENTITY"
  | "BANK"
  | "APPLICATION"
  | "REJECTION_NOTICE"
  | "CERTIFICATE"
  | "OTHER";

export type DocumentStatus = "UPLOADED" | "PROCESSING" | "ERROR";

/** Every AI-generated statement belongs to one of these categories (contract §19). */
export type Verification =
  | "DOCUMENT_CONFIRMED"
  | "USER_REPORTED"
  | "DOCUMENT_COMPARISON"
  | "AI_INFERENCE"
  | "UNKNOWN";

export type Severity = "LOW" | "MEDIUM" | "HIGH";

export interface CaseRecord {
  caseId: string;
  workerName: string;
  scheme: string;
  state: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

export interface CreateCaseRequest {
  workerName: string;
  scheme: string;
  state: string;
}

export interface DocumentField {
  field: string;
  label: string;
  value: string;
}

export interface DocumentRecord {
  documentId: string;
  caseId: string;
  filename: string;
  documentType: DocumentType;
  status: DocumentStatus;
  uploadedAt: string;
  sizeBytes: number;
  /** Extracted fields (backend: document_fields). Synthetic in the prototype. */
  fields: DocumentField[];
}

export interface ConfirmedFact {
  text: string;
  source?: DocumentType;
  documentId?: string;
  verification: Verification;
}

export interface UserReported {
  text: string;
  verification: "USER_REPORTED";
}

export interface DetectedIssue {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  verification: Verification;
  status?: "OPEN" | "ADDRESSED";
}

export interface Inference {
  text: string;
  /** Internal model confidence. The UI never shows it as a percentage (contract §43). */
  confidence: number;
  verification: "AI_INFERENCE";
}

export interface Unknown {
  text: string;
  verification: "UNKNOWN";
}

export interface RequiredDocument {
  name: string;
  status: "REQUIRED" | "PROVIDED";
}

export interface NextStep {
  step: number;
  title: string;
  description: string;
}

export interface Analysis {
  confirmedFacts: ConfirmedFact[];
  userReported: UserReported[];
  detectedIssues: DetectedIssue[];
  inferences: Inference[];
  unknowns: Unknown[];
  requiredDocuments: RequiredDocument[];
  nextSteps: NextStep[];
}

export interface BlockerEvidence {
  documentId: string;
  field: string;
  value: string;
}

export interface Blocker {
  id: string;
  title: string;
  category: "DOCUMENT_MISMATCH" | "MISSING_DOCUMENT" | "OFFICIAL_DEFICIENCY";
  severity: Severity;
  status: "OPEN" | "ADDRESSED";
  evidence: BlockerEvidence[];
  verification: Verification;
}

export type PlanAction =
  | "VERIFY_INFORMATION"
  | "PREPARE_DOCUMENT"
  | "PREPARE_CORRECTION"
  | "RESUBMIT"
  | "MONITOR";

export interface PlanStep {
  step: number;
  action: PlanAction;
  description: string;
  /** Who performs the step. Frontend renders it; backend supplies it. */
  actor: "WORKER" | "AGENT" | "WORKER_AND_AGENT";
}

export interface RecoveryPlan {
  planId: string;
  status: "AWAITING_APPROVAL" | "APPROVED" | "DECLINED";
  summary: string;
  steps: PlanStep[];
  requiresUserApproval: boolean;
}

export interface Submission {
  referenceId: string;
  status: CaseStatus;
  submittedAt: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type:
    | "CASE_CREATED"
    | "DOCUMENT_UPLOADED"
    | "ANALYSIS_COMPLETED"
    | "ISSUE_DETECTED"
    | "PLAN_CREATED"
    | "PLAN_APPROVED"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "RESUBMISSION_REQUIRED"
    | "DELAY_NOTED"
    | "FOLLOW_UP_PREPARED"
    | "ESCALATED"
    | "RESOLVED";
  title: string;
  detail?: string;
  simulation?: boolean;
}

export type SimulationScenario = "SUCCESS" | "SECOND_REJECTION" | "DELAY" | "ESCALATION";

export interface FollowUp {
  followUpId: string;
  status: "PREPARED";
  simulation: true;
  type: "REQUEST_CLARIFICATION";
  message: string;
}

export interface EscalationPacket {
  caseSummary: string;
  documents: string[];
  timeline: string[];
  attempts: string[];
  remainingIssue: string;
}

export interface Escalation {
  escalationId: string;
  status: "ESCALATED";
  reason: string;
  destination: string;
  packet: EscalationPacket;
}

/** "Most important shared object" (contract §53) plus the fields the UI needs around it. */
export interface CaseFile {
  case: CaseRecord;
  documents: DocumentRecord[];
  analysis: Analysis | null;
  blockers: Blocker[];
  plan: RecoveryPlan | null;
  submission: Submission | null;
  followUp: FollowUp | null;
  escalation: Escalation | null;
  timeline: TimelineEvent[];
  userStatement: { alreadySubmitted: boolean; note: string };
  /** 0 = first analysis, 1 = after a second rejection. */
  attempts: number;
  /** Latest simulated authority response, if any. */
  latestResponse: { scenario: SimulationScenario; receivedAt: string; text: string } | null;
}

export interface ApiError {
  code:
    | "CASE_NOT_FOUND"
    | "DOCUMENT_NOT_FOUND"
    | "INVALID_FILE_TYPE"
    | "FILE_TOO_LARGE"
    | "ANALYSIS_FAILED"
    | "AI_SERVICE_UNAVAILABLE"
    | "INVALID_CASE_STATE"
    | "APPROVAL_REQUIRED"
    | "INVALID_REQUEST"
    | "SIMULATION_ERROR"
    | "INTERNAL_ERROR";
  message: string;
}
