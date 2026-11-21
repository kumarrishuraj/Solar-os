"""Post-Commissioning Service Ticket Management Routes."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, require_roles, AuthenticatedUser
from app.schemas.service_ticket import (
    ServiceTicketCreate,
    ServiceTicketAssign,
    ServiceTicketStatusUpdate,
    ServiceTicketResolve,
    ServiceTicketResponse,
)
from app.services.service_ticket_service import ServiceTicketService

router = APIRouter(prefix="/service/tickets", tags=["Service & Maintenance Tickets"])


@router.post(
    "",
    response_model=ServiceTicketResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Service Ticket",
    description="Registers customer complaint or hardware fault ticket (TKT-YYYY-NNNN).",
)
def create_ticket(
    payload: ServiceTicketCreate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ServiceTicketResponse:
    """Create ticket."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    tkt = ServiceTicketService.create_ticket(db, payload, acting_user_id=user_id)
    return ServiceTicketResponse.model_validate(tkt)


@router.get(
    "",
    response_model=List[ServiceTicketResponse],
    summary="List Service Tickets",
    description="Returns tickets with status, priority, and technician filters.",
)
def list_tickets(
    customer_id: Optional[uuid.UUID] = Query(None),
    project_id: Optional[uuid.UUID] = Query(None),
    technician_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> List[ServiceTicketResponse]:
    """List tickets."""
    items, _ = ServiceTicketService.list_tickets(
        db=db,
        customer_id=customer_id,
        project_id=project_id,
        technician_id=technician_id,
        status_filter=status,
        priority=priority,
        page=page,
        limit=limit,
    )
    return [ServiceTicketResponse.model_validate(t) for t in items]


@router.get(
    "/{ticket_id}",
    response_model=ServiceTicketResponse,
    summary="Get Service Ticket by ID",
    description="Fetches service ticket details.",
)
def get_ticket(
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ServiceTicketResponse:
    """Fetch ticket."""
    tkt = ServiceTicketService.get_ticket_by_id(db, ticket_id)
    return ServiceTicketResponse.model_validate(tkt)


@router.patch(
    "/{ticket_id}/assign",
    response_model=ServiceTicketResponse,
    summary="Assign Ticket to Technician",
    description="Dispatches service ticket to field technician.",
)
def assign_ticket(
    ticket_id: uuid.UUID,
    payload: ServiceTicketAssign,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ServiceTicketResponse:
    """Assign ticket."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    tkt = ServiceTicketService.assign_ticket(
        db=db,
        ticket_id=ticket_id,
        technician_id=payload.assigned_technician_id,
        acting_user_id=user_id,
    )
    return ServiceTicketResponse.model_validate(tkt)


@router.patch(
    "/{ticket_id}/status",
    response_model=ServiceTicketResponse,
    summary="Update Ticket Status",
    description="Updates ticket status in support workflow.",
)
def update_ticket_status(
    ticket_id: uuid.UUID,
    payload: ServiceTicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ServiceTicketResponse:
    """Update status."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    tkt = ServiceTicketService.update_ticket_status(
        db=db,
        ticket_id=ticket_id,
        payload=payload,
        acting_user_id=user_id,
    )
    return ServiceTicketResponse.model_validate(tkt)


@router.patch(
    "/{ticket_id}/resolve",
    response_model=ServiceTicketResponse,
    summary="Resolve Service Ticket",
    description="Resolves ticket. Requires mandatory corrective action resolution notes.",
)
def resolve_ticket(
    ticket_id: uuid.UUID,
    payload: ServiceTicketResolve,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ServiceTicketResponse:
    """Resolve ticket with resolution notes."""
    user_id = uuid.UUID(current_user.id) if current_user else None
    tkt = ServiceTicketService.resolve_ticket(
        db=db,
        ticket_id=ticket_id,
        resolution_notes=payload.resolution_notes,
        acting_user_id=user_id,
    )
    return ServiceTicketResponse.model_validate(tkt)
