"""Endpoints for Case investigation, diagnostic analysis, and recoverability."""
from fastapi import APIRouter, HTTPException, status

from app.models.schemas import Analysis, Recoverability
from app.services import analysis_service, case_service

router = APIRouter()


@router.post("/cases/{case_id}/analyze", response_model=Analysis, summary="Run diagnostic investigation")
def analyze_case(case_id: str) -> Analysis:
    """Analyze application evidence and determine facts, issues, inferences, unknowns, and recoverability."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return analysis_service.perform_analysis(case_id)


@router.get("/cases/{case_id}/analysis", response_model=Analysis, summary="Get investigation findings")
def get_analysis(case_id: str) -> Analysis:
    """Retrieve structured analysis for a case."""
    analysis = analysis_service.get_case_analysis(case_id)
    if not analysis:
        # If not analyzed yet, run initial analysis automatically
        analysis = analysis_service.perform_analysis(case_id)
    return analysis


@router.get("/cases/{case_id}/recoverability", response_model=Recoverability, summary="Get recoverability status")
def get_recoverability(case_id: str) -> Recoverability:
    """Retrieve recoverability assessment for a case."""
    recoverability = analysis_service.get_case_recoverability(case_id)
    if not recoverability:
        # If not evaluated yet, run analysis to produce recoverability
        analysis_service.perform_analysis(case_id)
        recoverability = analysis_service.get_case_recoverability(case_id)
    if not recoverability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recoverability not available for case '{case_id}'.",
        )
    return recoverability
