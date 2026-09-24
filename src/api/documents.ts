import { request } from './client'
import type { CaseDocument } from '../types'

export const getDocuments = (caseId: string) => request<CaseDocument[]>(`/cases/${encodeURIComponent(caseId)}/documents`)
export const uploadDocument = (caseId: string, file: File, type: string) => {
  const form = new FormData()
  form.append('file', file)
  form.append('document_type', type)
  return request<CaseDocument>(`/cases/${encodeURIComponent(caseId)}/documents`, { method: 'POST', body: form })
}
