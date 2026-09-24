import { Icon } from './Icon'

export function EmptyState({ title, message, action, onAction }: { title: string; message: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="inbox" size={21}/></span><h3>{title}</h3><p>{message}</p>{action && <button className="button button-secondary button-small" onClick={onAction}><Icon name="plus" size={15}/>{action}</button>}</div>
}
