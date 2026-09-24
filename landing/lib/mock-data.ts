import type {
  Analysis,
  Blocker,
  DocumentField,
  DocumentRecord,
  DocumentType,
  EscalationPacket,
  RecoveryPlan,
} from "./types";

/* ----------------------------------------------------------------------------
   Synthetic demo data. Nothing here describes a real person, account or notice.
   Shapes follow the frontend/backend contract so real responses can replace it.
   ---------------------------------------------------------------------------- */

export const DEMO_WORKER = {
  workerName: "Ramesh Kumar",
  state: "Karnataka",
  scheme: "BOCW Education Assistance",
};

export const SCHEMES = ["BOCW Education Assistance"];
export const STATES = ["Karnataka"];

export const SIM_REFERENCE_ID = "MOCK-BOCW-78241";

/** Fields the (mock) extraction returns per document type. */
export const DEMO_FIELDS: Record<DocumentType, DocumentField[]> = {
  APPLICATION: [
    { field: "name", label: "Applicant name", value: "Ramesh Kumar" },
    { field: "applicationNo", label: "Application no.", value: "APP-2026-118432" },
    { field: "registrationNo", label: "Worker registration", value: "BOCW/KA/21/004182" },
    { field: "scheme", label: "Benefit applied for", value: "BOCW Education Assistance" },
    { field: "beneficiary", label: "Beneficiary", value: "Daughter, Class 9" },
    { field: "submittedOn", label: "Submitted on", value: "12 Aug 2026" },
    { field: "bankAccount", label: "Bank account", value: "XXXXXX4417" },
  ],
  BANK: [
    { field: "name", label: "Account holder", value: "Ramesh K." },
    { field: "bankName", label: "Bank", value: "Demo Cooperative Bank" },
    { field: "branch", label: "Branch", value: "Mangaluru Main" },
    { field: "accountNo", label: "Account no.", value: "XXXXXX4417" },
    { field: "ifsc", label: "IFSC", value: "DEMO0001234" },
  ],
  IDENTITY: [
    { field: "name", label: "Name", value: "Ramesh Kumar" },
    { field: "idNumber", label: "ID number", value: "XXXX XXXX 6031" },
    { field: "yearOfBirth", label: "Year of birth", value: "1988" },
  ],
  REJECTION_NOTICE: [
    { field: "noticeNo", label: "Notice no.", value: "RN-2026-055219" },
    { field: "applicationNo", label: "Application no.", value: "APP-2026-118432" },
    { field: "noticeDate", label: "Notice date", value: "9 Sep 2026" },
    { field: "status", label: "Status", value: "Returned" },
    { field: "reason", label: "Reason given", value: "Bank-related document requires correction." },
    { field: "window", label: "Time allowed", value: "30 days from the notice date" },
  ],
  CERTIFICATE: [{ field: "title", label: "Certificate", value: "Supporting certificate" }],
  OTHER: [{ field: "title", label: "Document", value: "Supporting document" }],
};

export const DEMO_FILENAMES: Record<DocumentType, string> = {
  APPLICATION: "application.pdf",
  BANK: "bank_document.pdf",
  IDENTITY: "identity.pdf",
  REJECTION_NOTICE: "rejection_notice.pdf",
  CERTIFICATE: "certificate.pdf",
  OTHER: "other.pdf",
};

export const SECOND_RESPONSE_TEXT =
  "Corrected bank document received. The document is not acceptable without the issuing branch's seal and signature. Submit an attested copy through the district labour office.";

export const DELAY_RESPONSE_TEXT =
  "No response has been recorded within the expected review window. The application is still marked under review.";

const docIdByType = (docs: DocumentRecord[], type: DocumentType) =>
  docs.find((d) => d.documentType === type)?.documentId ?? "DOC-000";

export function buildAnalysis(
  docs: DocumentRecord[],
  userStatement: { alreadySubmitted: boolean; note: string },
  attempts: number,
): Analysis {
  const noticeId = docIdByType(docs, "REJECTION_NOTICE");
  const appId = docIdByType(docs, "APPLICATION");
  const idId = docIdByType(docs, "IDENTITY");

  const userReported: Analysis["userReported"] = [];
  if (userStatement.alreadySubmitted) {
    userReported.push({
      text: "You reported that the bank document was already submitted with the original application.",
      verification: "USER_REPORTED",
    });
  }
  if (userStatement.note.trim()) {
    userReported.push({ text: `You added: “${userStatement.note.trim()}”`, verification: "USER_REPORTED" });
  }

  const base: Analysis = {
    confirmedFacts: [
      {
        text: "The rejection notice states that a bank-related document requires correction.",
        source: "REJECTION_NOTICE",
        documentId: noticeId,
        verification: "DOCUMENT_CONFIRMED",
      },
      {
        text: "The notice allows 30 days from 9 Sep 2026 to submit corrected documents.",
        source: "REJECTION_NOTICE",
        documentId: noticeId,
        verification: "DOCUMENT_CONFIRMED",
      },
      {
        text: "The application and the identity document both give the name “Ramesh Kumar”.",
        source: "APPLICATION",
        documentId: appId,
        verification: "DOCUMENT_CONFIRMED",
      },
    ],
    userReported,
    detectedIssues: [
      {
        id: "ISSUE-001",
        title: "Possible name mismatch",
        description: "The application contains “Ramesh Kumar” while the bank document contains “Ramesh K.”",
        severity: "HIGH",
        verification: "DOCUMENT_COMPARISON",
        status: "OPEN",
      },
    ],
    inferences: [
      {
        text: "The name mismatch may have contributed to the application problem.",
        confidence: 0.82,
        verification: "AI_INFERENCE",
      },
    ],
    unknowns: [
      {
        text: "The available documents do not prove that the name mismatch was the official reason for rejection.",
        verification: "UNKNOWN",
      },
      {
        text: "The notice does not say which bank-related detail needs correction.",
        verification: "UNKNOWN",
      },
    ],
    requiredDocuments: [{ name: "Corrected bank document", status: "REQUIRED" }],
    nextSteps: [
      { step: 1, title: "Verify the correct name", description: "Confirm the name that should be used for the application." },
      {
        step: 2,
        title: "Prepare corrected document",
        description: "Obtain the appropriate corrected or supporting bank document.",
      },
    ],
  };

  if (attempts < 1) return base;

  // After the second (simulated) rejection the backend adds a new, officially stated issue.
  return {
    ...base,
    confirmedFacts: [
      ...base.confirmedFacts,
      {
        text: "The latest simulated response states that the corrected bank document needs the issuing branch's seal and signature.",
        source: "REJECTION_NOTICE",
        documentId: "RESP-002",
        verification: "DOCUMENT_CONFIRMED",
      },
    ],
    detectedIssues: [
      { ...base.detectedIssues[0], status: "ADDRESSED" },
      {
        id: "ISSUE-002",
        title: "Corrected bank document is not attested",
        description:
          "The second response asks for a branch-attested copy, submitted through the district labour office.",
        severity: "HIGH",
        verification: "DOCUMENT_CONFIRMED",
        status: "OPEN",
      },
    ],
    inferences: [
      {
        text: "The name correction appears to have been accepted, because the new response no longer mentions the name.",
        confidence: 0.64,
        verification: "AI_INFERENCE",
      },
    ],
    unknowns: [
      {
        text: "The response does not say whether the earlier name mismatch was formally cleared.",
        verification: "UNKNOWN",
      },
      {
        text: "It is not stated whether the original 30-day window is extended after a second return.",
        verification: "UNKNOWN",
      },
    ],
    requiredDocuments: [{ name: "Branch-attested corrected bank document", status: "REQUIRED" }],
    nextSteps: [
      {
        step: 1,
        title: "Get the branch seal and signature",
        description: "This needs an in-person visit to the bank branch. The agent cannot do it for you.",
      },
      {
        step: 2,
        title: "Hand the attested copy to the labour office",
        description: "A human at the district labour office has to accept it. Escalation prepares the file.",
      },
    ],
  };
}

export function buildBlockers(docs: DocumentRecord[], attempts: number): Blocker[] {
  const appId = docIdByType(docs, "APPLICATION");
  const bankId = docIdByType(docs, "BANK");
  const blockers: Blocker[] = [
    {
      id: "ISSUE-001",
      title: "Possible name mismatch",
      category: "DOCUMENT_MISMATCH",
      severity: "HIGH",
      status: attempts >= 1 ? "ADDRESSED" : "OPEN",
      evidence: [
        { documentId: appId, field: "name", value: "Ramesh Kumar" },
        { documentId: bankId, field: "name", value: "Ramesh K." },
      ],
      verification: "DOCUMENT_COMPARISON",
    },
  ];
  if (attempts >= 1) {
    blockers.push({
      id: "ISSUE-002",
      title: "Corrected bank document is not attested",
      category: "OFFICIAL_DEFICIENCY",
      severity: "HIGH",
      status: "OPEN",
      evidence: [{ documentId: "RESP-002", field: "deficiency", value: "Branch seal and signature missing" }],
      verification: "DOCUMENT_CONFIRMED",
    });
  }
  return blockers;
}

export function buildPlan(): RecoveryPlan {
  return {
    planId: "PLAN-001",
    status: "AWAITING_APPROVAL",
    summary: "The application appears to have a document and name inconsistency on the bank side.",
    requiresUserApproval: true,
    steps: [
      { step: 1, action: "VERIFY_INFORMATION", description: "Confirm which name is correct.", actor: "WORKER" },
      {
        step: 2,
        action: "PREPARE_DOCUMENT",
        description: "Obtain the corrected supporting bank document.",
        actor: "WORKER_AND_AGENT",
      },
      {
        step: 3,
        action: "PREPARE_CORRECTION",
        description: "Prepare the correction and resubmission details from your confirmed name.",
        actor: "AGENT",
      },
      {
        step: 4,
        action: "RESUBMIT",
        description: "Submit the correction through the applicable official process (simulated here).",
        actor: "AGENT",
      },
      {
        step: 5,
        action: "MONITOR",
        description: "Watch for the response and check whether the problem is actually resolved.",
        actor: "AGENT",
      },
    ],
  };
}

export function buildFollowUpMessage(caseId: string, workerName: string): string {
  return [
    `Subject: Clarification requested on returned application APP-2026-118432 (${caseId})`,
    "",
    `The applicant, ${workerName}, submitted a corrected bank document after the notice dated 9 Sep 2026. The second response asks for a branch-attested copy.`,
    "",
    "Please confirm: (1) whether the earlier name mismatch is now cleared, (2) whether an attested copy can be handed in at the district labour office within the original 30-day window, and (3) what the applicant should bring.",
  ].join("\n");
}

export function buildEscalationPacket(
  docs: DocumentRecord[],
  workerName: string,
  timelineTitles: string[],
): EscalationPacket {
  return {
    caseSummary: `${workerName}'s BOCW Education Assistance application was returned for a bank-document problem. A name difference was corrected and resubmitted, but a second response now requires a branch-attested copy that the agent cannot obtain.`,
    documents: docs.map((d) => d.documentId),
    timeline: timelineTitles,
    attempts: [
      "Attempt 1: bank document name corrected from “Ramesh K.” to “Ramesh Kumar” and resubmitted (simulated).",
      "Follow-up: clarification request prepared, not sent.",
    ],
    remainingIssue: "Corrected bank document lacks the issuing branch's seal and signature.",
  };
}
