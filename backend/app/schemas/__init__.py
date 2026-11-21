"""Pydantic Schemas Package for SolarOS."""

from app.schemas.health import HealthResponse, RootInfoResponse
from app.schemas.auth import Token, LoginRequest, UserCreate, UserResponse
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadStatusUpdate,
    LeadEnquiryIntakeRequest,
    LeadEnquiryIntakeResponse,
    LeadResponse,
    LeadListResponse,
)
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentImageResponse,
    AssessmentResponse,
)
from app.schemas.survey import (
    SurveyCreate,
    SurveyUpdate,
    SurveyRejectRequest,
    SurveyResponse,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectStatusUpdate,
    ProjectResponse,
)
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationUpdate,
    RecommendationResponse,
)
from app.schemas.quotation import (
    QuotationItemCreate,
    QuotationItemResponse,
    QuotationCreate,
    QuotationRejectRequest,
    QuotationResponse,
)
from app.schemas.payment import PaymentCreate, PaymentResponse, ProjectPaymentSummary
from app.schemas.inventory import (
    InventoryStockAdjustRequest,
    InventoryStockResponse,
    InventoryMovementResponse,
)
from app.schemas.equipment import EquipmentCreate, EquipmentDispatch, EquipmentResponse
from app.schemas.installation import (
    ChecklistItemUpdate,
    ChecklistBatchUpdateRequest,
    InstallationCreate,
    InstallationStatusUpdate,
    InstallationCompleteRequest,
    ChecklistItemResponse,
    InstallationResponse,
)
from app.schemas.warranty import WarrantyCreate, WarrantyResponse
from app.schemas.monitoring import (
    TelemetryCreate,
    TelemetryResponse,
    EquipmentTelemetryHistory,
)
from app.schemas.service_ticket import (
    ServiceTicketCreate,
    ServiceTicketAssign,
    ServiceTicketStatusUpdate,
    ServiceTicketResolve,
    ServiceTicketResponse,
)
from app.schemas.analytics import (
    DashboardAnalyticsResponse,
    RevenueAnalyticsResponse,
    ProjectAnalyticsResponse,
    InventoryAnalyticsResponse,
    TechnicianAnalyticsResponse,
    PaymentAnalyticsResponse,
)

__all__ = [
    "HealthResponse",
    "RootInfoResponse",
    "Token",
    "LoginRequest",
    "UserCreate",
    "UserResponse",
    "CustomerCreate",
    "CustomerUpdate",
    "CustomerResponse",
    "LeadCreate",
    "LeadUpdate",
    "LeadStatusUpdate",
    "LeadEnquiryIntakeRequest",
    "LeadEnquiryIntakeResponse",
    "LeadResponse",
    "LeadListResponse",
    "AssessmentCreate",
    "AssessmentUpdate",
    "AssessmentImageResponse",
    "AssessmentResponse",
    "SurveyCreate",
    "SurveyUpdate",
    "SurveyRejectRequest",
    "SurveyResponse",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectStatusUpdate",
    "ProjectResponse",
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "RecommendationCreate",
    "RecommendationUpdate",
    "RecommendationResponse",
    "QuotationItemCreate",
    "QuotationItemResponse",
    "QuotationCreate",
    "QuotationRejectRequest",
    "QuotationResponse",
    "PaymentCreate",
    "PaymentResponse",
    "ProjectPaymentSummary",
    "InventoryStockAdjustRequest",
    "InventoryStockResponse",
    "InventoryMovementResponse",
    "EquipmentCreate",
    "EquipmentDispatch",
    "EquipmentResponse",
    "ChecklistItemUpdate",
    "ChecklistBatchUpdateRequest",
    "InstallationCreate",
    "InstallationStatusUpdate",
    "InstallationCompleteRequest",
    "ChecklistItemResponse",
    "InstallationResponse",
    "WarrantyCreate",
    "WarrantyResponse",
    "TelemetryCreate",
    "TelemetryResponse",
    "EquipmentTelemetryHistory",
    "ServiceTicketCreate",
    "ServiceTicketAssign",
    "ServiceTicketStatusUpdate",
    "ServiceTicketResolve",
    "ServiceTicketResponse",
    "DashboardAnalyticsResponse",
    "RevenueAnalyticsResponse",
    "ProjectAnalyticsResponse",
    "InventoryAnalyticsResponse",
    "TechnicianAnalyticsResponse",
    "PaymentAnalyticsResponse",
]
