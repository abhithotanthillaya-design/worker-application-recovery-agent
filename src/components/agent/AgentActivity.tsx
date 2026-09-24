import { Icon } from '../common/Icon'

export function AgentActivity({ status, error, onRetry }: { status: string; error?: string; onRetry?: () => void }) {
  return <section className="activity-card"><span className="activity-symbol"><Icon name="spark" size={18}/></span><div className="activity-copy"><span className="eyebrow">WORKRECOVER AGENT</span><h2>{error ? 'Investigation unavailable' : status === 'ANALYZING' ? 'Investigating your application' : 'Investigation status'}</h2><p>{error ?? 'The investigation state is provided by the backend.'}</p>{status === 'ANALYZING' && !error && <div className="activity-progress"><span/></div>}{onRetry && error && <button className="button button-secondary button-small" onClick={onRetry}>Try again</button>}</div><span className={`activity-status ${error ? 'status-error' : ''}`}>{error ? 'Connection issue' : status}</span></section>
}
