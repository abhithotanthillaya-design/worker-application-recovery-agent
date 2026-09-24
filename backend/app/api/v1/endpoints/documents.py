"""Endpoints for Case evidence documents and uploads."""
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.models.schemas import CaseDocument
from app.services import case_service, document_service

router = APIRouter()


@router.get("/cases/{case_id}/documents", response_model=list[CaseDocument], summary="List case documents")
def get_documents(case_id: str) -> list[CaseDocument]:
    """Retrieve all evidence documents attached to a case."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    return document_service.get_case_documents(case_id)


@router.post("/cases/{case_id}/documents", response_model=CaseDocument, status_code=status.HTTP_201_CREATED, summary="Upload evidence document")
async def upload_document(
    case_id: str,
    file: UploadFile = File(...),
    document_type: str = Form("Other"),
) -> CaseDocument:
    """Upload a supporting evidence document (resume, job description, rejection notice, etc.)."""
    case = case_service.get_case_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )
    try:
        content = await file.read()
        return document_service.upload_document(
            case_id=case_id,
            filename=file.filename or "uploaded_document",
            content=content,
            doc_type=document_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document upload: {str(e)}",
        )
