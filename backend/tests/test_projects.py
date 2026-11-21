"""Test Solar Project Lifecycle Transitions."""

import pytest
from fastapi.testclient import TestClient


def test_project_status_transitions(client: TestClient):
    """Test valid sequential project status transitions."""
    cust_id = "00000000-0000-0000-0002-000000000001"

    # 1. Create project
    res = client.post(
        "/api/v1/projects",
        json={
            "customer_id": cust_id,
            "project_name": "Commercial Rooftop 20kW",
            "proposed_capacity_kw": 20.0,
        },
    )
    assert res.status_code == 201
    prj = res.json()
    project_id = prj["id"]
    assert prj["project_status"] == "enquiry"

    # Transition enquiry -> assessment
    t1 = client.patch(f"/api/v1/projects/{project_id}/status", json={"status": "assessment"})
    assert t1.status_code == 200
    assert t1.json()["project_status"] == "assessment"

    # Transition assessment -> survey_pending
    t2 = client.patch(f"/api/v1/projects/{project_id}/status", json={"status": "survey_pending"})
    assert t2.status_code == 200
    assert t2.json()["project_status"] == "survey_pending"


def test_illegal_status_transition_rejected(client: TestClient):
    """Test that illegal skips in milestone workflow are rejected."""
    cust_id = "00000000-0000-0000-0002-000000000001"

    res = client.post(
        "/api/v1/projects",
        json={
            "customer_id": cust_id,
            "project_name": "Solar Plant",
            "proposed_capacity_kw": 10.0,
        },
    )
    project_id = res.json()["id"]

    # Try jumping directly from 'enquiry' to 'completed' without survey, quote, installation
    illegal = client.patch(f"/api/v1/projects/{project_id}/status", json={"status": "completed"})
    assert illegal.status_code == 400
