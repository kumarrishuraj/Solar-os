"""Test Property Assessments and Rooftop Image Upload APIs."""

import io
import uuid
import pytest
from fastapi.testclient import TestClient


def test_create_assessment_unknown_dimensions_allowed(client: TestClient):
    """Test that unknown rooftop dimensions are allowed and never forced."""
    cust_id = "00000000-0000-0000-0002-000000000001"
    payload = {
        "customer_id": cust_id,
        "property_address": "Plot 45, Model Town",
        "city": "Ludhiana",
        "state": "Punjab",
        "postal_code": "141002",
        # Dimensions explicitly unknown / None
        "roof_length": None,
        "roof_width": None,
        "roof_area": None,
        "usable_roof_area": None,
        "monthly_bill": 5000.0,
        "connection_phase": "single_phase",
        "preferred_solar_type": "on_grid",
    }
    response = client.post("/api/v1/assessments", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["roof_length"] is None
    assert data["usable_roof_area"] is None
    assert data["assessment_status"] == "draft"


def test_usable_area_cannot_exceed_gross_area(client: TestClient):
    """Test constraint that usable roof area cannot exceed gross roof area."""
    cust_id = "00000000-0000-0000-0002-000000000001"
    payload = {
        "customer_id": cust_id,
        "property_address": "Plot 45, Model Town",
        "city": "Ludhiana",
        "state": "Punjab",
        "postal_code": "141002",
        "roof_area": 100.0,
        "usable_roof_area": 150.0,  # Invalid: 150 > 100
    }
    response = client.post("/api/v1/assessments", json=payload)
    assert response.status_code == 400


def test_upload_and_delete_assessment_image(client: TestClient):
    """Test image file upload, metadata recording, and safe deletion."""
    # 1. Create assessment
    cust_id = "00000000-0000-0000-0002-000000000001"
    ass_res = client.post(
        "/api/v1/assessments",
        json={
            "customer_id": cust_id,
            "property_address": "Plot 45, Model Town",
            "city": "Ludhiana",
            "state": "Punjab",
            "postal_code": "141002",
        },
    )
    assessment_id = ass_res.json()["id"]

    # 2. Upload sample image file
    fake_image_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb"
    file_tuple = ("rooftop_sample.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")

    upload_res = client.post(
        f"/api/v1/assessments/{assessment_id}/images",
        files={"file": file_tuple},
        data={"image_type": "rooftop_full_view"},
    )
    assert upload_res.status_code == 201
    img_data = upload_res.json()
    assert img_data["image_type"] == "rooftop_full_view"
    assert "file_path" in img_data
    image_id = img_data["id"]

    # 3. List images
    list_res = client.get(f"/api/v1/assessments/{assessment_id}/images")
    assert list_res.status_code == 200
    images = list_res.json()
    assert len(images) >= 1

    # 4. Delete image
    del_res = client.delete(f"/api/v1/assessments/{assessment_id}/images/{image_id}")
    assert del_res.status_code == 204
