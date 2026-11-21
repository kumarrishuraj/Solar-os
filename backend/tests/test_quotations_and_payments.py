"""Test Commercial Quotations, Financial Precision, and Milestone Payments."""

from datetime import datetime, timezone, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient


def setup_ready_project(client: TestClient) -> str:
    """Create project and advance to survey_approved status."""
    cust_id = "00000000-0000-0000-0002-000000000001"
    res = client.post(
        "/api/v1/projects",
        json={
            "customer_id": cust_id,
            "project_name": "Quotation Ready Project",
            "proposed_capacity_kw": 5.5,
        },
    )
    p_id = res.json()["id"]
    client.patch(f"/api/v1/projects/{p_id}/status", json={"status": "survey_pending"})
    client.patch(f"/api/v1/projects/{p_id}/status", json={"status": "survey_approved"})
    return p_id


def test_quotation_calculations_and_pdf(client: TestClient):
    """Test Decimal financial calculations for quotations:
    subtotal, discount, 18% GST, installation charges, net total, and PDF generation.
    """
    project_id = setup_ready_project(client)
    cust_id = "00000000-0000-0000-0002-000000000001"
    prod_id = "00000000-0000-0000-0003-000000000001"  # Tata Power 550W Module

    # 10 panels @ 16,500 = 165,000 subtotal
    # Discount = 5,000 -> Taxable = 160,000
    # 18% GST on 160,000 = 28,800
    # Installation charges = 15,000
    # Total = 160,000 + 28,800 + 15,000 = 203,800
    payload = {
        "project_id": project_id,
        "customer_id": cust_id,
        "system_capacity_kw": 5.5,
        "items": [
            {
                "product_id": prod_id,
                "description": "Tata Power 550W Mono PERC Half-Cut Modules",
                "quantity": 10.0,
                "unit_price": 16500.0,
            }
        ],
        "discount": 5000.0,
        "gst_percent": 18.0,
        "installation_charges": 15000.0,
        "valid_until": (datetime.now(timezone.utc) + timedelta(days=30)).date().isoformat(),
    }

    create_res = client.post("/api/v1/quotations", json=payload)
    assert create_res.status_code == 201
    quote = create_res.json()

    assert float(quote["subtotal"]) == 165000.0
    assert float(quote["discount"]) == 5000.0
    assert float(quote["gst_amount"]) == 28800.0
    assert float(quote["installation_charges"]) == 15000.0
    assert float(quote["total_amount"]) == 203800.0
    assert quote["quotation_status"] == "sent"
    quote_id = quote["id"]

    # Test PDF generation
    pdf_res = client.post(f"/api/v1/quotations/{quote_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF-1.4")

    # Approve quotation
    appr_res = client.patch(f"/api/v1/quotations/{quote_id}/approve")
    assert appr_res.status_code == 200
    assert appr_res.json()["quotation_status"] == "approved"

    # Record advance payment (40% of 203,800 = 81,520)
    pay_res = client.post(
        "/api/v1/payments",
        json={
            "project_id": project_id,
            "quotation_id": quote_id,
            "amount": 81520.0,
            "payment_method": "neft",
            "transaction_reference": "UTR-PUNB20261014998",
        },
    )
    assert pay_res.status_code == 201
    assert pay_res.json()["payment_status"] == "completed"

    # Check project payment summary balance
    bal_res = client.get(f"/api/v1/projects/{project_id}/payments")
    assert bal_res.status_code == 200
    bal_data = bal_res.json()
    assert float(bal_data["total_quoted"]) == 203800.0
    assert float(bal_data["total_paid"]) == 81520.0
    assert float(bal_data["outstanding_balance"]) == 122280.0
