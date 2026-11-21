"""Pydantic schemas for real SQL-calculated business analytics."""

from decimal import Decimal
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DashboardAnalyticsResponse(BaseModel):
    """Executive KPI overview calculated from actual database records."""

    total_revenue: Decimal
    monthly_revenue: Decimal
    outstanding_payments: Decimal
    total_projects: int
    active_projects: int
    completed_installations: int
    new_leads: int
    pending_surveys: int
    pending_quotations: int
    low_stock_items: int
    open_service_tickets: int


class RevenueAnalyticsResponse(BaseModel):
    """Revenue metrics breakdown."""

    total_revenue: Decimal
    monthly_revenue: Decimal
    total_outstanding: Decimal
    payment_methods_breakdown: Dict[str, Decimal] = {}
    recent_transactions: List[Dict[str, Any]] = []


class ProjectAnalyticsResponse(BaseModel):
    """Project lifecycle pipeline counts."""

    total_projects: int
    status_breakdown: Dict[str, int] = {}
    total_proposed_kw: Decimal = Decimal("0.00")
    total_approved_kw: Decimal = Decimal("0.00")


class InventoryAnalyticsResponse(BaseModel):
    """Warehouse inventory valuation and stock levels."""

    total_items: int
    total_valuation: Decimal
    low_stock_count: int
    low_stock_items: List[Dict[str, Any]] = []


class TechnicianPerformance(BaseModel):
    """Field staff performance metrics."""

    technician_id: str
    full_name: str
    completed_installations: int
    active_installations: int
    resolved_tickets: int


class TechnicianAnalyticsResponse(BaseModel):
    """Technicians roster metrics."""

    technicians: List[TechnicianPerformance] = []


class PaymentAnalyticsResponse(BaseModel):
    """Payment cash flow metrics."""

    total_paid: Decimal
    total_pending: Decimal
    payment_status_breakdown: Dict[str, int] = {}
