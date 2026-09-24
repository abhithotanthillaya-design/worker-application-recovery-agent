"""Main FastAPI application definition."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import API_V1_PREFIX, CORS_ORIGINS, PROJECT_NAME, PROJECT_VERSION
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created on application startup
    init_db()
    yield


app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    lifespan=lifespan,
)

# CORS configuration for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=API_V1_PREFIX)


@app.get("/", summary="Root endpoint")
def root():
    return {
        "message": "Worker Application Recovery Agent API",
        "docs": "/docs",
        "health": f"{API_V1_PREFIX}/health",
    }
