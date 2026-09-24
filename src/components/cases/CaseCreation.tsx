import { useState } from 'react'
import { createCase } from '../../api/cases'
import { ApiError } from '../../api/client'
import { Icon } from '../common/Icon'

interface Props { open: boolean; onClose: () => void; onCreated: (caseId: string) => void; initialDescription: string; selectedFileCount: number }
export function CaseCreation({ open, onClose, onCreated, initialDescription, selectedFileCount }: Props) {
  const [form, setForm] = useState({ applicantName: '', company: '', role: '', applicationDate: '', status: '', description: initialDescription })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!open) return null
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      const result = await createCase({ applicant_name: form.applicantName, company: form.company, role: form.role, application_date: form.applicationDate || undefined, current_status: form.status, description: form.description })
      onCreated(result.id)
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Unable to create your case.') }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><section className="case-modal" role="dialog" aria-modal="true" aria-labelledby="case-title">
    <div className="modal-head"><div><span className="eyebrow">A FRESH START</span><h2 id="case-title">Tell us what happened</h2><p>Start with the details you know. You can add evidence next.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close"/></button></div>
    <form onSubmit={submit} className="case-form"><div className="form-grid"><label>Applicant name<input required value={form.applicantName} onChange={e => update('applicantName', e.target.value)} placeholder="Your name" /></label><label>Company<input required value={form.company} onChange={e => update('company', e.target.value)} placeholder="Where did you apply?" /></label><label>Role / position<input required value={form.role} onChange={e => update('role', e.target.value)} placeholder="e.g. Product design intern" /></label><label>Application date <span className="optional">Optional</span><input type="date" value={form.applicationDate} onChange={e => update('applicationDate', e.target.value)} /></label></div>
      <label>What is happening with your application?<select required value={form.status} onChange={e => update('status', e.target.value)}><option value="" disabled>Select the closest match</option><option>Rejected</option><option>No response</option><option>Action required</option><option>Application incomplete</option><option>Other</option></select></label>
      <label>What went wrong?<textarea required rows={4} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Share the details that might help us understand what happened…" /></label>
      {selectedFileCount > 0 && <p className="selected-evidence-note"><Icon name="attach" size={14}/>{selectedFileCount} file{selectedFileCount === 1 ? '' : 's'} selected. You can review and upload them after creating the case.</p>}
      {error && <div className="form-error" role="alert"><span>{error}</span>{error.includes('Backend') && <small>Your draft is still here. Connect to the API to submit it.</small>}</div>}
      <div className="modal-foot"><span>Your information is only sent when you submit.</span><button className="button button-primary" disabled={busy}>{busy ? 'Connecting…' : 'Create case'}<Icon name="arrow" size={16}/></button></div>
    </form>
  </section></div>
}
