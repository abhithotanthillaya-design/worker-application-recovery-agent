"""Service for recovery plans, user approvals, follow-ups, simulations, and escalations."""
import json
from uuid import uuid4

from app.db.database import get_db, iso_now
from app.models.schemas import (
    Approval,
    ApprovalRequest,
    EscalationResponse,
    RecoveryPlan,
    RecoveryStep,
    SimulationResponse,
    SimulationScenario,
)
from app.services.case_service import add_timeline_event, get_case_raw, update_case_status


def generate_recovery_plan(case_id: str) -> RecoveryPlan:
    """Generate a structured, actionable recovery plan requiring explicit user approval."""
    raw_case = get_case_raw(case_id)
    if not raw_case:
        raise ValueError(f"Case with ID '{case_id}' not found.")

    company = raw_case.get("company", "Company")
    role = raw_case.get("role", "Role")
    applicant = raw_case.get("applicant_name") or "Applicant"
    plan_id = f"plan-{uuid4().hex[:8]}"
    now = iso_now()

    steps = [
        RecoveryStep(
            id="step-1",
            title="Evidence & Fact Verification",
            description="Extract and verify core qualification alignment from uploaded materials.",
            status="completed",
        ),
        RecoveryStep(
            id="step-2",
            title="User Authorization of Reconsideration Packet",
            description=f"Review and approve formal reconsideration communication for {company}.",
            status="active",
        ),
        RecoveryStep(
            id="step-3",
            title="Simulated Portal Submission",
            description=f"[Simulated] Dispatch appeal packet to {company}'s review queue.",
            status="pending",
        ),
    ]

    approval_message = (
        f"Dear Hiring Team at {company},\n\n"
        f"I am writing to formally request reconsideration of my application for the {role} position. "
        "Upon reviewing the position criteria, I believe my background and verified credentials directly align with your requirements.\n\n"
        "I have attached supporting documentation for your review and welcome the opportunity to discuss my qualifications.\n\n"
        f"Sincerely,\n{applicant}"
    )

    approval = Approval(
        action=f"Dispatch formal reconsideration message to {company}",
        message=approval_message,
        status="pending",
    )

    plan = RecoveryPlan(
        planId=plan_id,
        status="Awaiting user approval",
        summary=f"Tailored 3-step recovery workflow for {role} at {company}. Action will not be dispatched without your approval.",
        steps=steps,
        requiresUserApproval=True,
        approval=approval,
    )

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO recovery_plans (
                case_id, plan_id, status, summary, steps_json,
                requires_user_approval, approval_json, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                case_id,
                plan.planId,
                plan.status,
                plan.summary,
                json.dumps([s.model_dump() for s in plan.steps]),
                1,
                json.dumps(plan.approval.model_dump()) if plan.approval else None,
                now,
            ),
        )

    # Transition case to AWAITING_APPROVAL
    update_case_status(case_id, "AWAITING_APPROVAL")

    add_timeline_event(
        case_id=case_id,
        title="Recovery plan prepared",
        event_type="PLAN_GENERATED",
        message="Tailored recovery roadmap generated. Requires user authorization prior to dispatch.",
        status="completed",
    )

    return plan


def get_case_recovery_plan(case_id: str) -> RecoveryPlan:
    """Retrieve recovery plan for a case, generating one if not yet created."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT plan_id, status, summary, steps_json, requires_user_approval, approval_json
            FROM recovery_plans
            WHERE case_id = ?;
            """,
            (case_id,),
        )
        row = cursor.fetchone()

    if not row:
        return generate_recovery_plan(case_id)

    steps = [RecoveryStep(**s) for s in json.loads(row["steps_json"])]
    approval = Approval(**json.loads(row["approval_json"])) if row["approval_json"] else None

    return RecoveryPlan(
        planId=row["plan_id"],
        status=row["status"],
        summary=row["summary"],
        steps=steps,
        requiresUserApproval=bool(row["requires_user_approval"]),
        approval=approval,
    )


def process_approval(case_id: str, approval_req: ApprovalRequest) -> dict:
    """Process user approval or rejection for the recovery plan action."""
    raw_case = get_case_raw(case_id)
    if not raw_case:
        raise ValueError(f"Case with ID '{case_id}' not found.")

    company = raw_case.get("company", "Company")
    plan = get_case_recovery_plan(case_id)
    now = iso_now()

    if not approval_req.approved:
        if plan.approval:
            plan.approval.status = "rejected"
        plan.status = "Action declined by user"
        update_case_status(case_id, "ACTION_REQUIRED")
        add_timeline_event(
            case_id=case_id,
            title="Proposed action declined",
            event_type="APPROVAL_DECLINED",
            message="User declined the proposed reconsideration message. Further user instructions required.",
            status="completed",
        )
        return {"status": "rejected", "message": "Approval declined by user."}

    # User approved
    if plan.approval:
        plan.approval.status = "approved"
        if approval_req.message:
            plan.approval.message = approval_req.message

    # Mark Step 2 completed, Step 3 completed
    for step in plan.steps:
        if step.id == "step-2":
            step.status = "completed"
        elif step.id == "step-3":
            step.status = "completed"

    plan.status = "Reconsideration dispatched [Simulated]"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE recovery_plans
            SET status = ?, steps_json = ?, approval_json = ?, updated_at = ?
            WHERE case_id = ?;
            """,
            (
                plan.status,
                json.dumps([s.model_dump() for s in plan.steps]),
                json.dumps(plan.approval.model_dump()) if plan.approval else None,
                now,
                case_id,
            ),
        )

    # Transition case: SUBMITTED -> UNDER_REVIEW
    update_case_status(case_id, "UNDER_REVIEW")

    add_timeline_event(
        case_id=case_id,
        title="Action authorized by user",
        event_type="USER_APPROVAL",
        message="User reviewed and authorized the reconsideration draft. Message queued for delivery.",
        status="completed",
    )

    add_timeline_event(
        case_id=case_id,
        title="Simulated submission completed",
        event_type="SIMULATED_SUBMISSION",
        message=f"[Simulated] Formal reconsideration packet delivered to {company} review portal. Case is UNDER_REVIEW.",
        status="completed",
    )

    return {
        "status": "approved",
        "case_status": "UNDER_REVIEW",
        "message": f"[Simulated] Reconsideration approved and dispatched to {company}.",
    }


def draft_follow_up(case_id: str) -> dict:
    """Generate follow-up draft message."""
    raw_case = get_case_raw(case_id)
    if not raw_case:
        raise ValueError(f"Case with ID '{case_id}' not found.")

    company = raw_case.get("company", "Company")
    role = raw_case.get("role", "Role")
    applicant = raw_case.get("applicant_name") or "Applicant"

    message = (
        f"Dear Recruiting Team at {company},\n\n"
        f"I am writing to respectfully follow up regarding the reconsideration request for the {role} position. "
        "I remain very enthusiastic about this opportunity and would be glad to provide any additional details needed.\n\n"
        f"Best regards,\n{applicant}"
    )

    return {
        "caseId": case_id,
        "company": company,
        "role": role,
        "subject": f"Follow-up: Reconsideration status for {role} at {company}",
        "message": message,
    }


def submit_follow_up(case_id: str, message: str) -> dict:
    """Submit a follow-up inquiry (simulated)."""
    raw_case = get_case_raw(case_id)
    if not raw_case:
        raise ValueError(f"Case with ID '{case_id}' not found.")

    company = raw_case.get("company", "Company")
    now = iso_now()

    update_case_status(case_id, "RESUBMITTED")

    snippet = message[:120] + ("..." if len(message) > 120 else "")
    add_timeline_event(
        case_id=case_id,
        title="Follow-up inquiry dispatched",
        event_type="FOLLOW_UP_SENT",
        message=f"[Simulated] Sent follow-up to {company}: '{snippet}'",
        status="completed",
    )

    return {
        "status": "sent",
        "timestamp": now,
        "message": f"[Simulated] Follow-up inquiry successfully transmitted to {company}.",
    }


def simulate_status(case_id: str, scenario: SimulationScenario) -> SimulationResponse:
    """Simulate employer or portal response scenario."""
    raw_case = get_case_raw(case_id)
    if not raw_case:
        raise ValueError(f"Case with ID '{case_id}' not found.")

    company = raw_case.get("company", "Company")
    role = raw_case.get("role", "Role")
    previous_status = raw_case.get("status", "CREATED")
    now = iso_now()

    if scenario == "SUCCESS":
        new_status = "RESOLVED"
        msg = f"[Simulated] {company} accepted reconsideration request. Application reopened for interview scheduling."
        event_title = "Simulated Outcome: Success"
        event_type = "SIMULATION_SUCCESS"

    elif scenario == "SECOND_REJECTION":
        new_status = "ESCALATION_REQUIRED"
        msg = f"[Simulated] {company} issued a secondary rejection. Automated recovery avenues exhausted; human advocate escalation required."
        event_title = "Simulated Outcome: Second Rejection"
        event_type = "SIMULATION_SECOND_REJECTION"

    elif scenario == "DELAY":
        new_status = "UNDER_REVIEW"
        msg = f"[Simulated] Employer queue indicates processing latency at {company}. Review remains pending."
        event_title = "Simulated Outcome: Processing Delay"
        event_type = "SIMULATION_DELAY"

    elif scenario == "ESCALATION":
        new_status = "ESCALATION_REQUIRED"
        msg = f"[Simulated] Case flagged for formal dispute and ombudsperson escalation."
        event_title = "Simulated Outcome: Escalation Flagged"
        event_type = "SIMULATION_ESCALATION"

    else:
        raise ValueError(f"Unsupported scenario: '{scenario}'.")

    update_case_status(case_id, new_status)

    add_timeline_event(
        case_id=case_id,
        title=event_title,
        event_type=event_type,
        message=msg,
        status="completed",
    )

    return SimulationResponse(
        scenario=scenario,
        caseId=case_id,
        previousStatus=previous_status,
        newStatus=new_status,
        message=msg,
        timestamp=now,
    )


def escalate_case(case_id: str) -> EscalationResponse:
    """Formally escalate the case for manual advocate review."""
    raw_case = get_case_raw(case_id)
    if not raw_case:
        raise ValueError(f"Case with ID '{case_id}' not found.")

    company = raw_case.get("company", "Company")
    role = raw_case.get("role", "Role")
    applicant = raw_case.get("applicant_name") or "Applicant"
    now = iso_now()
    escalation_id = f"ESC-{uuid4().hex[:8].upper()}"

    update_case_status(case_id, "ESCALATED")

    add_timeline_event(
        case_id=case_id,
        title="Case escalated to advocate",
        event_type="CASE_ESCALATED",
        message=f"[Simulated] Escalation dossier {escalation_id} generated. Case transitioned to manual advocate review.",
        status="completed",
    )

    dossier = {
        "applicant": applicant,
        "company": company,
        "role": role,
        "escalationId": escalation_id,
        "escalationChannel": "Simulated Worker Advocate & Career Ombudsperson Registry",
        "justification": "Primary recovery channels exhausted; manual human intervention required.",
        "recommendedNextSteps": [
            "Advocate contacts employer talent operations lead directly",
            "File formal procedural inquiry [Simulated]",
            "Facilitate direct skill interview referral",
        ],
        "disclaimer": "All external dispute actions are simulated for demonstration purposes.",
    }

    return EscalationResponse(
        caseId=case_id,
        status="ESCALATED",
        escalationId=escalation_id,
        summary=f"Application case for {role} at {company} has been escalated for manual human advocate review.",
        timestamp=now,
        dossier=dossier,
    )
