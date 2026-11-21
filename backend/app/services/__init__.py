"""SolarOS Backend Services Package."""

from app.services.pdf_service import generate_quotation_pdf
from app.services.auth_service import (
    seed_default_users_if_needed,
    authenticate_user,
    issue_token_for_user,
)
from app.services.customer_lead_service import CustomerLeadService
from app.services.assessment_service import AssessmentService
from app.services.recommendation_service import RecommendationService
from app.services.survey_service import SurveyService
from app.services.project_service import ProjectService
from app.services.quotation_service import QuotationService
from app.services.payment_service import PaymentService
from app.services.inventory_service import InventoryService
from app.services.equipment_service import EquipmentService
from app.services.installation_service import InstallationService
from app.services.warranty_service import WarrantyService
from app.services.monitoring_service import MonitoringService
from app.services.service_ticket_service import ServiceTicketService
from app.services.analytics_service import AnalyticsService

__all__ = [
    "generate_quotation_pdf",
    "seed_default_users_if_needed",
    "authenticate_user",
    "issue_token_for_user",
    "CustomerLeadService",
    "AssessmentService",
    "RecommendationService",
    "SurveyService",
    "ProjectService",
    "QuotationService",
    "PaymentService",
    "InventoryService",
    "EquipmentService",
    "InstallationService",
    "WarrantyService",
    "MonitoringService",
    "ServiceTicketService",
    "AnalyticsService",
]
