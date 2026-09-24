"""Application configuration module."""
from pathlib import Path

# Paths
BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
DATA_DIR: Path = BASE_DIR / "data"
UPLOADS_DIR: Path = BASE_DIR / "uploads"
DB_PATH: Path = DATA_DIR / "recovery.db"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# API Metadata
API_V1_PREFIX: str = "/api/v1"
PROJECT_NAME: str = "Worker Application Recovery Agent API"
PROJECT_VERSION: str = "1.0.0"

# Explicit frontend development origins
CORS_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
