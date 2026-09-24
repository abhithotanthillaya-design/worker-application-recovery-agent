"""Endpoints for Case management, tracking, simulation, and escalation."""
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import (
    ApplicationCase,
    ApplicationStatus,
    CreateCaseRequest,
    EscalationResponse,
    SimulationRequest,
    SimulationResponse,
    TimelineEvent,
)
from app.services import case_service, recovery_service

router = APIRouter()


@router.get("/cases", response_model=list[ApplicationCase], summary="List all recovery cases")
def get_cases() -> list[ApplicationCase]:
    """Retrieve all application cases."""
    return case_service.get_all_cases()


@router.post("/cases", response_model=ApplicationCase, status_code=status.HTTP_201_CREATED, summary="Create a recovery case")
def create_case(payload: CreateCaseRequest) -> ApplicationCase:
    """Create a new application recovery case."""
    return case_service.create_case(payload)


@router.get("/cases/{case_id}", response_model=ApplicationCase, summary="Get case details by ID")
def get_case(case_id: str) -> ApplicationCase:
    """Retrieve a single application case."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return case


@router.get("/cases/{case_id}/status", summary="Get case application status")
def get_case_status(case_id: str) -> ApplicationStatus:
    """Retrieve the current application status string for a case."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return case.status


@router.get("/cases/{case_id}/timeline", response_model=list[TimelineEvent], summary="Get case timeline history")
def get_timeline(case_id: str) -> list[TimelineEvent]:
    """Retrieve full chronological timeline events for a case."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return case_service.get_case_timeline(case_id)


@router.post("/cases/{case_id}/simulate/status", response_model=SimulationResponse, summary="Simulate outcome scenario")
def simulate_case_status(case_id: str, payload: SimulationRequest) -> SimulationResponse:
    """Simulate employer or portal response (SUCCESS, SECOND_REJECTION, DELAY, ESCALATION)."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    try:
        return recovery_service.simulate_status(case_id, payload.scenario)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/cases/{case_id}/escalate", response_model=EscalationResponse, summary="Escalate case for manual review")
def escalate_case(case_id: str) -> EscalationResponse:
    """Escalate application case to manual human advocate review."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return recovery_service.escalate_case(case_id)
