"""Customer and Lead Business Logic Service.

Handles enquiry intake workflow, customer identification, lead number generation,
CRM filtering, pagination, and status transitions.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, desc
from fastapi import HTTPException, status

from app.models.customer import CustomerModel
from app.models.lead import LeadModel
from app.models.assessment import PropertyAssessmentModel
from app.schemas.lead import LeadEnquiryIntakeRequest, LeadCreate, LeadUpdate
from app.core.audit import record_audit_log


def generate_lead_number(db: Session) -> str:
    """Generate sequential, human-readable lead identifier (LEAD-YYYY-NNNN)."""
    current_year = datetime.now(timezone.utc).year
    prefix = f"LEAD-{current_year}-"
    
    # Query latest lead created in current year
    count = db.query(func.count(LeadModel.id)).scalar() or 0
    seq = count + 1
    return f"{prefix}{seq:04d}"


class CustomerLeadService:
    """Business operations for customers and sales leads."""

    @staticmethod
    def process_enquiry_intake(
        db: Session,
        request: LeadEnquiryIntakeRequest,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> Tuple[CustomerModel, LeadModel, Optional[PropertyAssessmentModel]]:
        """Core Enquiry Intake Workflow:
        1. Validate customer information
        2. Create or identify existing customer by phone or email
        3. Create lead record with unique lead number
        4. Create property assessment if rooftop or energy details are provided
        5. Return the relevant entity instances
        """
        # 1 & 2: Identify or create Customer
        customer = None
        if request.phone:
            customer = db.query(CustomerModel).filter(CustomerModel.phone == request.phone.strip()).first()
        if not customer and request.email:
            customer = db.query(CustomerModel).filter(CustomerModel.email == request.email.strip()).first()

        if not customer:
            customer = CustomerModel(
                id=uuid.uuid4(),
                full_name=request.full_name.strip(),
                email=request.email.strip() if request.email else None,
                phone=request.phone.strip(),
                property_address=request.property_address.strip(),
                city=request.city.strip(),
                state=request.state.strip(),
                postal_code=request.postal_code.strip(),
                property_type=request.property_type or "residential",
                notes=request.notes,
            )
            db.add(customer)
            db.flush()
        else:
            # Update address if provided
            if request.property_address:
                customer.property_address = request.property_address.strip()
            if request.city:
                customer.city = request.city.strip()
            if request.state:
                customer.state = request.state.strip()
            if request.postal_code:
                customer.postal_code = request.postal_code.strip()

        # 3: Create Lead
        lead_num = generate_lead_number(db)
        lead = LeadModel(
            id=uuid.uuid4(),
            lead_number=lead_num,
            customer_id=customer.id,
            source=request.source or "website",
            monthly_electricity_bill=request.monthly_bill,
            monthly_consumption_kwh=request.monthly_consumption_kwh,
            estimated_system_capacity_kw=request.estimated_capacity_kw,
            status="new",
            notes=request.notes,
        )
        db.add(lead)
        db.flush()

        # 4: Create Property Assessment if details provided (dimensions can be unknown)
        assessment = None
        has_assessment_data = any([
            request.roof_length is not None,
            request.roof_width is not None,
            request.roof_area is not None,
            request.usable_roof_area is not None,
            request.roof_type,
            request.roof_orientation,
            request.roof_tilt is not None,
            request.monthly_bill is not None,
            request.monthly_consumption_kwh is not None,
            request.preferred_solar_type,
            request.budget is not None,
        ])

        if has_assessment_data:
            assessment = PropertyAssessmentModel(
                id=uuid.uuid4(),
                customer_id=customer.id,
                lead_id=lead.id,
                property_address=customer.property_address,
                city=customer.city,
                state=customer.state,
                postal_code=customer.postal_code,
                roof_length=request.roof_length,
                roof_width=request.roof_width,
                roof_area=request.roof_area,
                usable_roof_area=request.usable_roof_area,
                measurement_unit=request.measurement_unit or "sq_meters",
                roof_type=request.roof_type,
                roof_orientation=request.roof_orientation,
                roof_tilt=request.roof_tilt,
                monthly_bill=request.monthly_bill,
                monthly_consumption_kwh=request.monthly_consumption_kwh,
                connection_phase=request.connection_phase,
                preferred_solar_type=request.preferred_solar_type,
                budget=request.budget,
                assessment_status="submitted",
            )
            db.add(assessment)
            db.flush()

        record_audit_log(
            db=db,
            action="enquiry_received",
            entity_type="leads",
            entity_id=lead.id,
            user_id=acting_user_id,
            metadata={"lead_number": lead.lead_number, "customer_id": str(customer.id)},
        )

        db.commit()
        db.refresh(lead)
        db.refresh(customer)
        if assessment:
            db.refresh(assessment)

        return customer, lead, assessment

    @staticmethod
    def list_leads(
        db: Session,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        city_filter: Optional[str] = None,
        source_filter: Optional[str] = None,
        salesperson_id: Optional[uuid.UUID] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[LeadModel], int]:
        """Query leads with filtering, search and pagination."""
        query = db.query(LeadModel).join(CustomerModel).options(joinedload(LeadModel.customer))

        if search:
            pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    LeadModel.lead_number.ilike(pattern),
                    CustomerModel.full_name.ilike(pattern),
                    CustomerModel.phone.ilike(pattern),
                    CustomerModel.email.ilike(pattern),
                    CustomerModel.city.ilike(pattern),
                )
            )

        if status_filter:
            query = query.filter(LeadModel.status == status_filter.strip())

        if city_filter:
            query = query.filter(CustomerModel.city.ilike(f"%{city_filter.strip()}%"))

        if source_filter:
            query = query.filter(LeadModel.source == source_filter.strip())

        if salesperson_id:
            query = query.filter(LeadModel.assigned_salesperson_id == salesperson_id)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(desc(LeadModel.created_at)).offset(offset).limit(limit).all()

        return items, total

    @staticmethod
    def get_lead_by_id(db: Session, lead_id: uuid.UUID) -> LeadModel:
        """Fetch single lead with customer relation."""
        lead = db.query(LeadModel).options(joinedload(LeadModel.customer)).filter(LeadModel.id == lead_id).first()
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lead with ID '{lead_id}' not found",
            )
        return lead

    @staticmethod
    def update_lead(
        db: Session,
        lead_id: uuid.UUID,
        payload: LeadUpdate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> LeadModel:
        """Update lead details."""
        lead = CustomerLeadService.get_lead_by_id(db, lead_id)
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(lead, field, value)

        record_audit_log(
            db=db,
            action="lead_updated",
            entity_type="leads",
            entity_id=lead.id,
            user_id=acting_user_id,
            metadata=update_data,
        )

        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def update_lead_status(
        db: Session,
        lead_id: uuid.UUID,
        new_status: str,
        notes: Optional[str] = None,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> LeadModel:
        """Transition lead status."""
        valid_statuses = {"new", "contacted", "qualified", "survey_scheduled", "quotation_sent", "converted", "lost"}
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid lead status '{new_status}'. Allowed: {sorted(list(valid_statuses))}",
            )

        lead = CustomerLeadService.get_lead_by_id(db, lead_id)
        old_status = lead.status
        lead.status = new_status
        if notes:
            lead.notes = f"{lead.notes or ''}\n[{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}] Status changed {old_status} -> {new_status}: {notes}".strip()

        record_audit_log(
            db=db,
            action="lead_status_changed",
            entity_type="leads",
            entity_id=lead.id,
            user_id=acting_user_id,
            metadata={"old_status": old_status, "new_status": new_status, "notes": notes},
        )

        db.commit()
        db.refresh(lead)
        return lead
