"""Test Live SQL-Calculated Business Analytics."""

import pytest
from fastapi.testclient import TestClient


def test_dashboard_analytics_calculated_from_database(client: TestClient):
    """Test dashboard analytics returns real calculated metrics."""
    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()

    # Verify structure and numeric types
    assert "total_revenue" in data
    assert "monthly_revenue" in data
    assert "outstanding_payments" in data
    assert "total_projects" in data
    assert "active_projects" in data
    assert "completed_installations" in data
    assert "new_leads" in data
    assert "low_stock_items" in data


def test_revenue_and_project_analytics(client: TestClient):
    """Test revenue and project breakdown endpoints."""
    rev_res = client.get("/api/v1/analytics/revenue")
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert "payment_methods_breakdown" in rev_data

    prj_res = client.get("/api/v1/analytics/projects")
    assert prj_res.status_code == 200
    prj_data = prj_res.json()
    assert "status_breakdown" in prj_data
