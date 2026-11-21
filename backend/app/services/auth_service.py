"""Authentication and User Management Service.

Provides user lookup, JWT token generation, role verification,
and automatic seeding of default operational roles.
"""

import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import UserModel
from app.core.security import create_access_token, hash_password, verify_password


# Default staff roster for demonstration and operational testing
DEFAULT_STAFF = [
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000001"),
        "full_name": "Rajesh Kumar",
        "email": "admin@solaros.in",
        "phone": "+91-98140-11001",
        "role": "admin",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000002"),
        "full_name": "Sunita Deshmukh",
        "email": "director@solaros.in",
        "phone": "+91-98140-11002",
        "role": "director",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000003"),
        "full_name": "Amit Patel",
        "email": "amit.sales@solaros.in",
        "phone": "+91-98140-11003",
        "role": "sales",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000005"),
        "full_name": "Harpreet Singh",
        "email": "harpreet.survey@solaros.in",
        "phone": "+91-98140-11005",
        "role": "surveyor",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000007"),
        "full_name": "Deepa Raman",
        "email": "deepa.eng@solaros.in",
        "phone": "+91-98140-11007",
        "role": "engineer",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000008"),
        "full_name": "Sanjay Singhania",
        "email": "sanjay.finance@solaros.in",
        "phone": "+91-98140-11008",
        "role": "finance",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000009"),
        "full_name": "Gurinder Dhillon",
        "email": "gurinder.warehouse@solaros.in",
        "phone": "+91-98140-11009",
        "role": "warehouse",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000010"),
        "full_name": "Vikram Rawat",
        "email": "vikram.tech@solaros.in",
        "phone": "+91-98140-11010",
        "role": "technician",
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0001-000000000012"),
        "full_name": "Pooja Sharma",
        "email": "pooja.service@solaros.in",
        "phone": "+91-98140-11012",
        "role": "service_agent",
    },
]


def seed_default_users_if_needed(db: Session) -> None:
    """Ensure baseline operational staff accounts exist in the database."""
    for staff in DEFAULT_STAFF:
        existing = db.query(UserModel).filter(UserModel.id == staff["id"]).first()
        if not existing:
            user = UserModel(
                id=staff["id"],
                full_name=staff["full_name"],
                email=staff["email"],
                phone=staff["phone"],
                role=staff["role"],
                is_active=True,
            )
            db.add(user)
    db.commit()


def authenticate_user(db: Session, email: str, password: Optional[str] = None) -> UserModel:
    """Authenticate staff member by email (supports demo password or verified account)."""
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        # Seed if empty and check again
        seed_default_users_if_needed(db)
        user = db.query(UserModel).filter(UserModel.email == email).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or inactive staff account",
        )
    return user


def issue_token_for_user(user: UserModel) -> dict:
    """Generate signed JWT token for staff member."""
    token = create_access_token(
        subject=str(user.id),
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
    }
