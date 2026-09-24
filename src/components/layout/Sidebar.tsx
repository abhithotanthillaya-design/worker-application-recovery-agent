import { Icon } from '../common/Icon'
import type { ApplicationCase } from '../../types'

interface Props { active: string; onNavigate: (page: string) => void; open: boolean; onClose: () => void; onNewCase: () => void; cases: ApplicationCase[]; casesLoading: boolean; casesError: string; onSelectCase: (id: string) => void }
export function Sidebar({ active, onNavigate, open, onClose, onNewCase, cases, casesLoading, casesError, onSelectCase }: Props) {
  const navigate = (page: string) => { onNavigate(page); onClose() }
  return <>
    {open && <button className="drawer-scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <button className="brand" onClick={() => navigate('home')} aria-label="WorkRecover AI home"><span className="brand-mark"><Icon name="spark" size={19}/></span><span>workrecover<span className="brand-ai">AI</span></span></button>
      <button className="new-case-button" onClick={onNewCase}><Icon name="plus" size={18}/> <span>New case</span><span className="new-case-key">⌘ K</span></button>
      <div className="side-section-label">WORKSPACE</div>
      <button className={`side-link ${active === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}><Icon name="inbox" size={18}/><span>My cases</span><span className="nav-count">{cases.length}</span></button>
      {cases.length ? <div className="sidebar-case-list">{cases.map(item => <button className="sidebar-case" key={item.id} onClick={() => { onSelectCase(item.id); onClose() }}><span className="case-list-dot"/><span><b>{item.role || 'Application case'}</b><small>{item.company || item.status.replace(/_/g, ' ')}</small></span></button>)}</div> : <div className="sidebar-empty"><span className="empty-dot"/><span>{casesLoading ? 'Loading cases…' : casesError ? 'Cases unavailable' : 'No recovery cases yet'}</span></div>}
      <div className="sidebar-bottom">
        <div className="privacy-note"><span className="privacy-icon"><Icon name="shield" size={16}/></span><p>Your applications stay yours.<br/><span>Private by design.</span></p></div>
        <button className={`side-link ${active === 'profile' ? 'active' : ''}`} onClick={() => navigate('profile')}><Icon name="user" size={18}/><span>Profile</span></button>
        <button className={`side-link ${active === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}><Icon name="settings" size={18}/><span>Settings</span></button>
        <button className="account-row" onClick={() => navigate('profile')}><span className="avatar">Y</span><span className="account-copy"><b>Your workspace</b><small>Personal account</small></span><Icon name="chevron" size={15}/></button>
      </div>
    </aside>
  </>
}
