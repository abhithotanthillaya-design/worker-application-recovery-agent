import { pendingIntegration, request } from './client'
import type { ApplicationCase } from '../types'

export const getCases = () => request<ApplicationCase[]>('/cases')
export const getCase = (caseId: string) => request<ApplicationCase>(`/cases/${encodeURIComponent(caseId)}`)
export const createCase = (payload: unknown) => request<ApplicationCase>('/cases', { method: 'POST', body: JSON.stringify(payload) })
export const getStatus = (caseId: string) => request<ApplicationCase['status']>(`/cases/${encodeURIComponent(caseId)}/status`)
export const startAnalysis = (_caseId: string) => pendingIntegration()
