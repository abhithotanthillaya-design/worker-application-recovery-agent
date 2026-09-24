import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getCase } from '../../api/cases'
import { getDocuments, uploadDocument } from '../../api/documents'
import { getAnalysis, getRecoverability } from '../../api/analysis'
import { getRecoveryPlan, getTimeline } from '../../api/recovery'
import type { CaseDocument } from '../../types'
import { AgentActivity } from '../agent/AgentActivity'
import { AnalysisResult } from '../agent/AnalysisResult'
import { RecoverabilityCard } from '../agent/Recoverability'
import { RecoveryPlanCard } from '../agent/RecoveryPlan'
import { Timeline } from '../agent/Timeline'
import { ApprovalCard } from '../agent/ApprovalCard'
import { RemoteState } from '../common/RemoteState'
import { Icon } from '../common/Icon'

type Resource<T> = { data?: T; error?: string; loading: boolean }
function useResource<T>(load: () => Promise<T>, refresh: number, caseId: string): Resource<T> {
  const [state, setState] = useState<Resource<T>>({ loading: true })
  useEffect(() => {
    let current = true
    setState({ loading: true })
    load().then(data => { if (current) setState({ data, loading: false }) }).catch(error => { if (current) setState({ error: error instanceof Error ? error.message : 'Unable to load this information.', loading: false }) })
    return () => { current = false }
  // A resource is scoped to this mounted case view. Refresh is the explicit refetch trigger.
  }, [caseId, refresh])
  return state
}

function ResourceBlock<T>({ resource, loading, error, children, retry }: { resource: Resource<T>; loading: string; error: string; children: (data: T) => ReactNode; retry: () => void }) {
  if (resource.loading) return <RemoteState message={loading}/>
  if (resource.error) return <RemoteState message={loading} error={resource.error || error} retry={retry}/>
  if (resource.data === undefined) return <RemoteState message={loading} error={error} retry={retry}/>
  return <>{children(resource.data)}</>
}

export function CaseWorkspace({ caseId, onBack, pendingFiles = [] }: { caseId: string; onBack: () => void; pendingFiles?: File[] }) {
  const [refresh, setRefresh] = useState(0)
  const [files, setFiles] = useState<File[]>(pendingFiles)
  const [fileType, setFileType] = useState('Other')
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const caseResource = useResource(() => getCase(caseId), refresh, caseId)
  const docsResource = useResource(() => getDocuments(caseId), refresh, caseId)
  const analysisResource = useResource(() => getAnalysis(caseId), refresh, caseId)
  const recoverabilityResource = useResource(() => getRecoverability(caseId), refresh, caseId)
  const planResource = useResource(() => getRecoveryPlan(caseId), refresh, caseId)
  const timelineResource = useResource(() => getTimeline(caseId), refresh, caseId)
  const reload = () => setRefresh(value => value + 1)
  const submitFiles = async () => {
    setUploading(true); setUploadError('')
    try { for (const file of files) await uploadDocument(caseId, file, fileType); setFiles([]); reload() }
    catch (error) { setUploadError(error instanceof Error ? error.message : 'Unable to upload document.'); }
    finally { setUploading(false) }
  }
  const addFiles = (picked: FileList | null) => {
    if (!picked) return
    const valid = Array.from(picked).filter(file => /\.(pdf|png|jpe?g)$/i.test(file.name) && file.size <= 10 * 1024 * 1024)
    if (valid.length !== picked.length) setUploadError('Only PDF, PNG or JPG files up to 10 MB are supported.')
    setFiles(current => [...current, ...valid])
  }

  return <main className="case-page">
    <button className="back-link" onClick={onBack}>← <span>All cases</span></button>
    <ResourceBlock resource={caseResource} loading="Loading case…" error="Unable to load this case." retry={reload}>{item => <>
      <header className="case-header"><div><span className="eyebrow">APPLICATION CASE</span><h1>{item.role || 'Application case'}</h1><p>{item.company || 'Company not provided'} <span>·</span> Case {item.id} <span>·</span> Updated {new Date(item.lastUpdated).toLocaleString()}</p></div><div className="case-head-status"><span className="status-dot"/>{item.status.replace(/_/g, ' ')}</div></header>
      {(item.status === 'ACTION_REQUIRED' || item.status === 'RESUBMISSION_REQUIRED') && <div className="recovery-loop-notice"><Icon name="spark" size={17}/><div><b>There’s a new step to review</b><p>The backend has marked this case as requiring action. Check the latest timeline and plan below.</p></div></div>}
      {item.status === 'RESOLVED' && <section className="resolution-state"><span className="resolution-check">✓</span><div><span className="eyebrow">CASE RESOLVED</span><h2>Application recovered</h2><p>The backend has marked this application case as resolved.</p></div></section>}
      {(item.status === 'ESCALATION_REQUIRED' || item.status === 'ESCALATED') && <section className="escalation-state"><span className="escalation-icon">!</span><div><span className="eyebrow">MANUAL FOLLOW-UP</span><h2>{item.status === 'ESCALATED' ? 'Case escalated' : 'Recovery unsuccessful'}</h2><p>The backend indicates this case needs manual follow-up. Review the application history, employer responses, documents, and timeline below.</p></div></section>}
      <div className="case-columns"><div className="case-main-stack">
        <AgentActivity status={item.status}/>
        <ResourceBlock resource={analysisResource} loading="Loading investigation…" error="Analysis could not be loaded." retry={reload}>{analysis => <AnalysisResult analysis={analysis}/>}</ResourceBlock>
        <ResourceBlock resource={recoverabilityResource} loading="Loading recoverability…" error="Recoverability could not be loaded." retry={reload}>{data => <RecoverabilityCard data={data}/>}</ResourceBlock>
        <ResourceBlock resource={planResource} loading="Preparing recovery plan…" error="Recovery plan could not be loaded." retry={reload}>{plan => <><RecoveryPlanCard plan={plan}/>{plan.approval && <ApprovalCard caseId={caseId} approval={plan.approval}/>}</>}</ResourceBlock>
        <section className="agent-panel documents-panel"><div className="panel-heading"><div><span className="eyebrow">APPLICATION EVIDENCE</span><h2>Documents</h2></div><label className="button button-secondary button-small upload-label"><Icon name="attach" size={14}/>Add files<input type="file" hidden multiple accept=".pdf,.png,.jpg,.jpeg" onChange={event => addFiles(event.target.files)}/></label></div>
          <label className="document-type-label">Document type<select value={fileType} onChange={event => setFileType(event.target.value)}><option>Resume</option><option>Job Description</option><option>Application Confirmation</option><option>Employer Message</option><option>Other</option></select></label>
          {files.map((file, index) => <div className="document-row" key={`${file.name}-${index}`}><Icon name="file" size={17}/><span><b>{file.name}</b><small>{(file.size / 1024 / 1024).toFixed(1)} MB · Selected</small></span><button className="remove-file" onClick={() => setFiles(list => list.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`}><Icon name="close" size={15}/></button></div>)}
          {files.length > 0 && <button className="button button-primary button-small" disabled={uploading} onClick={submitFiles}>{uploading ? 'Uploading…' : 'Upload selected files'}</button>}{uploadError && <p className="document-error" role="alert">{uploadError}</p>}
          <ResourceBlock resource={docsResource} loading="Loading documents…" error="Unable to load documents." retry={reload}>{documents => documents.length ? documents.map((doc: CaseDocument) => <div className="document-row" key={doc.id}><Icon name="file" size={17}/><span><b>{doc.filename}</b><small>{doc.type} · {(doc.size / 1024 / 1024).toFixed(1)} MB</small></span><span className="document-state">{doc.state}</span></div>) : <p className="panel-empty">No documents uploaded yet.</p>}</ResourceBlock>
        </section>
      </div><aside className="case-side-stack"><ResourceBlock resource={timelineResource} loading="Loading timeline…" error="Timeline could not be loaded." retry={reload}>{events => <Timeline events={events}/>}</ResourceBlock><div className="case-assurance"><Icon name="shield" size={17}/><div><b>You’re in control</b><p>Every action that reaches an employer requires your explicit approval.</p></div></div></aside></div>
    </>}</ResourceBlock>
  </main>
}
