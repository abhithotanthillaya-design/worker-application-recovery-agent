"""Service for managing application cases and timeline events."""
import json
from uuid import uuid4

from app.db.database import get_db, iso_now
from app.models.schemas import (
    ApplicationCase,
    ApplicationStatus,
    CreateCaseRequest,
    TimelineEvent,
)


def create_case(data: CreateCaseRequest) -> ApplicationCase:
    """Create a new application case and initialize default records."""
    case_id = f"case-{uuid4().hex[:8]}"
    now = iso_now()
    initial_status: ApplicationStatus = "CREATED"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO cases (
                id, company, role, applicant_name, application_date,
                current_status, description, status, last_updated, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                case_id,
                data.company,
                data.role,
                data.applicant_name or "",
                data.application_date or "",
                data.current_status or "",
                data.description or "",
                initial_status,
                now,
                now,
            ),
        )

        # Initial Timeline Event
        event_id = f"evt-{uuid4().hex[:8]}"
        cursor.execute(
            """
            INSERT INTO timeline_events (id, case_id, timestamp, type, title, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (
                event_id,
                case_id,
                now,
                "CASE_CREATED",
                "Application case opened",
                f"Case registered for {data.role} at {data.company}. Initial report saved.",
                "completed",
            ),
        )

        # Initialize baseline analysis
        initial_analysis = {
            "confirmedFacts": [
                {"text": f"Application submitted to {data.company} for {data.role}.", "evidence": "Applicant intake"},
                {"text": f"Applicant recorded as {data.applicant_name or 'Worker'}.", "evidence": "Applicant profile"},
            ],
            "userReported": [
                {"text": f"User reported application state: {data.current_status or 'Unspecified'}."},
                {"text": f"Incident description: {data.description or 'No details provided'}."},
            ],
            "detectedIssues": [
                {"text": "Awaiting document upload or detailed automated screening report."}
            ],
            "inferences": [
                {"text": "Initial review indicates profile qualifies for reconsideration appeal window."}
            ],
            "unknowns": [
                {"text": f"Specific ATS screening criteria utilized by {data.company}."},
                {"text": "Whether human recruiter has reviewed the application."},
            ],
        }
        cursor.execute(
            """
            INSERT INTO analyses (case_id, data_json, updated_at)
            VALUES (?, ?, ?);
            """,
            (case_id, json.dumps(initial_analysis), now),
        )

        # Initialize baseline recoverability
        initial_recoverability = {
            "status": "ACTIONABLE_UNCERTAIN",
            "reason": "Case intake completed. Additional evidence or analysis execution recommended to finalize recovery roadmap.",
            "evidence": [
                {"text": f"Application on file for {data.role} at {data.company}."}
            ],
        }
        cursor.execute(
            """
            INSERT INTO recoverabilities (case_id, status, reason, evidence_json, updated_at)
            VALUES (?, ?, ?, ?, ?);
            """,
            (
                case_id,
                initial_recoverability["status"],
                initial_recoverability["reason"],
                json.dumps(initial_recoverability["evidence"]),
                now,
            ),
        )

        # Initialize baseline recovery plan
        plan_id = f"plan-{uuid4().hex[:8]}"
        applicant = data.applicant_name or "Applicant"
        initial_approval = {
            "action": f"Dispatch formal reconsideration message to {data.company}",
            "message": (
                f"Dear Hiring Team at {data.company},\n\n"
                f"I am writing to formally request reconsideration of my application for the {data.role} position. "
                "Upon reviewing the role criteria, I believe my background and demonstrated experience directly satisfy your core requirements.\n\n"
                "I have attached verified supplemental documentation clarifying my credentials for your review.\n\n"
                f"Sincerely,\n{applicant}"
            ),
            "status": "pending",
        }
        initial_plan = {
            "planId": plan_id,
            "status": "Actionable plan ready",
            "summary": f"Structured 3-stage plan to recover the application for {data.role} at {data.company}.",
            "steps": [
                {
                    "id": "step-1",
                    "title": "Review Reported Issue & Upload Supporting Evidence",
                    "description": "Attach resume or employer rejection communication.",
                    "status": "completed",
                },
                {
                    "id": "step-2",
                    "title": "User Approval of Formal Appeal Notice",
                    "description": "Review and explicitly authorize the reconsideration packet.",
                    "status": "active",
                },
                {
                    "id": "step-3",
                    "title": "Simulated Dispatch to Employer / Portal",
                    "description": "Simulated submission of recovery request once authorized.",
                    "status": "pending",
                },
            ],
            "requiresUserApproval": True,
            "approval": initial_approval,
        }
        cursor.execute(
            """
            INSERT INTO recovery_plans (
                case_id, plan_id, status, summary, steps_json,
                requires_user_approval, approval_json, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                case_id,
                initial_plan["planId"],
                initial_plan["status"],
                initial_plan["summary"],
                json.dumps(initial_plan["steps"]),
                1,
                json.dumps(initial_plan["approval"]),
                now,
            ),
        )

    return ApplicationCase(
        id=case_id,
        company=data.company,
        role=data.role,
        status=initial_status,
        lastUpdated=now,
    )


def get_all_cases() -> list[ApplicationCase]:
    """Retrieve all application cases sorted by last updated descending."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, company, role, status, last_updated
            FROM cases
            ORDER BY last_updated DESC;
            """
        )
        rows = cursor.fetchall()
        return [
            ApplicationCase(
                id=row["id"],
                company=row["company"],
                role=row["role"],
                status=row["status"],
                lastUpdated=row["last_updated"],
            )
            for row in rows
        ]


def get_case_by_id(case_id: str) -> ApplicationCase | None:
    """Retrieve a single application case by id."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, company, role, status, last_updated
            FROM cases
            WHERE id = ?;
            """,
            (case_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None
        return ApplicationCase(
            id=row["id"],
            company=row["company"],
            role=row["role"],
            status=row["status"],
            lastUpdated=row["last_updated"],
        )


def get_case_raw(case_id: str) -> dict | None:
    """Retrieve full raw case record including description and applicant name."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cases WHERE id = ?;", (case_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def update_case_status(case_id: str, new_status: ApplicationStatus) -> ApplicationCase | None:
    """Update case status and refresh last_updated timestamp."""
    now = iso_now()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE cases
            SET status = ?, last_updated = ?
            WHERE id = ?;
            """,
            (new_status, now, case_id),
        )
        if cursor.rowcount == 0:
            return None
        cursor.execute(
            "SELECT id, company, role, status, last_updated FROM cases WHERE id = ?;",
            (case_id,),
        )
        row = cursor.fetchone()
        return ApplicationCase(
            id=row["id"],
            company=row["company"],
            role=row["role"],
            status=row["status"],
            lastUpdated=row["last_updated"],
        )


def add_timeline_event(
    case_id: str,
    title: str,
    event_type: str,
    message: str | None = None,
    status: str = "completed",
) -> TimelineEvent:
    """Insert a new timeline event and update case last_updated."""
    now = iso_now()
    event_id = f"evt-{uuid4().hex[:8]}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO timeline_events (id, case_id, timestamp, type, title, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (event_id, case_id, now, event_type, title, message, status),
        )
        cursor.execute(
            "UPDATE cases SET last_updated = ? WHERE id = ?;",
            (now, case_id),
        )

    return TimelineEvent(
        id=event_id,
        timestamp=now,
        type=event_type,
        title=title,
        message=message,
        status=status,
    )


def get_case_timeline(case_id: str) -> list[TimelineEvent]:
    """Retrieve all timeline events for a given case ordered chronologically."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, timestamp, type, title, message, status
            FROM timeline_events
            WHERE case_id = ?
            ORDER BY timestamp DESC;
            """,
            (case_id,),
        )
        rows = cursor.fetchall()
        return [
            TimelineEvent(
                id=row["id"],
                timestamp=row["timestamp"],
                type=row["type"],
                title=row["title"],
                message=row["message"],
                status=row["status"],
            )
            for row in rows
        ]
