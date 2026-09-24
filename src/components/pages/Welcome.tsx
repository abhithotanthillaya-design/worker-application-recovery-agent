import { useState } from 'react'
import { ChatInput } from '../chat/ChatInput'
import { SelectedFiles, type SelectedFile } from '../documents/SelectedFiles'
import { Icon } from '../common/Icon'
import { ProcessStrip } from '../agent/ProcessStrip'

const suggestions = [
  { text: 'My internship application was rejected', icon: '↗' },
  { text: 'I haven’t heard back after applying', icon: '◷' },
  { text: 'They asked me for something I don’t understand', icon: '✳' },
  { text: 'My application says incomplete', icon: '▤' },
]

export function Welcome({ onStartCase, onAttachment }: { onStartCase: (description: string) => void; onAttachment: (files: File[]) => void }) {
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [description, setDescription] = useState('')
  const [fileError, setFileError] = useState('')
  const attach = (picked: File[]) => {
    const allowed = picked.filter(file => /\.(pdf|png|jpe?g)$/i.test(file.name) && file.size <= 10 * 1024 * 1024)
    const invalid = picked.length - allowed.length
    setFileError(invalid ? 'Choose PDF, PNG or JPG files up to 10 MB each.' : '')
    const next = [...files, ...allowed.map(file => ({ file, id: crypto.randomUUID() }))]
    setFiles(next)
    onAttachment(next.map(item => item.file))
  }
  return <main className="welcome-page">
    <div className="welcome-orb orb-blue"/><div className="welcome-orb orb-cream"/>
    <div className="welcome-inner"><div className="welcome-badge"><span className="badge-icon"><Icon name="spark" size={15}/></span><span>A little clarity, when you need it</span><span className="badge-dot">·</span><span className="badge-muted">Your application recovery agent</span></div>
      <h1>What happened with<br/>your <span>application?</span></h1>
      <p className="welcome-subtitle">Tell me what went wrong and I’ll help you understand what happened<br className="desktop-break"/> and find the next legitimate step.</p>
      <div className="welcome-compose"><ChatInput value={description} onChange={setDescription} onStartCase={onStartCase} onAttachment={attach}/>{fileError && <p className="document-error" role="alert">{fileError}</p>}<SelectedFiles files={files} onRemove={id => { const next = files.filter(item => item.id !== id); setFiles(next); onAttachment(next.map(item => item.file)) }}/></div>
      <div className="suggestions"><span className="suggestions-label">NOT SURE WHERE TO START?</span><div className="suggestion-grid">{suggestions.map(suggestion => <button className="suggestion-chip" key={suggestion.text} onClick={() => setDescription(suggestion.text)}><span className="suggestion-icon">{suggestion.icon}</span>{suggestion.text}<Icon name="chevron" size={14}/></button>)}</div></div>
      <div className="welcome-divider"><span/><span>HERE’S HOW WE CAN HELP</span><span/></div>
      <ProcessStrip/>
      <div className="welcome-footnote"><Icon name="shield" size={14}/> You’re in control. Employer actions always need your approval.</div>
    </div>
  </main>
}
