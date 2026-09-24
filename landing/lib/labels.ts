import type { CaseStatus, DocumentType, PlanAction, SimulationScenario, Verification } from "./types";

export const DOCUMENT_LABEL: Record<DocumentType, string> = {
  APPLICATION: "Application",
  REJECTION_NOTICE: "Rejection notice",
  IDENTITY: "Identity document",
  BANK: "Bank document",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

export const REQUIRED_DOCUMENT_TYPES: DocumentType[] = ["APPLICATION", "REJECTION_NOTICE", "IDENTITY", "BANK"];
export const UPLOAD_SLOTS: DocumentType[] = ["APPLICATION", "REJECTION_NOTICE", "IDENTITY", "BANK", "OTHER"];

export const DOCUMENT_HINT: Record<DocumentType, string> = {
  APPLICATION: "The acknowledgement or form you submitted",
  REJECTION_NOTICE: "The return, rejection or deficiency message",
  IDENTITY: "Identity proof. Numbers are masked on screen",
  BANK: "Passbook page or bank statement header",
  CERTIFICATE: "Any supporting certificate",
  OTHER: "Anything else that relates to this application",
};

/** Plain-language names for the four evidence levels. */
export const VERIFICATION_LABEL: Record<Verification, string> = {
  DOCUMENT_CONFIRMED: "Confirmed",
  USER_REPORTED: "Your information",
  DOCUMENT_COMPARISON: "Possible issue",
  AI_INFERENCE: "AI inference",
  UNKNOWN: "Unknown",
};

export const ACTION_LABEL: Record<PlanAction, string> = {
  VERIFY_INFORMATION: "Verify information",
  PREPARE_DOCUMENT: "Prepare document",
  PREPARE_CORRECTION: "Prepare correction",
  RESUBMIT: "Submit correction",
  MONITOR: "Monitor response",
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  CREATED: "Case created",
  DOCUMENTS_PENDING: "Documents needed",
  ANALYZING: "Analyzing",
  ISSUE_FOUND: "Possible issue found",
  ACTION_REQUIRED: "Action required",
  AWAITING_APPROVAL: "Awaiting your approval",
  SUBMITTED: "Submitted (simulated)",
  UNDER_REVIEW: "Under review (simulated)",
  RESUBMISSION_REQUIRED: "Resubmission required",
  RESUBMITTED: "Resubmitted",
  RESOLVED: "Resolved",
  ISSUE_PERSISTS: "Issue persists",
  ESCALATION_REQUIRED: "Escalation required",
  ESCALATED: "Escalated to a human",
};

export const SCENARIO_LABEL: Record<SimulationScenario, string> = {
  SUCCESS: "Approved",
  SECOND_REJECTION: "Rejected again",
  DELAY: "Delayed",
  ESCALATION: "Stuck",
};

export const SCENARIO_ORDER: SimulationScenario[] = ["SUCCESS", "SECOND_REJECTION", "DELAY", "ESCALATION"];
