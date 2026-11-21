"""API Routes Package for SolarOS."""

from app.api.routes import health
from app.api.routes import auth
from app.api.routes import leads
from app.api.routes import assessments
from app.api.routes import recommendations
from app.api.routes import surveys
from app.api.routes import projects
from app.api.routes import quotations
from app.api.routes import payments
from app.api.routes import inventory
from app.api.routes import equipment
from app.api.routes import installations
from app.api.routes import warranties
from app.api.routes import monitoring
from app.api.routes import service_tickets
from app.api.routes import analytics

__all__ = [
    "health",
    "auth",
    "leads",
    "assessments",
    "recommendations",
    "surveys",
    "projects",
    "quotations",
    "payments",
    "inventory",
    "equipment",
    "installations",
    "warranties",
    "monitoring",
    "service_tickets",
    "analytics",
]
