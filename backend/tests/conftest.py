"""Pytest configuration and test database fixtures for SolarOS.

Provides an isolated in-memory SQLite test database and FastAPI TestClient.
"""

import sys
import os
import uuid
from decimal import Decimal
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import Base, get_db
import app.models
from app.models.user import UserModel
from app.models.customer import CustomerModel
from app.models.product import ProductModel
from app.models.inventory import InventoryModel
from app.services.auth_service import DEFAULT_STAFF
from app.core.security import create_access_token
from app.main import app

# StaticPool ensures the in-memory SQLite database persists across all connections
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)

# Create all 22 tables once
Base.metadata.create_all(bind=test_engine)


def seed_test_data(session: Session):
    """Seed baseline staff users, customers, and products."""
    for staff in DEFAULT_STAFF:
        existing = session.query(UserModel).filter(UserModel.id == staff["id"]).first()
        if not existing:
            u = UserModel(
                id=staff["id"],
                full_name=staff["full_name"],
                email=staff["email"],
                phone=staff["phone"],
                role=staff["role"],
                is_active=True,
            )
            session.add(u)

    cust_id = uuid.UUID("00000000-0000-0000-0002-000000000001")
    if not session.query(CustomerModel).filter(CustomerModel.id == cust_id).first():
        cust = CustomerModel(
            id=cust_id,
            full_name="Aarav Sharma",
            email="aarav.sharma@example.in",
            phone="+91-98765-43210",
            property_address="Plot 45, Model Town",
            city="Ludhiana",
            state="Punjab",
            postal_code="141002",
            property_type="residential",
        )
        session.add(cust)

    prod_id = uuid.UUID("00000000-0000-0000-0003-000000000001")
    if not session.query(ProductModel).filter(ProductModel.id == prod_id).first():
        prod = ProductModel(
            id=prod_id,
            sku="PANEL-550W-MONO",
            product_name="Tata Power 550W Mono PERC Half-Cut Module",
            brand="Tata Power Solar",
            model="TP-550-M10",
            category="solar_panel",
            rated_power_w=Decimal("550.00"),
            purchase_price=Decimal("12000.00"),
            selling_price=Decimal("16500.00"),
            warranty_months=300,
            is_active=True,
        )
        session.add(prod)
        session.flush()

        inv = InventoryModel(
            id=uuid.uuid4(),
            product_id=prod.id,
            warehouse_name="Ludhiana Central",
            quantity_on_hand=Decimal("100.00"),
            quantity_reserved=Decimal("0.00"),
            reorder_level=Decimal("10.00"),
        )
        session.add(inv)

    session.commit()


@pytest.fixture(scope="function")
def db_session() -> Session:
    """Provide clean database session for test execution."""
    session = TestingSessionLocal()
    seed_test_data(session)
    yield session
    session.close()


@pytest.fixture(scope="function")
def client(db_session: Session) -> TestClient:
    """FastAPI TestClient with overridden get_db dependency."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def auth_headers(db_session: Session) -> dict:
    """Generate admin authentication Bearer header."""
    admin = db_session.query(UserModel).filter(UserModel.role == "admin").first()
    token = create_access_token(
        subject=str(admin.id),
        user_id=str(admin.id),
        email=admin.email,
        full_name=admin.full_name,
        role=admin.role,
    )
    return {"Authorization": f"Bearer {token}"}
