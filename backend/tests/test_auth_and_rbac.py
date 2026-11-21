"""Test Authentication, JWT issuance, and Role-Based Access Control."""

import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "online")


def test_staff_login_success(client: TestClient):
    """Test login with seed staff credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@solaros.in", "password": "any_password"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"
    assert data["token_type"] == "bearer"


def test_auth_me_with_valid_token(client: TestClient, auth_headers: dict):
    """Test retrieving user profile with valid Bearer token."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@solaros.in"
    assert data["role"] == "admin"


def test_auth_me_without_token(client: TestClient):
    """Test authorization error when no token provided."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_demo_token_generation_for_roles(client: TestClient):
    """Test demo token generator for various operational roles."""
    for role in ["surveyor", "engineer", "finance", "warehouse", "technician"]:
        response = client.post("/api/v1/auth/demo-token", json={"role": role})
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == role
        assert "access_token" in data
