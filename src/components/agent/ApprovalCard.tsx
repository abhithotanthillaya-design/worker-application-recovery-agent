import { useState } from 'react'
import { approveRecoveryPlan } from '../../api/recovery'
import { ApiError } from '../../api/client'
import type { Approval } from '../../types'
import { Icon } from '../common/Icon'

export function ApprovalCard({ caseId, approval }: { caseId: string; approval: Approval }) {
  const [message, setMessage] = useState(approval.message)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const approve = async () => { setBusy(true); setError(''); try { await approveRecoveryPlan(caseId, { message }); setSubmitted(true) } catch (err) { setError(err instanceof ApiError ? err.message : 'Unable to submit approval.') } finally { setBusy(false) } }
  return <section className="approval-card"><div className="approval-head"><span className="approval-icon"><Icon name="shield" size={17}/></span><div><span className="eyebrow">YOUR DECISION</span><h2>Review before anything is sent</h2></div></div><div className="approval-action"><small>PROPOSED ACTION</small><b>{approval.action}</b></div><label className="approval-message-label">Message preview<textarea readOnly={!editing} value={message} onChange={e => setMessage(e.target.value)} rows={5} /></label><div className="approval-foot"><span><Icon name="shield" size={14}/> Nothing is sent without your approval.</span><div><button className="button button-secondary button-small" onClick={() => setEditing(value => !value)}>{editing ? 'Done editing' : 'Edit'}</button><button className="button button-primary button-small" onClick={approve} disabled={busy || submitted}>{submitted ? 'Approval recorded' : busy ? 'Connecting…' : 'Approve action'}{!submitted && <Icon name="arrow" size={14}/>}</button></div></div>{submitted && <p className="approval-confirmation" role="status">The backend recorded your approval.</p>}{error && <p className="approval-error" role="alert">{error}</p>}</section>
}
