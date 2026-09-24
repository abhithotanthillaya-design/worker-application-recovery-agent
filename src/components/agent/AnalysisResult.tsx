import type { Analysis, EvidenceItem } from '../../types'
import { Icon } from '../common/Icon'

function EvidenceList({ title, items, kind, empty }: { title: string; items: EvidenceItem[]; kind: 'confirmed' | 'possible' | 'unknown'; empty: string }) {
  const marker = kind === 'confirmed' ? '✓' : kind === 'possible' ? '!' : '?'
  return <section className={`evidence-section evidence-${kind}`}><div className="evidence-heading"><span className="evidence-marker">{marker}</span><h3>{title}</h3><span className="evidence-count">{items.length}</span></div>{items.length ? <ul>{items.map((item, index) => <li key={`${item.text}-${index}`}><span>{item.text}</span>{item.evidence && <small><Icon name="file" size={13}/>{item.evidence}</small>}</li>)}</ul> : <p className="evidence-empty">{empty}</p>}</section>
}

export function AnalysisResult({ analysis }: { analysis: Analysis }) {
  const confirmed = [...analysis.confirmedFacts, ...analysis.userReported]
  const possible = [...analysis.detectedIssues, ...analysis.inferences]
  return <section className="agent-panel"><div className="panel-heading"><div><span className="eyebrow">INVESTIGATION</span><h2>What we understand so far</h2></div><span className="panel-live"><span/>Backend result</span></div><div className="evidence-grid"><EvidenceList title="Confirmed" items={confirmed} kind="confirmed" empty="No confirmed facts provided."/><EvidenceList title="Possible" items={possible} kind="possible" empty="No possible issues provided."/><EvidenceList title="Unknown" items={analysis.unknowns} kind="unknown" empty="No unknowns provided."/></div></section>
}
