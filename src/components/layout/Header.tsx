import { Icon } from '../common/Icon'

export function Header({ onMenu, onProfile, page }: { onMenu: () => void; onProfile: () => void; page: string }) {
  return <header className="topbar"><button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation"><Icon name="menu"/></button><div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14}/><b>{page}</b></div><div className="topbar-right"><span className="connection-dot"/><span className="connection-label">Private workspace</span><button className="top-avatar" onClick={onProfile} aria-label="Open profile"><span>Y</span></button></div></header>
}
