"""Test Site Survey Scheduling, Approval, and Rejection."""

import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient


def create_sample_project(client: TestClient) -> str:
    """Helper to create sample project."""
    cust_id = "00000000-0000-0000-0002-000000000001"
    res = client.post(
        "/api/v1/projects",
        json={
            "customer_id": cust_id,
            "project_name": "Ludhiana 5kW Rooftop",
            "proposed_capacity_kw": 5.0,
        },
    )
    return res.json()["id"]


def test_survey_lifecycle_and_approval(client: TestClient):
    """Test site survey scheduling, update, and engineer approval."""
    project_id = create_sample_project(client)
    surveyor_id = "00000000-0000-0000-0001-000000000005"  # Harpreet Singh

    # 1. Schedule survey
    scheduled_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    create_res = client.post(
        "/api/v1/surveys",
        json={
            "project_id": project_id,
            "surveyor_id": surveyor_id,
            "scheduled_date": scheduled_time,
            "remarks": "Check parapet shadow on south edge",
        },
    )
    assert create_res.status_code == 201
    survey_id = create_res.json()["id"]

    # 2. Surveyor updates measurements
    put_res = client.put(
        f"/api/v1/surveys/{survey_id}",
        json={
            "verified_roof_area": 85.5,
            "verified_roof_orientation": "south",
            "verified_roof_tilt": 20.0,
            "cable_distance": 22.0,
            "structural_observations": "RCC slab 6 inches, sound condition",
            "electrical_observations": "3-phase meter installed, earthing pit required",
        },
    )
    assert put_res.status_code == 200

    # 3. Submit survey
    sub_res = client.patch(f"/api/v1/surveys/{survey_id}/submit")
    assert sub_res.status_code == 200

    # 4. Engineer approves survey
    appr_res = client.patch(f"/api/v1/surveys/{survey_id}/approve")
    assert appr_res.status_code == 200
    assert appr_res.json()["approval_status"] == "approved"

    # Verify project status automatically advanced to 'survey_approved'
    prj_res = client.get(f"/api/v1/projects/{project_id}")
    assert prj_res.json()["project_status"] == "survey_approved"


def test_survey_rejection_requires_reason(client: TestClient):
    """Test that rejecting a survey without a reason is strictly rejected."""
    project_id = create_sample_project(client)
    surveyor_id = "00000000-0000-0000-0001-000000000005"

    create_res = client.post(
        "/api/v1/surveys",
        json={
            "project_id": project_id,
            "surveyor_id": surveyor_id,
            "scheduled_date": datetime.now(timezone.utc).isoformat(),
        },
    )
    survey_id = create_res.json()["id"]

    # Reject without valid reason
    rej_res = client.patch(
        f"/api/v1/surveys/{survey_id}/reject",
        json={"rejection_reason": "bad"},  # too short
    )
    assert rej_res.status_code == 422 or rej_res.status_code == 400

    # Reject with valid detailed reason
    valid_rej = client.patch(
        f"/api/v1/surveys/{survey_id}/reject",
        json={"rejection_reason": "Water tank structure blocks south exposure; tilt measurement missing"},
    )
    assert valid_rej.status_code == 200
    assert valid_rej.json()["approval_status"] == "rejected"
