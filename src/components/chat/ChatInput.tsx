import { useRef } from 'react'
import { Icon } from '../common/Icon'

interface Props { value: string; onChange: (value: string) => void; onStartCase: (description: string) => void; onAttachment: (files: File[]) => void }
export function ChatInput({ value, onChange, onStartCase, onAttachment }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const submit = () => { if (value.trim()) onStartCase(value.trim()) }
  return <div className="composer-wrap"><div className="composer"><textarea aria-label="Describe what happened with your application" rows={2} value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} placeholder="Tell me what happened with your application…" />
    <div className="composer-tools"><div className="composer-left"><button className="attach-button" onClick={() => input.current?.click()} aria-label="Attach evidence"><Icon name="attach" size={18}/><span>Add evidence</span></button><span className="file-note">PDF, PNG or JPG · up to 10 MB</span></div><button className={`send-button ${value.trim() ? 'send-ready' : ''}`} aria-label="Start a case" onClick={submit} disabled={!value.trim()}><Icon name="arrow" size={19}/></button><input ref={input} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" multiple hidden onChange={e => { if (e.target.files) onAttachment(Array.from(e.target.files)); e.target.value = '' }} /></div>
    </div><p className="composer-disclaimer">Submitting a case shares these details with WorkRecover. Employer actions always need your approval.</p></div>
}
