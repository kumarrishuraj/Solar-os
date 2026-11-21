"""Unit tests for root and health-check endpoints."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify that root endpoint returns application metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "SolarOS"
    assert data["status"] == "online"
    assert "version" in data
    assert "docs_url" in data


def test_health_endpoint():
    """Verify that health check endpoint returns 200 OK and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "database" in data
    assert "environment" in data
    assert "version" in data


def test_api_v1_health_endpoint():
    """Verify health endpoint mounted under /api/v1/health."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
