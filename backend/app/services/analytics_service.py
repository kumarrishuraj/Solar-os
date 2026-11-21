"""Business Analytics SQL Calculation Service.

Computes real-time executive dashboard KPIs, pipeline figures, revenue,
inventory valuation, and technician performance metrics directly from database records.
Never returns hardcoded mock numbers.
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.payment import PaymentModel
from app.models.quotation import QuotationModel
from app.models.project import ProjectModel
from app.models.lead import LeadModel
from app.models.survey import SiteSurveyModel
from app.models.installation import InstallationModel
from app.models.inventory import InventoryModel
from app.models.product import ProductModel
from app.models.service_ticket import ServiceTicketModel
from app.models.user import UserModel
from app.schemas.analytics import (
    DashboardAnalyticsResponse,
    RevenueAnalyticsResponse,
    ProjectAnalyticsResponse,
    InventoryAnalyticsResponse,
    TechnicianPerformance,
    TechnicianAnalyticsResponse,
    PaymentAnalyticsResponse,
)


class AnalyticsService:
    """Calculates live business analytics using SQL aggregates."""

    @staticmethod
    def get_dashboard_metrics(db: Session) -> DashboardAnalyticsResponse:
        """Executive KPI overview calculated from actual database records."""
        now = datetime.now(timezone.utc)
        start_of_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)

        # 1. Total completed revenue
        total_rev = (
            db.query(func.coalesce(func.sum(PaymentModel.amount), 0))
            .filter(PaymentModel.payment_status == "completed")
            .scalar()
        )
        total_revenue = Decimal(str(total_rev))

        # 2. Monthly revenue (current month)
        monthly_rev = (
            db.query(func.coalesce(func.sum(PaymentModel.amount), 0))
            .filter(
                PaymentModel.payment_status == "completed",
                PaymentModel.payment_date >= start_of_month,
            )
            .scalar()
        )
        monthly_revenue = Decimal(str(monthly_rev))

        # 3. Total quoted amount from approved quotations
        total_quoted = (
            db.query(func.coalesce(func.sum(QuotationModel.total_amount), 0))
            .filter(QuotationModel.quotation_status == "approved")
            .scalar()
        )
        outstanding = max(Decimal("0.00"), Decimal(str(total_quoted)) - total_revenue)

        # 4. Total and active projects
        total_projects = db.query(ProjectModel).count()
        active_projects = (
            db.query(ProjectModel)
            .filter(ProjectModel.project_status.notin_(["completed", "cancelled"]))
            .count()
        )

        # 5. Completed installations
        completed_inst = (
            db.query(InstallationModel)
            .filter(InstallationModel.installation_status == "completed")
            .count()
        )

        # 6. New leads
        new_leads = db.query(LeadModel).filter(LeadModel.status == "new").count()

        # 7. Pending surveys
        pending_surveys = (
            db.query(SiteSurveyModel)
            .filter(SiteSurveyModel.approval_status == "pending")
            .count()
        )

        # 8. Pending quotations
        pending_quotes = (
            db.query(QuotationModel)
            .filter(QuotationModel.quotation_status.in_(["draft", "sent"]))
            .count()
        )

        # 9. Low stock items
        all_inventory = db.query(InventoryModel).all()
        low_stock_items = sum(1 for i in all_inventory if i.available_stock <= i.reorder_level)

        # 10. Open service tickets
        open_tickets = (
            db.query(ServiceTicketModel)
            .filter(ServiceTicketModel.ticket_status.in_(["open", "assigned", "in_progress"]))
            .count()
        )

        return DashboardAnalyticsResponse(
            total_revenue=total_revenue,
            monthly_revenue=monthly_revenue,
            outstanding_payments=outstanding,
            total_projects=total_projects,
            active_projects=active_projects,
            completed_installations=completed_inst,
            new_leads=new_leads,
            pending_surveys=pending_surveys,
            pending_quotations=pending_quotes,
            low_stock_items=low_stock_items,
            open_service_tickets=open_tickets,
        )

    @staticmethod
    def get_revenue_metrics(db: Session) -> RevenueAnalyticsResponse:
        """Detailed revenue breakdown."""
        dashboard = AnalyticsService.get_dashboard_metrics(db)

        # Breakdown by payment method
        methods_query = (
            db.query(PaymentModel.payment_method, func.sum(PaymentModel.amount))
            .filter(PaymentModel.payment_status == "completed")
            .group_by(PaymentModel.payment_method)
            .all()
        )
        methods_breakdown = {m[0]: Decimal(str(m[1])) for m in methods_query}

        # Recent transactions
        recent_payments = (
            db.query(PaymentModel)
            .order_by(PaymentModel.payment_date.desc())
            .limit(10)
            .all()
        )
        recent_txs = [
            {
                "id": str(p.id),
                "amount": float(p.amount),
                "method": p.payment_method,
                "status": p.payment_status,
                "reference": p.transaction_reference,
                "date": p.payment_date.isoformat(),
            }
            for p in recent_payments
        ]

        return RevenueAnalyticsResponse(
            total_revenue=dashboard.total_revenue,
            monthly_revenue=dashboard.monthly_revenue,
            total_outstanding=dashboard.outstanding_payments,
            payment_methods_breakdown=methods_breakdown,
            recent_transactions=recent_txs,
        )

    @staticmethod
    def get_project_metrics(db: Session) -> ProjectAnalyticsResponse:
        """Project pipeline breakdown."""
        total = db.query(ProjectModel).count()
        statuses_query = (
            db.query(ProjectModel.project_status, func.count(ProjectModel.id))
            .group_by(ProjectModel.project_status)
            .all()
        )
        status_counts = {s[0]: s[1] for s in statuses_query}

        prop_kw = db.query(func.coalesce(func.sum(ProjectModel.proposed_capacity_kw), 0)).scalar()
        app_kw = db.query(func.coalesce(func.sum(ProjectModel.approved_capacity_kw), 0)).scalar()

        return ProjectAnalyticsResponse(
            total_projects=total,
            status_breakdown=status_counts,
            total_proposed_kw=Decimal(str(prop_kw)),
            total_approved_kw=Decimal(str(app_kw)),
        )

    @staticmethod
    def get_inventory_metrics(db: Session) -> InventoryAnalyticsResponse:
        """Warehouse stock metrics and valuation."""
        items = db.query(InventoryModel).all()
        total_items = len(items)

        # Valuation = quantity_on_hand * product.purchase_price
        valuation = Decimal("0.00")
        low_stock_list: List[Dict[str, Any]] = []

        for item in items:
            prod = db.query(ProductModel).filter(ProductModel.id == item.product_id).first()
            if prod:
                valuation += item.quantity_on_hand * prod.purchase_price
                if item.available_stock <= item.reorder_level:
                    low_stock_list.append({
                        "product_name": prod.product_name,
                        "sku": prod.sku,
                        "warehouse": item.warehouse_name,
                        "available": float(item.available_stock),
                        "reorder_level": float(item.reorder_level),
                    })

        return InventoryAnalyticsResponse(
            total_items=total_items,
            total_valuation=valuation,
            low_stock_count=len(low_stock_list),
            low_stock_items=low_stock_list,
        )

    @staticmethod
    def get_technician_metrics(db: Session) -> TechnicianAnalyticsResponse:
        """Technician installation and service metrics."""
        technicians = db.query(UserModel).filter(UserModel.role == "technician").all()
        results: List[TechnicianPerformance] = []

        for tech in technicians:
            completed_inst = (
                db.query(InstallationModel)
                .filter(
                    InstallationModel.assigned_technician_id == tech.id,
                    InstallationModel.installation_status == "completed",
                )
                .count()
            )
            active_inst = (
                db.query(InstallationModel)
                .filter(
                    InstallationModel.assigned_technician_id == tech.id,
                    InstallationModel.installation_status.in_(["scheduled", "in_progress", "testing"]),
                )
                .count()
            )
            resolved_tkt = (
                db.query(ServiceTicketModel)
                .filter(
                    ServiceTicketModel.assigned_technician_id == tech.id,
                    ServiceTicketModel.ticket_status.in_(["resolved", "closed"]),
                )
                .count()
            )
            results.append(
                TechnicianPerformance(
                    technician_id=str(tech.id),
                    full_name=tech.full_name,
                    completed_installations=completed_inst,
                    active_installations=active_inst,
                    resolved_tickets=resolved_tkt,
                )
            )

        return TechnicianAnalyticsResponse(technicians=results)

    @staticmethod
    def get_payment_metrics(db: Session) -> PaymentAnalyticsResponse:
        """Payment status breakdown."""
        total_paid = (
            db.query(func.coalesce(func.sum(PaymentModel.amount), 0))
            .filter(PaymentModel.payment_status == "completed")
            .scalar()
        )
        total_pending = (
            db.query(func.coalesce(func.sum(PaymentModel.amount), 0))
            .filter(PaymentModel.payment_status == "pending")
            .scalar()
        )

        status_counts = (
            db.query(PaymentModel.payment_status, func.count(PaymentModel.id))
            .group_by(PaymentModel.payment_status)
            .all()
        )
        breakdown = {s[0]: s[1] for s in status_counts}

        return PaymentAnalyticsResponse(
            total_paid=Decimal(str(total_paid)),
            total_pending=Decimal(str(total_pending)),
            payment_status_breakdown=breakdown,
        )
