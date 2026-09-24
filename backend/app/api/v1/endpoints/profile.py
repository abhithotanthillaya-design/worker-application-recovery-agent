"""Endpoints for User Profile and Resume management."""
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.models.schemas import Profile
from app.services import profile_service

router = APIRouter()


@router.get("/profile", response_model=Profile, summary="Get applicant profile")
def get_profile() -> Profile:
    """Retrieve applicant profile information."""
    return profile_service.get_profile()


@router.put("/profile", response_model=Profile, summary="Update applicant profile")
def update_profile(profile: dict) -> Profile:
    """Update applicant profile details."""
    return profile_service.update_profile(profile)


@router.post("/profile/resume", response_model=Profile, summary="Upload profile resume")
async def upload_resume(file: UploadFile = File(...)) -> Profile:
    """Upload default resume document to user profile."""
    try:
        content = await file.read()
        return profile_service.upload_resume(
            filename=file.filename or "resume.pdf",
            content=content,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload profile resume: {str(e)}",
        )
