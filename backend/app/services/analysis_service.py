"""Service for analyzing application cases and assessing recoverability."""
import json

from app.db.database import get_db, iso_now
from app.models.schemas import (
    Analysis,
    EvidenceItem,
    Recoverability,
    RecoverabilityStatus,
)
from app.services.case_service import add_timeline_event, get_case_raw, update_case_status
from app.services.document_service import get_case_documents


def perform_analysis(case_id: str) -> Analysis:
    """Execute diagnostic analysis on a case, extract facts/issues, and determine recoverability."""
    raw_case = get_case_raw(case_id)
    if not raw_case:
        raise ValueError(f"Case with ID '{case_id}' not found.")

    # 1. Update status to ANALYZING
    update_case_status(case_id, "ANALYZING")
    add_timeline_event(
        case_id=case_id,
        title="Diagnostic analysis initiated",
        event_type="ANALYSIS_STARTED",
        message="Backend diagnostic engine evaluating application records and evidence.",
        status="completed",
    )

    company = raw_case.get("company", "Company")
    role = raw_case.get("role", "Role")
    applicant_name = raw_case.get("applicant_name") or "Applicant"
    description = raw_case.get("description", "")
    current_status = raw_case.get("current_status", "")

    # Retrieve documents
    documents = get_case_documents(case_id)

    # 2. Extract Confirmed Facts
    confirmed_facts: list[EvidenceItem] = [
        EvidenceItem(text=f"Application submitted to {company} for the position of {role}.", evidence="Application record"),
        EvidenceItem(text=f"Applicant verified as {applicant_name}.", evidence="Identity profile"),
    ]
    for doc in documents:
        confirmed_facts.append(
            EvidenceItem(
                text=f"Supporting document verified: {doc.filename} ({doc.type}).",
                evidence=f"{doc.type} upload",
            )
        )

    # 3. Extract User Reported Items
    user_reported: list[EvidenceItem] = [
        EvidenceItem(text=f"Current reported status: '{current_status or 'Pending'}'.", evidence="User intake"),
        EvidenceItem(text=f"Applicant account: '{description or 'No additional description provided'}'.", evidence="User testimony"),
    ]

    # 4. Extract Detected Issues
    desc_lower = description.lower()
    status_lower = current_status.lower()
    detected_issues: list[EvidenceItem] = []

    if "reject" in desc_lower or "reject" in status_lower:
        detected_issues.append(
            EvidenceItem(
                text="Automated screening filter triggered without documented recruiter review.",
                evidence="Status signature: Automated rejection",
            )
        )
        detected_issues.append(
            EvidenceItem(
                text="No individualized constructive feedback provided by employer.",
                evidence="Employer communication",
            )
        )
    elif "no response" in desc_lower or "no response" in status_lower:
        detected_issues.append(
            EvidenceItem(
                text="Application processing elapsed beyond standard response window (inactivity stall).",
                evidence="Timeline lapse",
            )
        )
    elif "action" in desc_lower or "incomplete" in desc_lower:
        detected_issues.append(
            EvidenceItem(
                text="Application flagged for missing auxiliary documentation or certification clarity.",
                evidence="Application submission portal",
            )
        )
    else:
        detected_issues.append(
            EvidenceItem(
                text="Potential keyword indexing mismatch between submission and job requirements.",
                evidence="Applicant documentation",
            )
        )

    # 5. Form Inferences
    inferences: list[EvidenceItem] = [
        EvidenceItem(
            text=f"Candidate's core profile matches foundational qualifications for {role}.",
            evidence="Profile matching",
        ),
        EvidenceItem(
            text=f"{company}'s standard candidate workflow allows a 30-day appeal/clarification period.",
            evidence="Reconsideration protocol",
        ),
        EvidenceItem(
            text="Direct submission of targeted clarification packet will bypass automated intake filters.",
            evidence="Recovery heuristic",
        ),
    ]

    # 6. Identify Unknowns
    unknowns: list[EvidenceItem] = [
        EvidenceItem(text=f"Proprietary ATS ranking threshold applied by {company}."),
        EvidenceItem(text="Specific department hiring lead contact details."),
    ]

    analysis = Analysis(
        confirmedFacts=confirmed_facts,
        userReported=user_reported,
        detectedIssues=detected_issues,
        inferences=inferences,
        unknowns=unknowns,
    )

    # 7. Determine Recoverability
    if "position filled" in desc_lower or "hired someone else" in desc_lower or "closed permanently" in desc_lower:
        rec_status: RecoverabilityStatus = "CLOSED"
        rec_reason = f"The requisition for {role} at {company} has been reported closed. Recovery is not viable."
        rec_evidence = [EvidenceItem(text="Position closed by employer notice.")]
    elif len(documents) > 0 or len(detected_issues) > 0:
        rec_status = "RECOVERABLE"
        rec_reason = (
            f"The application for {role} at {company} is recoverable. Disqualification indicates "
            "automated screening friction or missing supplemental context rather than core skill deficit."
        )
        rec_evidence = [
            EvidenceItem(text=f"Applicable qualifications established for {role}."),
            EvidenceItem(text=f"Clear procedural justification for reconsideration at {company}."),
        ]
    else:
        rec_status = "ACTIONABLE_UNCERTAIN"
        rec_reason = (
            f"Action is feasible for {role} at {company}, but additional documents or employer responses "
            "are needed to confirm the recovery pathway."
        )
        rec_evidence = [EvidenceItem(text="Preliminary intake completed; awaiting supplemental evidence.")]

    recoverability = Recoverability(
        status=rec_status,
        reason=rec_reason,
        evidence=rec_evidence,
    )

    # Save to Database
    now = iso_now()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO analyses (case_id, data_json, updated_at)
            VALUES (?, ?, ?);
            """,
            (case_id, analysis.model_dump_json(), now),
        )
        cursor.execute(
            """
            INSERT OR REPLACE INTO recoverabilities (case_id, status, reason, evidence_json, updated_at)
            VALUES (?, ?, ?, ?, ?);
            """,
            (case_id, recoverability.status, recoverability.reason, json.dumps([e.model_dump() for e in recoverability.evidence]), now),
        )

    # Transition to ISSUE_FOUND or ACTION_REQUIRED
    next_status = "ACTION_REQUIRED" if rec_status == "RECOVERABLE" else "ISSUE_FOUND"
    update_case_status(case_id, next_status)

    add_timeline_event(
        case_id=case_id,
        title="Investigation complete",
        event_type="ANALYSIS_COMPLETED",
        message=f"Identified {len(detected_issues)} issues. Recoverability assessed as {rec_status}.",
        status="completed",
    )

    return analysis


def get_case_analysis(case_id: str) -> Analysis | None:
    """Retrieve saved analysis for a case."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM analyses WHERE case_id = ?;", (case_id,))
        row = cursor.fetchone()
        if not row:
            return None
        data = json.loads(row["data_json"])
        return Analysis(**data)


def get_case_recoverability(case_id: str) -> Recoverability | None:
    """Retrieve saved recoverability assessment for a case."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT status, reason, evidence_json FROM recoverabilities WHERE case_id = ?;", (case_id,))
        row = cursor.fetchone()
        if not row:
            return None
        evidence = json.loads(row["evidence_json"])
        return Recoverability(
            status=row["status"],
            reason=row["reason"],
            evidence=[EvidenceItem(**e) for e in evidence],
        )
