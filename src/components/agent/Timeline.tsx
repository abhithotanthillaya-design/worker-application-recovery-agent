import type { TimelineEvent } from '../../types'
import { Icon } from '../common/Icon'

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return <section className="agent-panel"><div className="panel-heading"><div><span className="eyebrow">CASE HISTORY</span><h2>Application timeline</h2></div></div>{events.length ? <ol className="timeline">{events.map(event => <li key={event.id}><span className="timeline-marker"><Icon name={event.status === 'completed' ? 'check' : 'clock'} size={14}/></span><div><div className="timeline-title"><b>{event.title}</b><time>{new Date(event.timestamp).toLocaleString()}</time></div>{event.message && <p>{event.message}</p>}</div></li>)}</ol> : <p className="panel-empty">No timeline events yet.</p>}</section>
}
