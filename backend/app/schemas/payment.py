"""Pydantic schemas for payments."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class PaymentCreate(BaseModel):
    """Payment transaction creation."""

    project_id: uuid.UUID
    quotation_id: Optional[uuid.UUID] = None
    amount: Decimal = Field(..., gt=0)
    payment_method: str = Field(..., description="e.g. neft, rtgs, upi, cheque, net_banking, cash, bank_transfer")
    transaction_reference: str = Field(..., min_length=2, max_length=150)
    payment_date: Optional[datetime] = None


class PaymentResponse(BaseModel):
    """Payment transaction response."""

    id: uuid.UUID
    project_id: uuid.UUID
    quotation_id: Optional[uuid.UUID] = None
    amount: Decimal
    payment_method: str
    transaction_reference: str
    payment_status: str
    payment_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectPaymentSummary(BaseModel):
    """Project financial status including total quoted, paid, and outstanding balance."""

    project_id: uuid.UUID
    total_quoted: Decimal
    total_paid: Decimal
    outstanding_balance: Decimal
    payments: List[PaymentResponse] = []
