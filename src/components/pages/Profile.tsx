import { useState } from 'react'
import { Icon } from '../common/Icon'

export function Profile() {
  const [name, setName] = useState('')
  const [skills, setSkills] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  return <main className="secondary-page"><div className="page-intro"><span className="eyebrow">YOUR DETAILS</span><h1>Profile</h1><p>Keep your applicant details together for future recovery cases.</p></div>
    <form className="profile-card" onSubmit={event => event.preventDefault()}><div className="profile-card-head"><div className="avatar-large">{name.trim() ? name.trim().charAt(0).toUpperCase() : 'Y'}</div><div><h2>Basic information</h2><p>Profile details stay in this form until profile saving is connected.</p></div></div>
      <label>Applicant name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></label><label>Skills, separated by commas<input value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Research, Figma, Python" /></label>
      <div className="resume-section"><div><b>Resume</b><small>{resume ? `${resume.name} · selected on this device` : 'Add a resume when creating a recovery case.'}</small></div><label className="button button-secondary button-small upload-label"><Icon name="attach" size={15}/>{resume ? 'Change file' : 'Choose file'}<input type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={e => setResume(e.target.files?.[0] ?? null)} /></label></div>
      <div className="inline-notice"><Icon name="clock" size={15}/> Profile saving will be available when the backend is connected.</div>
    </form>
  </main>
}
