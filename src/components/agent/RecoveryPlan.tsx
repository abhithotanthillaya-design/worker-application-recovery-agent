import type { RecoveryPlan as RecoveryPlanType } from '../../types'

export function RecoveryPlanCard({ plan }: { plan: RecoveryPlanType }) {
  return <section className="agent-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR NEXT STEPS</span><h2>Recovery plan</h2></div><span className="plan-status">{plan.status}</span></div>{plan.summary && <p className="plan-summary">{plan.summary}</p>}<ol className="plan-steps">{plan.steps.map((step, index) => <li className={`plan-step step-${step.status}`} key={step.id}><span className="step-index">{step.status === 'completed' ? '✓' : String(index + 1).padStart(2, '0')}</span><span className="step-detail"><b>{step.title}</b>{step.description && <small>{step.description}</small>}</span><span className="step-state">{step.status}</span></li>)}</ol></section>
}
