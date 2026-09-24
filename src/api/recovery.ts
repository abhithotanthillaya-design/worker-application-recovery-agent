import { request } from './client'
import type { RecoveryPlan, TimelineEvent } from '../types'

export const getRecoveryPlan = (caseId: string) => request<RecoveryPlan>(`/cases/${encodeURIComponent(caseId)}/recovery-plan`)
export const approveRecoveryPlan = (caseId: string, payload: unknown) => request(`/cases/${encodeURIComponent(caseId)}/approval`, { method: 'POST', body: JSON.stringify(payload) })
export const draftFollowUp = (caseId: string) => request(`/cases/${encodeURIComponent(caseId)}/follow-up/draft`, { method: 'POST' })
export const submitFollowUp = (caseId: string, message: string) => request(`/cases/${encodeURIComponent(caseId)}/follow-up`, { method: 'POST', body: JSON.stringify({ message }) })
export const getTimeline = (caseId: string) => request<TimelineEvent[]>(`/cases/${encodeURIComponent(caseId)}/timeline`)
export const escalateCase = (caseId: string) => request(`/cases/${encodeURIComponent(caseId)}/escalate`, { method: 'POST' })
