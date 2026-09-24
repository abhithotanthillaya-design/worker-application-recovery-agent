import { Icon } from '../common/Icon'

const stages = ['Tell us what happened', 'Investigate the evidence', 'Find your next step']
export function ProcessStrip() {
  return <div className="process-strip" aria-label="How WorkRecover helps"><div className="process-label"><span className="process-spark"><Icon name="spark" size={16}/></span><span>Your recovery, step by step</span></div><div className="process-stages">{stages.map((stage, index) => <div className="process-stage" key={stage}><span className="stage-number">0{index + 1}</span><span>{stage}</span>{index < stages.length - 1 && <span className="stage-rule"/>}</div>)}</div></div>
}
