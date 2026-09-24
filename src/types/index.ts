export type ApplicationStatus = 'CREATED' | 'DOCUMENTS_PENDING' | 'ANALYZING' | 'ISSUE_FOUND' | 'ACTION_REQUIRED' | 'AWAITING_APPROVAL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESUBMISSION_REQUIRED' | 'RESUBMITTED' | 'RESOLVED' | 'ESCALATION_REQUIRED' | 'ESCALATED'
export interface ApplicationCase { id: string; company: string; role: string; status: ApplicationStatus; lastUpdated: string }
export type DocumentState = 'SELECTED' | 'UPLOADING' | 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED'
export interface CaseDocument { id: string; filename: string; type: string; size: number; state: DocumentState }
export interface EvidenceItem { text: string; evidence?: string }
export type ConfirmedFact = EvidenceItem
export type UserReportedItem = EvidenceItem
export type DetectedIssue = EvidenceItem
export type Inference = EvidenceItem
export type Unknown = EvidenceItem
export interface Analysis { confirmedFacts: ConfirmedFact[]; userReported: UserReportedItem[]; detectedIssues: DetectedIssue[]; inferences: Inference[]; unknowns: Unknown[] }
export interface Recoverability { status: 'RECOVERABLE' | 'ACTIONABLE_UNCERTAIN' | 'CLOSED'; reason: string; evidence: EvidenceItem[] }
export interface RecoveryStep { id: string; title: string; description?: string; status: 'pending' | 'active' | 'completed' | 'failed' }
export interface Approval { action: string; message: string; status: string }
export interface RecoveryPlan { planId: string; status: string; summary: string; steps: RecoveryStep[]; requiresUserApproval: boolean; approval?: Approval }
export interface TimelineEvent { id: string; timestamp: string; type: string; title: string; message?: string; status: string }
