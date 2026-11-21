"""SolarOS Database Models Package.

Exports all SQLAlchemy ORM models matching the approved PostgreSQL database schema.
"""

from app.models.user import UserModel
from app.models.customer import CustomerModel
from app.models.lead import LeadModel
from app.models.project import ProjectModel
from app.models.assessment import (
    PropertyAssessmentModel,
    AssessmentImageModel,
    AIAnalysisResultModel,
)
from app.models.survey import SiteSurveyModel
from app.models.product import ProductModel
from app.models.recommendation import SolarRecommendationModel
from app.models.quotation import QuotationModel, QuotationItemModel
from app.models.payment import PaymentModel
from app.models.inventory import InventoryModel, InventoryMovementModel
from app.models.equipment import EquipmentModel
from app.models.installation import InstallationModel, InstallationChecklistModel
from app.models.warranty import WarrantyModel
from app.models.telemetry import TelemetryModel
from app.models.service_ticket import ServiceTicketModel
from app.models.audit_log import AuditLogModel

__all__ = [
    "UserModel",
    "CustomerModel",
    "LeadModel",
    "ProjectModel",
    "PropertyAssessmentModel",
    "AssessmentImageModel",
    "AIAnalysisResultModel",
    "SiteSurveyModel",
    "ProductModel",
    "SolarRecommendationModel",
    "QuotationModel",
    "QuotationItemModel",
    "PaymentModel",
    "InventoryModel",
    "InventoryMovementModel",
    "EquipmentModel",
    "InstallationModel",
    "InstallationChecklistModel",
    "WarrantyModel",
    "TelemetryModel",
    "ServiceTicketModel",
    "AuditLogModel",
]
