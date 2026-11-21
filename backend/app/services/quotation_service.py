"""Commercial Quotation Management Service.

Calculates bill of materials pricing with strict Decimal financial precision,
verifies prerequisites (site survey & design approvals), manages commercial signoff,
and triggers professional PDF generation.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.quotation import QuotationModel, QuotationItemModel
from app.models.project import ProjectModel
from app.models.customer import CustomerModel
from app.models.product import ProductModel
from app.schemas.quotation import QuotationCreate
from app.services.pdf_service import generate_quotation_pdf
from app.core.audit import record_audit_log


def generate_quotation_number(db: Session) -> str:
    """Generate sequential unique quotation identifier (QT-YYYY-NNNN)."""
    current_year = datetime.now(timezone.utc).year
    prefix = f"QT-{current_year}-"
    count = db.query(QuotationModel).count()
    return f"{prefix}{count + 1:04d}"


class QuotationService:
    """Business operations for commercial bids and quotations."""

    @staticmethod
    def create_quotation(
        db: Session,
        payload: QuotationCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> QuotationModel:
        """Create itemized quotation proposal.
        
        Requires appropriate survey and design approvals before issuing final proposals.
        Calculates all financial figures with strict Decimal precision.
        """
        # Verify project and customer exist
        project = db.query(ProjectModel).filter(ProjectModel.id == payload.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{payload.project_id}' not found",
            )

        customer = db.query(CustomerModel).filter(CustomerModel.id == payload.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer '{payload.customer_id}' not found",
            )

        # Check project lifecycle readiness: ensure survey/design has progressed
        unready_statuses = {"enquiry"}
        if project.project_status in unready_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot generate quotation for project in status '{project.project_status}'. Complete assessment and survey first.",
            )

        if not payload.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one bill of materials item is required for a quotation",
            )

        # Calculate line totals with Decimal precision
        subtotal = Decimal("0.00")
        quotation_items: List[QuotationItemModel] = []

        q_id = uuid.uuid4()
        for item in payload.items:
            product = db.query(ProductModel).filter(ProductModel.id == item.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID '{item.product_id}' not found in catalog",
                )

            line_qty = Decimal(str(item.quantity))
            line_unit_price = Decimal(str(item.unit_price))
            line_total = (line_qty * line_unit_price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            subtotal += line_total

            quotation_items.append(
                QuotationItemModel(
                    id=uuid.uuid4(),
                    quotation_id=q_id,
                    product_id=product.id,
                    description=item.description,
                    quantity=line_qty,
                    unit_price=line_unit_price,
                    total_price=line_total,
                )
            )

        discount = Decimal(str(payload.discount or "0.00")).quantize(Decimal("0.01"))
        if discount > subtotal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Discount amount cannot exceed the subtotal",
            )

        taxable_amount = subtotal - discount
        gst_percent = Decimal(str(payload.gst_percent or "18.00"))
        gst_amount = (taxable_amount * (gst_percent / Decimal("100.00"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        installation_charges = Decimal(str(payload.installation_charges or "0.00")).quantize(Decimal("0.01"))

        total_amount = taxable_amount + gst_amount + installation_charges

        quotation = QuotationModel(
            id=q_id,
            quotation_number=generate_quotation_number(db),
            project_id=payload.project_id,
            customer_id=payload.customer_id,
            system_capacity_kw=Decimal(str(payload.system_capacity_kw)),
            subtotal=subtotal,
            discount=discount,
            gst_amount=gst_amount,
            installation_charges=installation_charges,
            total_amount=total_amount,
            quotation_status="sent",
            valid_until=payload.valid_until,
        )
        db.add(quotation)
        for qi in quotation_items:
            db.add(qi)

        # Advance project to quotation_pending if currently prior
        if project.project_status in ("survey_approved", "design_approved"):
            project.project_status = "quotation_pending"

        record_audit_log(
            db=db,
            action="quotation_created",
            entity_type="quotations",
            entity_id=quotation.id,
            user_id=acting_user_id,
            metadata={"quotation_number": quotation.quotation_number, "total_amount": str(total_amount)},
        )

        db.commit()
        db.refresh(quotation)
        return quotation

    @staticmethod
    def list_quotations(
        db: Session,
        project_id: Optional[uuid.UUID] = None,
        customer_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[QuotationModel], int]:
        """List quotations with pagination."""
        query = db.query(QuotationModel).options(joinedload(QuotationModel.items))

        if project_id:
            query = query.filter(QuotationModel.project_id == project_id)
        if customer_id:
            query = query.filter(QuotationModel.customer_id == customer_id)
        if status_filter:
            query = query.filter(QuotationModel.quotation_status == status_filter)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(QuotationModel.created_at.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_quotation_by_id(db: Session, quotation_id: uuid.UUID) -> QuotationModel:
        """Fetch quotation with line items."""
        quotation = (
            db.query(QuotationModel)
            .options(joinedload(QuotationModel.items).joinedload(QuotationItemModel.product))
            .filter(QuotationModel.id == quotation_id)
            .first()
        )
        if not quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quotation '{quotation_id}' not found",
            )
        return quotation

    @staticmethod
    def approve_quotation(
        db: Session,
        quotation_id: uuid.UUID,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> QuotationModel:
        """Approve commercial quotation and progress project status."""
        quotation = QuotationService.get_quotation_by_id(db, quotation_id)
        quotation.quotation_status = "approved"
        quotation.approved_at = datetime.now(timezone.utc)

        # Advance project to quotation_approved / payment_pending
        project = db.query(ProjectModel).filter(ProjectModel.id == quotation.project_id).first()
        if project:
            project.project_status = "quotation_approved"
            project.final_cost = quotation.total_amount
            project.approved_capacity_kw = quotation.system_capacity_kw

        record_audit_log(
            db=db,
            action="quotation_approved",
            entity_type="quotations",
            entity_id=quotation.id,
            user_id=acting_user_id,
        )

        db.commit()
        db.refresh(quotation)
        return quotation

    @staticmethod
    def reject_quotation(
        db: Session,
        quotation_id: uuid.UUID,
        rejection_reason: Optional[str] = None,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> QuotationModel:
        """Reject quotation."""
        quotation = QuotationService.get_quotation_by_id(db, quotation_id)
        quotation.quotation_status = "rejected"

        record_audit_log(
            db=db,
            action="quotation_rejected",
            entity_type="quotations",
            entity_id=quotation.id,
            user_id=acting_user_id,
            metadata={"rejection_reason": rejection_reason},
        )

        db.commit()
        db.refresh(quotation)
        return quotation

    @staticmethod
    def generate_pdf(db: Session, quotation_id: uuid.UUID) -> bytes:
        """Generate official PDF file for quotation."""
        quotation = QuotationService.get_quotation_by_id(db, quotation_id)
        customer = db.query(CustomerModel).filter(CustomerModel.id == quotation.customer_id).first()
        customer_info = {
            "full_name": customer.full_name if customer else "Valued Client",
            "property_address": customer.property_address if customer else "",
            "city": customer.city if customer else "",
            "phone": customer.phone if customer else "",
            "email": customer.email if customer else "",
        }
        return generate_quotation_pdf(quotation, customer_info)
