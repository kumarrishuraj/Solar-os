"""Audit Logging Module.

Provides helper functions to record immutable audit trail entries in PostgreSQL.
"""

from typing import Any, Dict, Optional
import uuid
from decimal import Decimal
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLogModel


def make_json_serializable(obj: Any) -> Any:
    """Recursively convert Decimals, UUIDs, dates, and non-primitive objects to JSON-friendly types."""
    if isinstance(obj, (Decimal, uuid.UUID)):
        return str(obj)
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {str(k): make_json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [make_json_serializable(x) for x in obj]
    return obj


def record_audit_log(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID,
    user_id: Optional[uuid.UUID] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditLogModel:
    """Create an append-only audit log entry."""
    safe_metadata = make_json_serializable(metadata) if metadata else {}
    entry = AuditLogModel(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_=safe_metadata,
    )
    db.add(entry)
    # Note: caller commits as part of its transaction or explicitly
    return entry
