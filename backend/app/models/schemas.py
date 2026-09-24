"""Pydantic schemas matching the exact frontend contracts."""
from typing import Any, Literal
from pydantic import BaseModel, Field

# Application Status Types
ApplicationStatus = Literal[
    "CREATED",
    "DOCUMENTS_PENDING",
    "ANALYZING",
    "ISSUE_FOUND",
    "ACTION_REQUIRED",
    "AWAITING_APPROVAL",
    "SUBMITTED",
    "UNDER_REVIEW",
    "RESUBMISSION_REQUIRED",
    "RESUBMITTED",
    "RESOLVED",
    "ESCALATION_REQUIRED",
    "ESCALATED",
]

# Document State Types
DocumentState = Literal[
    "SELECTED",
    "UPLOADING",
    "UPLOADED",
    "PROCESSING",
    "READY",
    "FAILED",
]

# Recoverability Status Types
RecoverabilityStatus = Literal[
    "RECOVERABLE",
    "ACTIONABLE_UNCERTAIN",
    "CLOSED",
]

# Simulation Scenarios
SimulationScenario = Literal[
    "SUCCESS",
    "SECOND_REJECTION",
    "DELAY",
    "ESCALATION",
]


class ApplicationCase(BaseModel):
    id: str
    company: str
    role: str
    status: ApplicationStatus
    lastUpdated: str


class CreateCaseRequest(BaseModel):
    applicant_name: str | None = None
    company: str
    role: str
    application_date: str | None = None
    current_status: str | None = None
    description: str | None = None


class CaseDocument(BaseModel):
    id: str
    filename: str
    type: str
    size: int
    state: DocumentState


class EvidenceItem(BaseModel):
    text: str
    evidence: str | None = None


class Analysis(BaseModel):
    confirmedFacts: list[EvidenceItem] = Field(default_factory=list)
    userReported: list[EvidenceItem] = Field(default_factory=list)
    detectedIssues: list[EvidenceItem] = Field(default_factory=list)
    inferences: list[EvidenceItem] = Field(default_factory=list)
    unknowns: list[EvidenceItem] = Field(default_factory=list)


class Recoverability(BaseModel):
    status: RecoverabilityStatus
    reason: str
    evidence: list[EvidenceItem] = Field(default_factory=list)


class RecoveryStep(BaseModel):
    id: str
    title: str
    description: str | None = None
    status: Literal["pending", "active", "completed", "failed"]


class Approval(BaseModel):
    action: str
    message: str
    status: str


class RecoveryPlan(BaseModel):
    planId: str
    status: str
    summary: str
    steps: list[RecoveryStep] = Field(default_factory=list)
    requiresUserApproval: bool = True
    approval: Approval | None = None


class TimelineEvent(BaseModel):
    id: str
    timestamp: str
    type: str
    title: str
    message: str | None = None
    status: str


class ApprovalRequest(BaseModel):
    message: str | None = None
    approved: bool = True


class FollowUpRequest(BaseModel):
    message: str


class SimulationRequest(BaseModel):
    scenario: SimulationScenario


class SimulationResponse(BaseModel):
    scenario: SimulationScenario
    caseId: str
    previousStatus: str
    newStatus: str
    message: str
    timestamp: str


class EscalationResponse(BaseModel):
    caseId: str
    status: str
    escalationId: str
    summary: str
    timestamp: str
    dossier: dict[str, Any]


class Profile(BaseModel):
    name: str = ""
    skills: list[str] = Field(default_factory=list)
    resume: str | None = None
    preferences: dict[str, str] = Field(default_factory=dict)
