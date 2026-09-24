import sys
from pathlib import Path

# Ensure the backend directory is in sys.path so 'app' is importable
# whether running from repository root or from within backend/
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app  # Re-export single application instance

__all__ = ["app"]