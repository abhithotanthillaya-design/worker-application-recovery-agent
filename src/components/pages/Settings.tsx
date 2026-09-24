import { useState } from 'react'
import { Icon } from '../common/Icon'

export function Settings() {
  const [notifications, setNotifications] = useState(true)
  const [appearance, setAppearance] = useState('Light')
  return <main className="secondary-page"><div className="page-intro"><span className="eyebrow">YOUR WORKSPACE</span><h1>Settings</h1><p>A few simple ways to make WorkRecover feel right for you.</p></div>
    <section className="settings-card"><div className="settings-row"><div className="settings-copy"><h3>Appearance</h3><p>Choose how WorkRecover looks on this device.</p></div><select value={appearance} onChange={e => setAppearance(e.target.value)} aria-label="Appearance"><option>Light</option><option>System</option></select></div>
      <div className="settings-row"><div className="settings-copy"><h3>Notifications</h3><p>Updates when there’s movement on a recovery case.</p></div><button className={`toggle ${notifications ? 'toggle-on' : ''}`} role="switch" aria-checked={notifications} aria-label="Notifications" onClick={() => setNotifications(value => !value)}><span/></button></div>
      <div className="settings-row"><div className="settings-copy"><h3>Data & privacy</h3><p>Your application evidence is used only to support your recovery case.</p></div><span className="privacy-pill"><Icon name="shield" size={14}/> Private by design</span></div>
    </section>
  </main>
}
