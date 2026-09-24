"""Service for managing case evidence documents and file storage."""
from pathlib import Path
from uuid import uuid4

from app.core.config import UPLOADS_DIR
from app.db.database import get_db, iso_now
from app.models.schemas import CaseDocument, DocumentState
from app.services.case_service import add_timeline_event, get_case_by_id, update_case_status


def upload_document(case_id: str, filename: str, content: bytes, doc_type: str) -> CaseDocument:
    """Save an uploaded file and register document metadata for a case."""
    case = get_case_by_id(case_id)
    if not case:
        raise ValueError(f"Case with ID '{case_id}' not found.")

    doc_id = f"doc-{uuid4().hex[:8]}"
    now = iso_now()
    size = len(content)
    state: DocumentState = "READY"

    # Store file on disk
    case_upload_dir: Path = UPLOADS_DIR / case_id
    case_upload_dir.mkdir(parents=True, exist_ok=True)
    safe_filename = Path(filename).name
    file_path = case_upload_dir / f"{doc_id}_{safe_filename}"
    file_path.write_bytes(content)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO documents (id, case_id, filename, type, size, state, storage_path, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (doc_id, case_id, safe_filename, doc_type, size, state, str(file_path), now),
        )

    # If the case is in CREATED state, transition to DOCUMENTS_PENDING or keep updated
    if case.status == "CREATED":
        update_case_status(case_id, "DOCUMENTS_PENDING")

    # Record timeline event
    add_timeline_event(
        case_id=case_id,
        title="Document attached",
        event_type="DOCUMENT_UPLOAD",
        message=f"Uploaded '{safe_filename}' ({doc_type}, {round(size / 1024, 1)} KB). Evidence logged.",
        status="completed",
    )

    return CaseDocument(
        id=doc_id,
        filename=safe_filename,
        type=doc_type,
        size=size,
        state=state,
    )


def get_case_documents(case_id: str) -> list[CaseDocument]:
    """Retrieve all documents attached to a specific case."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, filename, type, size, state
            FROM documents
            WHERE case_id = ?
            ORDER BY uploaded_at ASC;
            """,
            (case_id,),
        )
        rows = cursor.fetchall()
        return [
            CaseDocument(
                id=row["id"],
                filename=row["filename"],
                type=row["type"],
                size=row["size"],
                state=row["state"],
            )
            for row in rows
        ]
