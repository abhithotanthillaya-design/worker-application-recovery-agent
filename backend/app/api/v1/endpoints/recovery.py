"""Endpoints for Recovery Plan, User Approval, and Follow-Up inquiries."""
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import ApprovalRequest, FollowUpRequest, RecoveryPlan
from app.services import case_service, recovery_service

router = APIRouter()


@router.post("/cases/{case_id}/recovery-plan", response_model=RecoveryPlan, summary="Generate or refresh recovery plan")
def create_recovery_plan(case_id: str) -> RecoveryPlan:
    """Generate a tailored recovery plan for a case."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return recovery_service.generate_recovery_plan(case_id)


@router.get("/cases/{case_id}/recovery-plan", response_model=RecoveryPlan, summary="Get active recovery plan")
def get_recovery_plan(case_id: str) -> RecoveryPlan:
    """Retrieve the recovery plan for a case."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return recovery_service.get_case_recovery_plan(case_id)


@router.post("/cases/{case_id}/approval", summary="Record user approval for proposed recovery action")
def approve_plan(case_id: str, payload: ApprovalRequest) -> dict:
    """Record explicit user approval or rejection before simulated dispatch."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return recovery_service.process_approval(case_id, payload)


@router.post("/cases/{case_id}/follow-up/draft", summary="Generate follow-up message draft")
def draft_follow_up(case_id: str) -> dict:
    """Generate a personalized follow-up message draft for the case."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return recovery_service.draft_follow_up(case_id)


@router.post("/cases/{case_id}/follow-up", summary="Transmit follow-up message")
def submit_follow_up(case_id: str, payload: FollowUpRequest) -> dict:
    """Submit a follow-up inquiry message [Simulated]."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return recovery_service.submit_follow_up(case_id, payload.message)
