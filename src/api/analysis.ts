import { pendingIntegration, request } from './client'
import type { Analysis, Recoverability } from '../types'

export const getAnalysis = (caseId: string) => request<Analysis>(`/cases/${encodeURIComponent(caseId)}/analysis`)
export const getRecoverability = (caseId: string) => request<Recoverability>(`/cases/${encodeURIComponent(caseId)}/recoverability`)
export const startAnalysis = (_caseId: string) => pendingIntegration()
