"""Business Analytics Routes.

Provides live SQL-calculated KPIs and metrics calculated directly from database records.
Never returns hardcoded mock numbers.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_optional, require_roles, AuthenticatedUser
from app.schemas.analytics import (
    DashboardAnalyticsResponse,
    RevenueAnalyticsResponse,
    ProjectAnalyticsResponse,
    InventoryAnalyticsResponse,
    TechnicianAnalyticsResponse,
    PaymentAnalyticsResponse,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Business Analytics"])


@router.get(
    "/dashboard",
    response_model=DashboardAnalyticsResponse,
    summary="Get Executive Dashboard Metrics",
    description="Calculates revenue, active projects, leads, completed installations, and pending surveys from real DB records.",
)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> DashboardAnalyticsResponse:
    """Calculate executive dashboard metrics."""
    return AnalyticsService.get_dashboard_metrics(db)


@router.get(
    "/revenue",
    response_model=RevenueAnalyticsResponse,
    summary="Get Revenue Analytics",
    description="Returns total revenue, monthly collections, outstanding balances, and payment method distribution.",
)
def get_revenue_analytics(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> RevenueAnalyticsResponse:
    """Calculate revenue breakdown."""
    return AnalyticsService.get_revenue_metrics(db)


@router.get(
    "/projects",
    response_model=ProjectAnalyticsResponse,
    summary="Get Project Lifecycle Analytics",
    description="Returns project counts grouped by lifecycle milestone and total proposed vs approved capacity.",
)
def get_project_analytics(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> ProjectAnalyticsResponse:
    """Calculate project pipeline metrics."""
    return AnalyticsService.get_project_metrics(db)


@router.get(
    "/inventory",
    response_model=InventoryAnalyticsResponse,
    summary="Get Warehouse Inventory Analytics",
    description="Calculates total warehouse valuation and lists items at or below reorder threshold.",
)
def get_inventory_analytics(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> InventoryAnalyticsResponse:
    """Calculate inventory valuation and alerts."""
    return AnalyticsService.get_inventory_metrics(db)


@router.get(
    "/technicians",
    response_model=TechnicianAnalyticsResponse,
    summary="Get Technician Performance Analytics",
    description="Returns installation completions and service ticket resolution stats per field technician.",
)
def get_technician_analytics(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> TechnicianAnalyticsResponse:
    """Calculate technician performance."""
    return AnalyticsService.get_technician_metrics(db)


@router.get(
    "/payments",
    response_model=PaymentAnalyticsResponse,
    summary="Get Payment Flow Analytics",
    description="Returns completed vs pending remittances and payment status distribution.",
)
def get_payment_analytics(
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_current_user_optional),
) -> PaymentAnalyticsResponse:
    """Calculate payment metrics."""
    return AnalyticsService.get_payment_metrics(db)
