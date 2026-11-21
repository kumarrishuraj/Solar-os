"""Service Ticket Management Service.

Handles post-commissioning customer issues, hardware faults, technician assignment,
and issue resolution workflows.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.service_ticket import ServiceTicketModel
from app.models.customer import CustomerModel
from app.models.user import UserModel
from app.schemas.service_ticket import ServiceTicketCreate, ServiceTicketStatusUpdate
from app.core.audit import record_audit_log


VALID_CATEGORIES = {
    "inverter_fault",
    "panel_damage",
    "generation_drop",
    "wiring_issue",
    "physical_damage",
    "routine_maintenance",
    "other",
}

VALID_PRIORITIES = {"low", "medium", "high", "critical"}
VALID_STATUSES = {"open", "assigned", "in_progress", "pending_parts", "resolved", "closed"}


def generate_ticket_number(db: Session) -> str:
    """Generate sequential unique ticket identifier (TKT-YYYY-NNNN)."""
    current_year = datetime.now(timezone.utc).year
    prefix = f"TKT-{current_year}-"
    count = db.query(ServiceTicketModel).count()
    return f"{prefix}{count + 1:04d}"


class ServiceTicketService:
    """Business operations for post-commissioning maintenance tickets."""

    @staticmethod
    def create_ticket(
        db: Session,
        payload: ServiceTicketCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> ServiceTicketModel:
        """Create support or repair service ticket."""
        customer = db.query(CustomerModel).filter(CustomerModel.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer '{payload.customer_id}' not found",
            )

        cat = payload.issue_category.lower().strip()
        if cat not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid issue_category '{payload.issue_category}'. Allowed: {sorted(list(VALID_CATEGORIES))}",
            )

        prio = (payload.priority or "medium").lower().strip()
        if prio not in VALID_PRIORITIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid priority '{payload.priority}'. Allowed: {sorted(list(VALID_PRIORITIES))}",
            )

        ticket = ServiceTicketModel(
            id=uuid.uuid4(),
            ticket_number=generate_ticket_number(db),
            customer_id=payload.customer_id,
            project_id=payload.project_id,
            equipment_id=payload.equipment_id,
            issue_description=payload.issue_description.strip(),
            issue_category=cat,
            priority=prio,
            ticket_status="open",
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        record_audit_log(
            db=db,
            action="ticket_created",
            entity_type="service_tickets",
            entity_id=ticket.id,
            user_id=acting_user_id,
            metadata={"ticket_number": ticket.ticket_number, "priority": ticket.priority},
        )

        return ticket

    @staticmethod
    def list_tickets(
        db: Session,
        customer_id: Optional[uuid.UUID] = None,
        project_id: Optional[uuid.UUID] = None,
        technician_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
        priority: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[ServiceTicketModel], int]:
        """List tickets with pagination and filtering."""
        query = db.query(ServiceTicketModel)

        if customer_id:
            query = query.filter(ServiceTicketModel.customer_id == customer_id)
        if project_id:
            query = query.filter(ServiceTicketModel.project_id == project_id)
        if technician_id:
            query = query.filter(ServiceTicketModel.assigned_technician_id == technician_id)
        if status_filter:
            query = query.filter(ServiceTicketModel.ticket_status == status_filter)
        if priority:
            query = query.filter(ServiceTicketModel.priority == priority)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(ServiceTicketModel.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_ticket_by_id(db: Session, ticket_id: uuid.UUID) -> ServiceTicketModel:
        """Fetch service ticket by ID."""
        ticket = db.query(ServiceTicketModel).filter(ServiceTicketModel.id == ticket_id).first()
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service ticket '{ticket_id}' not found",
            )
        return ticket

    @staticmethod
    def assign_ticket(
        db: Session,
        ticket_id: uuid.UUID,
        technician_id: uuid.UUID,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> ServiceTicketModel:
        """Assign service ticket to field technician."""
        ticket = ServiceTicketService.get_ticket_by_id(db, ticket_id)

        technician = db.query(UserModel).filter(UserModel.id == technician_id).first()
        if not technician:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Technician '{technician_id}' not found",
            )

        ticket.assigned_technician_id = technician_id
        if ticket.ticket_status == "open":
            ticket.ticket_status = "assigned"

        record_audit_log(
            db=db,
            action="ticket_assigned",
            entity_type="service_tickets",
            entity_id=ticket.id,
            user_id=acting_user_id,
            metadata={"technician_id": str(technician_id)},
        )

        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def update_ticket_status(
        db: Session,
        ticket_id: uuid.UUID,
        payload: ServiceTicketStatusUpdate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> ServiceTicketModel:
        """Update ticket status."""
        st = payload.ticket_status.lower().strip()
        if st not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid ticket status '{payload.ticket_status}'. Allowed: {sorted(list(VALID_STATUSES))}",
            )

        ticket = ServiceTicketService.get_ticket_by_id(db, ticket_id)
        ticket.ticket_status = st
        if payload.resolution_notes:
            ticket.resolution_notes = payload.resolution_notes
        if st in ("resolved", "closed") and not ticket.resolved_at:
            ticket.resolved_at = datetime.now(timezone.utc)

        record_audit_log(
            db=db,
            action="ticket_status_changed",
            entity_type="service_tickets",
            entity_id=ticket.id,
            user_id=acting_user_id,
            metadata={"new_status": st},
        )

        db.commit()
        db.refresh(ticket)
        return ticket

    @staticmethod
    def resolve_ticket(
        db: Session,
        ticket_id: uuid.UUID,
        resolution_notes: str,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> ServiceTicketModel:
        """Resolve service ticket with resolution notes."""
        if not resolution_notes or len(resolution_notes.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resolution notes (minimum 5 characters) are required",
            )

        ticket = ServiceTicketService.get_ticket_by_id(db, ticket_id)
        ticket.ticket_status = "resolved"
        ticket.resolution_notes = resolution_notes.strip()
        ticket.resolved_at = datetime.now(timezone.utc)

        record_audit_log(
            db=db,
            action="ticket_resolved",
            entity_type="service_tickets",
            entity_id=ticket.id,
            user_id=acting_user_id,
            metadata={"resolution_notes": resolution_notes},
        )

        db.commit()
        db.refresh(ticket)
        return ticket
