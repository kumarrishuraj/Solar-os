"""Test Warehouse Stock Adjustments, Reservation Overselling Prevention, and Equipment Serial Uniqueness."""

import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient


def test_stock_reservation_and_overselling_prevention(client: TestClient):
    """Test stock adjustments, stock reservation, and rejection of reservations exceeding available stock."""
    prod_id = "00000000-0000-0000-0003-000000000001"  # Starts with 100 on hand

    # 1. Check initial stock: 100 on hand, 0 reserved -> 100 available
    stock_res = client.get("/api/v1/inventory/stock?warehouse_name=Ludhiana Central")
    assert stock_res.status_code == 200
    items = stock_res.json()
    item = [i for i in items if i["product_id"] == prod_id][0]
    assert float(item["quantity_on_hand"]) == 100.0
    assert float(item["available_stock"]) == 100.0

    # 2. Reserve 30 units
    res_payload = {
        "action": "reserve",
        "warehouse_name": "Ludhiana Central",
        "quantity": 30.0,
        "notes": "Reserved for Project Ludhiana-001",
    }
    reserve_res = client.patch(f"/api/v1/inventory/stock/{prod_id}", json=res_payload)
    assert reserve_res.status_code == 200
    updated = reserve_res.json()
    assert float(updated["quantity_reserved"]) == 30.0
    assert float(updated["available_stock"]) == 70.0

    # 3. ATTEMPT TO OVERSELL: Try reserving 80 units when only 70 are available
    oversell_payload = {
        "action": "reserve",
        "warehouse_name": "Ludhiana Central",
        "quantity": 80.0,
    }
    oversell_res = client.patch(f"/api/v1/inventory/stock/{prod_id}", json=oversell_payload)
    assert oversell_res.status_code == 400
    assert "Insufficient stock" in oversell_res.json()["detail"]


def test_equipment_serial_uniqueness_enforced(client: TestClient):
    """Test registering serialized equipment and rejecting duplicate serial numbers."""
    prod_id = "00000000-0000-0000-0003-000000000001"
    serial = "TP-2026-SN-998877"

    # Register first unit
    payload = {
        "product_id": prod_id,
        "serial_number": serial,
        "supplier": "Tata Power Factory Ludhiana",
        "purchase_date": "2026-05-10",
        "equipment_status": "in_stock",
    }
    first_res = client.post("/api/v1/equipment", json=payload)
    assert first_res.status_code == 201

    # Attempt to register duplicate serial number
    dup_res = client.post("/api/v1/equipment", json=payload)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"]

    # Lookup by serial
    lookup_res = client.get(f"/api/v1/equipment/serial/{serial}")
    assert lookup_res.status_code == 200
    assert lookup_res.json()["serial_number"] == serial
