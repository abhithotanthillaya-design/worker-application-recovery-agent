"""Simple configuration module for Worker Application Recovery Agent backend."""

API_V1_PREFIX: str = "/api/v1"
PROJECT_NAME: str = "Worker Application Recovery Agent API"
PROJECT_VERSION: str = "1.0.0"

# Explicit frontend development origins (no insecure wildcard with credentials)
CORS_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
