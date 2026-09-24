"""SQLite database management with standard library sqlite3."""
import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from app.core.config import DB_PATH

_db_initialized = False


def iso_now() -> str:
    """Return current UTC ISO timestamp."""
    return datetime.now(timezone.utc).isoformat()


def init_db() -> None:
    """Initialize database tables and seed default singleton data if needed."""
    global _db_initialized
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        cursor = conn.cursor()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            id TEXT PRIMARY KEY,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            applicant_name TEXT,
            application_date TEXT,
            current_status TEXT,
            description TEXT,
            status TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            type TEXT NOT NULL,
            size INTEGER NOT NULL,
            state TEXT NOT NULL,
            storage_path TEXT,
            uploaded_at TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            case_id TEXT PRIMARY KEY,
            data_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recoverabilities (
            case_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            reason TEXT NOT NULL,
            evidence_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recovery_plans (
            case_id TEXT PRIMARY KEY,
            plan_id TEXT NOT NULL,
            status TEXT NOT NULL,
            summary TEXT NOT NULL,
            steps_json TEXT NOT NULL,
            requires_user_approval INTEGER NOT NULL DEFAULT 1,
            approval_json TEXT,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS timeline_events (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT,
            status TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT NOT NULL DEFAULT '',
            skills_json TEXT NOT NULL DEFAULT '[]',
            resume TEXT,
            preferences_json TEXT NOT NULL DEFAULT '{}',
            updated_at TEXT NOT NULL
        );
        """)

        # Ensure a singleton profile record exists
        cursor.execute("SELECT id FROM profile WHERE id = 1;")
        if not cursor.fetchone():
            cursor.execute(
                """
                INSERT INTO profile (id, name, skills_json, resume, preferences_json, updated_at)
                VALUES (1, '', ?, NULL, ?, ?);
                """,
                (json.dumps(["Product Design", "Figma", "User Research"]), json.dumps({}), iso_now()),
            )

        conn.commit()
        _db_initialized = True
    finally:
        conn.close()


def ensure_db_initialized() -> None:
    """Ensure database schema is created."""
    global _db_initialized
    if not _db_initialized:
        init_db()


@contextmanager
def get_db():
    """Context manager for SQLite database connection."""
    ensure_db_initialized()
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
