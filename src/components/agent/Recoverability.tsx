import type { Recoverability as RecoverabilityType } from '../../types'
import { Icon } from '../common/Icon'

export function RecoverabilityCard({ data }: { data: RecoverabilityType }) {
  const label = data.status === 'RECOVERABLE' ? 'Recoverable' : data.status === 'CLOSED' ? 'Closed' : 'Actionable but uncertain'
  const tone = data.status === 'RECOVERABLE' ? 'positive' : data.status === 'CLOSED' ? 'neutral' : 'caution'
  return <section className={`recoverability-card ${tone}`}><div className="recover-icon"><Icon name="shield" size={19}/></div><div className="recover-copy"><span className="eyebrow">RECOVERABILITY · PROVIDED BY BACKEND</span><h2>{label}</h2><p>{data.reason}</p>{data.evidence.length > 0 && <div className="recover-evidence">{data.evidence.map((item, index) => <span key={`${item.text}-${index}`}><Icon name="file" size={13}/>{item.text}</span>)}</div>}</div></section>
}
