"""Authentication and Security Module.

Implements JWT verification, token creation, password hashing,
and Role-Based Access Control (RBAC) dependencies.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
import hashlib
import hmac
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

# Allowed Roles according to SolarOS Database & Team specification
VALID_ROLES = {
    "admin",
    "director",
    "sales",
    "surveyor",
    "engineer",
    "finance",
    "warehouse",
    "technician",
    "service_agent",
}

security_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash password using PBKDF2 with SHA256."""
    salt = settings.SECRET_KEY.encode()[:16]
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000).hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against PBKDF2 hash."""
    return hmac.compare_digest(hash_password(plain_password), hashed_password)


def create_access_token(
    subject: str,
    role: str,
    email: str,
    full_name: str,
    user_id: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate a signed JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": subject,
        "user_id": user_id,
        "email": email,
        "full_name": full_name,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and verify JWT signature and expiration.
    
    Supports verifying tokens issued by SolarOS or Supabase Auth.
    """
    try:
        # First attempt: decode with application SECRET_KEY
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.InvalidSignatureError:
        # If Supabase Auth is enabled and JWT secret is configured, attempt Supabase verification
        if settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY:
            for key in [settings.SUPABASE_SERVICE_ROLE_KEY, settings.SUPABASE_ANON_KEY]:
                if key:
                    try:
                        return jwt.decode(token, key, algorithms=["HS256"])
                    except Exception:
                        pass
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token signature",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthenticatedUser:
    """Lightweight user identity container passed to route handlers."""

    def __init__(self, user_id: str, email: str, full_name: str, role: str):
        self.id = user_id
        self.email = email
        self.full_name = full_name
        self.role = role


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Optional[AuthenticatedUser]:
    """Optional authentication: returns AuthenticatedUser if token present and valid, else None."""
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("user_id") or payload.get("sub")
        email = payload.get("email", "")
        role = payload.get("role", "sales")
        full_name = payload.get("full_name", email)
        return AuthenticatedUser(user_id=str(user_id), email=email, full_name=full_name, role=role)
    except HTTPException:
        return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    """Enforce valid Bearer JWT authentication."""
    if not credentials:
        # In development mode, allow header or provide helpful error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid. Use 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("user_id") or payload.get("sub")
    email = payload.get("email", "")
    role = payload.get("role", "")
    full_name = payload.get("full_name", email)

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token claims: missing user_id or role",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthenticatedUser(user_id=str(user_id), email=email, full_name=full_name, role=role)


def require_roles(allowed_roles: List[str]):
    """Factory dependency enforcing Role-Based Access Control (RBAC).

    Admin and Director always have universal operational access.
    Never trusts user roles from request bodies.
    """

    def role_checker(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        user_role = current_user.role.lower()
        effective_allowed = set(allowed_roles) | {"admin", "director"}

        if user_role not in effective_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied for role '{current_user.role}'. Required one of: {sorted(list(effective_allowed))}",
            )
        return current_user

    return role_checker
