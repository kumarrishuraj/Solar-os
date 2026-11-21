"""Payment Management Business Logic Service.

Records customer advance and milestone payments, validates payment methods,
and tracks project outstanding balances with Decimal precision.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.payment import PaymentModel
from app.models.project import ProjectModel
from app.models.quotation import QuotationModel
from app.schemas.payment import PaymentCreate, ProjectPaymentSummary, PaymentResponse
from app.core.audit import record_audit_log


VALID_PAYMENT_METHODS = {
    "neft",
    "rtgs",
    "upi",
    "cheque",
    "net_banking",
    "cash",
    "bank_transfer",
    "credit_line",
}


class PaymentService:
    """Business operations for milestone payments and remittances."""

    @staticmethod
    def record_payment(
        db: Session,
        payload: PaymentCreate,
        acting_user_id: Optional[uuid.UUID] = None,
    ) -> PaymentModel:
        """Record a customer milestone payment."""
        project = db.query(ProjectModel).filter(ProjectModel.id == payload.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{payload.project_id}' not found",
            )

        method = payload.payment_method.lower().strip()
        if method not in VALID_PAYMENT_METHODS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid payment method '{payload.payment_method}'. Allowed: {sorted(list(VALID_PAYMENT_METHODS))}",
            )

        if payload.quotation_id:
            quotation = db.query(QuotationModel).filter(QuotationModel.id == payload.quotation_id).first()
            if not quotation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Quotation '{payload.quotation_id}' not found",
                )

        amount = Decimal(str(payload.amount))
        payment = PaymentModel(
            id=uuid.uuid4(),
            project_id=payload.project_id,
            quotation_id=payload.quotation_id,
            amount=amount,
            payment_method=method,
            transaction_reference=payload.transaction_reference.strip(),
            payment_status="completed",
            payment_date=payload.payment_date or datetime.now(timezone.utc),
        )
        db.add(payment)

        # If project is in quotation_approved or payment_pending, advance to payment_pending / ready_for_dispatch
        if project.project_status == "quotation_approved":
            project.project_status = "payment_pending"

        record_audit_log(
            db=db,
            action="payment_recorded",
            entity_type="payments",
            entity_id=payment.id,
            user_id=acting_user_id,
            metadata={"amount": str(amount), "reference": payment.transaction_reference},
        )

        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    def list_payments(
        db: Session,
        project_id: Optional[uuid.UUID] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[PaymentModel], int]:
        """List payments with pagination."""
        query = db.query(PaymentModel)
        if project_id:
            query = query.filter(PaymentModel.project_id == project_id)

        total = query.count()
        offset = (page - 1) * limit
        items = query.order_by(PaymentModel.payment_date.desc()).offset(offset).limit(limit).all()
        return items, total

    @staticmethod
    def get_payment_by_id(db: Session, payment_id: uuid.UUID) -> PaymentModel:
        """Fetch payment transaction by ID."""
        payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payment transaction '{payment_id}' not found",
            )
        return payment

    @staticmethod
    def get_project_payments_summary(db: Session, project_id: uuid.UUID) -> ProjectPaymentSummary:
        """Calculate total billed, total received, and outstanding balance for a project."""
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{project_id}' not found",
            )

        # Find total quoted amount from approved quotations
        approved_quotations = (
            db.query(QuotationModel)
            .filter(QuotationModel.project_id == project_id, QuotationModel.quotation_status == "approved")
            .all()
        )
        total_quoted = sum((q.total_amount for q in approved_quotations), Decimal("0.00"))
        if total_quoted == Decimal("0.00") and project.final_cost:
            total_quoted = project.final_cost

        # Sum completed payments
        payments = db.query(PaymentModel).filter(PaymentModel.project_id == project_id).order_by(PaymentModel.payment_date.desc()).all()
        total_paid = sum((p.amount for p in payments if p.payment_status == "completed"), Decimal("0.00"))
        outstanding = max(Decimal("0.00"), total_quoted - total_paid)

        return ProjectPaymentSummary(
            project_id=project_id,
            total_quoted=total_quoted,
            total_paid=total_paid,
            outstanding_balance=outstanding,
            payments=[PaymentResponse.model_validate(p) for p in payments],
        )
