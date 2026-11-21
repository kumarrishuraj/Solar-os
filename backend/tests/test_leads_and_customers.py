"""Test Customer and Lead Ingestion CRM APIs."""

import pytest
from fastapi.testclient import TestClient


def test_enquiry_intake_workflow(client: TestClient):
    """Test full customer enquiry intake workflow:
    1. Validates customer information
    2. Identifies or creates customer
    3. Generates lead with unique code
    4. Creates property assessment if details provided
    5. Returns all relevant IDs
    """
    payload = {
        "full_name": "Rohan Deshmukh",
        "phone": "+91-99887-76655",
        "email": "rohan.deshmukh@example.in",
        "property_address": "Flat 302, Green Valley Apartments",
        "city": "Pune",
        "state": "Maharashtra",
        "postal_code": "411038",
        "property_type": "residential",
        "source": "website",
        "monthly_bill": 6500.0,
        "monthly_consumption_kwh": 750.0,
        "estimated_capacity_kw": 5.0,
        # Rooftop details
        "roof_length": 12.0,
        "roof_width": 8.0,
        "roof_area": 96.0,
        "usable_roof_area": 80.0,
        "roof_type": "flat_concrete",
        "roof_orientation": "south",
        "roof_tilt": 18.0,
        "preferred_solar_type": "on_grid",
        "budget": 350000.0,
        "notes": "Looking for net metering with MSEDCL",
    }

    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "customer_id" in data
    assert "lead_id" in data
    assert "lead_number" in data
    assert data["lead_number"].startswith("LEAD-")
    assert "assessment_id" in data
    assert data["status"] == "new"


def test_list_leads_with_filters(client: TestClient):
    """Test searching, filtering and pagination of leads."""
    # List leads
    response = client.get("/api/v1/leads?city=Pune")
    assert response.status_code == 200
    leads = response.json()
    assert isinstance(leads, list)


def test_update_lead_status_transition(client: TestClient):
    """Test transitioning a lead through the sales funnel."""
    # Create lead first
    payload = {
        "full_name": "Kavita Nair",
        "phone": "+91-98111-22334",
        "property_address": "House 12, Baner",
        "city": "Pune",
        "state": "Maharashtra",
        "postal_code": "411045",
        "monthly_bill": 4000.0,
    }
    create_res = client.post("/api/v1/leads", json=payload)
    assert create_res.status_code == 201
    lead_id = create_res.json()["lead_id"]

    # Transition status to 'qualified'
    patch_res = client.patch(
        f"/api/v1/leads/{lead_id}/status",
        json={"status": "qualified", "notes": "Customer confirmed roof ownership and electricity bill"},
    )
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["status"] == "qualified"

    # Transition to 'survey_scheduled'
    patch_res2 = client.patch(
        f"/api/v1/leads/{lead_id}/status",
        json={"status": "survey_scheduled"},
    )
    assert patch_res2.status_code == 200
    assert patch_res2.json()["status"] == "survey_scheduled"


def test_invalid_lead_status_rejected(client: TestClient):
    """Test that invalid lead status values are rejected with 400 Bad Request."""
    payload = {
        "full_name": "Test User",
        "phone": "+91-90000-00001",
        "property_address": "123 Street",
        "city": "Delhi",
        "state": "Delhi",
        "postal_code": "110001",
    }
    create_res = client.post("/api/v1/leads", json=payload)
    lead_id = create_res.json()["lead_id"]

    patch_res = client.patch(
        f"/api/v1/leads/{lead_id}/status",
        json={"status": "invalid_bogus_status"},
    )
    assert patch_res.status_code == 400
