"""Authentication and Identity Routes."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user, AuthenticatedUser, create_access_token
from app.schemas.auth import Token, LoginRequest, UserResponse
from app.services.auth_service import authenticate_user, issue_token_for_user
from app.models.user import UserModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


class DemoTokenRequest(BaseModel):
    role: str = "admin"
    email: Optional[str] = None


@router.post(
    "/login",
    response_model=Token,
    summary="Staff Login",
    description="Authenticate staff credentials and issue verified Bearer JWT access token.",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    """Authenticate staff member."""
    user = authenticate_user(db, email=payload.email, password=payload.password)
    token_dict = issue_token_for_user(user)
    return Token(**token_dict)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Current User Profile",
    description="Returns authenticated user identity and RBAC role from validated JWT token.",
)
def get_me(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Fetch current user identity."""
    user = db.query(UserModel).filter(UserModel.id == uuid.UUID(current_user.id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return UserResponse.model_validate(user)


@router.post(
    "/demo-token",
    response_model=Token,
    summary="Generate Demo Token for Role",
    description="Development and testing helper to generate a valid signed token for any operational role.",
)
def get_demo_token(payload: DemoTokenRequest, db: Session = Depends(get_db)) -> Token:
    """Quick token generator for any specified operational role."""
    role = payload.role.lower().strip()
    user = db.query(UserModel).filter(UserModel.role == role).first()
    if not user:
        # Create on the fly if needed
        user = UserModel(
            id=uuid.uuid4(),
            full_name=f"Demo {role.capitalize()}",
            email=payload.email or f"{role}@demo.solaros.in",
            role=role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token_dict = issue_token_for_user(user)
    return Token(**token_dict)
