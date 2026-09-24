"""API v1 aggregator router mounting all feature routers."""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    analysis,
    cases,
    documents,
    health,
    profile,
    recovery,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(cases.router, tags=["cases"])
api_router.include_router(documents.router, tags=["documents"])
api_router.include_router(analysis.router, tags=["analysis"])
api_router.include_router(recovery.router, tags=["recovery"])
api_router.include_router(profile.router, tags=["profile"])
