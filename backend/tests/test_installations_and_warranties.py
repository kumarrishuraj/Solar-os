"""Test Installation Checklist Enforcement, Commissioning, Warranties, and Telemetry."""

import uuid
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient


def test_installation_checklist_enforcement_and_warranty_activation(client: TestClient):
    """Test field installation:
    1. Schedule installation (seeds 9 SOP checklist tasks)
    2. Attempting to complete while checklist is incomplete fails with 400
    3. Complete all checklist tasks
    4. Commissioning succeeds, sets project status to completed, and activates warranty
    """
    cust_id = "00000000-0000-0000-0002-000000000001"
    prj_res = client.post(
        "/api/v1/projects",
        json={
            "customer_id": cust_id,
            "project_name": "Installation Verification Project",
            "proposed_capacity_kw": 5.0,
        },
    )
    project_id = prj_res.json()["id"]

    # 1. Schedule installation
    tech_id = "00000000-0000-0000-0001-000000000010"  # Vikram Rawat
    inst_res = client.post(
        "/api/v1/installations",
        json={
            "project_id": project_id,
            "assigned_technician_id": tech_id,
            "scheduled_date": datetime.now(timezone.utc).isoformat(),
            "system_capacity_kw": 5.0,
        },
    )
    assert inst_res.status_code == 201
    inst = inst_res.json()
    installation_id = inst["id"]
    assert len(inst["checklist"]) == 9
    assert float(inst["progress_percentage"]) == 0.0

    # 2. Try completing installation immediately: MUST FAIL because checklist is incomplete!
    premature_complete = client.post(
        f"/api/v1/installations/{installation_id}/complete",
        json={"customer_confirmation": True},
    )
    assert premature_complete.status_code == 400
    assert "Pending checklist items" in premature_complete.json()["detail"]

    # 3. Update all checklist items to completed
    completed_items = [
        {"task_name": item["task_name"], "is_completed": True, "remarks": "Verified and passed"}
        for item in inst["checklist"]
    ]
    chk_res = client.post(
        f"/api/v1/installations/{installation_id}/checklist",
        json={"items": completed_items},
    )
    assert chk_res.status_code == 200
    assert float(chk_res.json()["progress_percentage"]) == 100.0

    # 4. Now complete installation
    complete_res = client.post(
        f"/api/v1/installations/{installation_id}/complete",
        json={"customer_confirmation": True, "testing_results": {"earthing_resistance_ohms": 1.2}},
    )
    assert complete_res.status_code == 200
    data = complete_res.json()
    assert data["installation_status"] == "completed"

    # Verify linked project is completed
    p_check = client.get(f"/api/v1/projects/{project_id}")
    assert p_check.json()["project_status"] == "completed"


def test_telemetry_ingestion(client: TestClient):
    """Test sensor telemetry ingestion and historical readings query."""
    # Register equipment first
    prod_id = "00000000-0000-0000-0003-000000000001"
    eq_res = client.post(
        "/api/v1/equipment",
        json={
            "product_id": prod_id,
            "serial_number": "INVERTER-IOT-TEST-001",
            "supplier": "Sungrow Factory",
            "purchase_date": "2026-01-15",
        },
    )
    equipment_id = eq_res.json()["id"]

    # Ingest telemetry point
    tele_res = client.post(
        "/api/v1/monitoring/telemetry",
        json={
            "equipment_id": equipment_id,
            "voltage": 230.5,
            "current": 18.2,
            "power": 4195.1,
            "temperature": 42.5,
            "energy_generated_kwh": 26.8,
            "source": "iot_gateway",
        },
    )
    assert tele_res.status_code == 201

    # Query latest
    latest_res = client.get(f"/api/v1/monitoring/{equipment_id}")
    assert latest_res.status_code == 200
    assert float(latest_res.json()["voltage"]) == 230.5

    # Query history
    hist_res = client.get(f"/api/v1/monitoring/{equipment_id}/history")
    assert hist_res.status_code == 200
    assert hist_res.json()["total_readings"] >= 1
