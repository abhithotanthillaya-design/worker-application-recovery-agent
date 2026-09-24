"""Service for user profile and resume management."""
import json
from pathlib import Path

from app.core.config import UPLOADS_DIR
from app.db.database import get_db, iso_now
from app.models.schemas import Profile


def get_profile() -> Profile:
    """Retrieve the current user profile."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name, skills_json, resume, preferences_json FROM profile WHERE id = 1;")
        row = cursor.fetchone()

    if not row:
        return Profile()

    skills = json.loads(row["skills_json"]) if row["skills_json"] else []
    prefs = json.loads(row["preferences_json"]) if row["preferences_json"] else {}

    return Profile(
        name=row["name"],
        skills=skills,
        resume=row["resume"],
        preferences=prefs,
    )


def update_profile(updates: dict) -> Profile:
    """Update user profile fields."""
    current = get_profile()
    now = iso_now()

    new_name = updates.get("name", current.name)
    new_skills = updates.get("skills", current.skills)
    new_resume = updates.get("resume", current.resume)
    new_prefs = updates.get("preferences", current.preferences)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE profile
            SET name = ?, skills_json = ?, resume = ?, preferences_json = ?, updated_at = ?
            WHERE id = 1;
            """,
            (
                new_name,
                json.dumps(new_skills),
                new_resume,
                json.dumps(new_prefs),
                now,
            ),
        )

    return Profile(
        name=new_name,
        skills=new_skills,
        resume=new_resume,
        preferences=new_prefs,
    )


def upload_resume(filename: str, content: bytes) -> Profile:
    """Save an uploaded resume and attach filename to user profile."""
    resume_dir = UPLOADS_DIR / "profile"
    resume_dir.mkdir(parents=True, exist_ok=True)
    safe_filename = Path(filename).name
    file_path = resume_dir / safe_filename
    file_path.write_bytes(content)

    return update_profile({"resume": safe_filename})
