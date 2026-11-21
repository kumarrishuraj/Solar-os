"""Quotation PDF Generator Service.

Generates professional, standards-compliant PDF documents for commercial quotations.
Constructs valid binary PDF 1.4 documents with header, customer details, line items,
financial breakdown (subtotal, GST, installation charges, net total), and terms.
"""

from decimal import Decimal
from typing import List, Dict, Any
from app.models.quotation import QuotationModel


def escape_pdf_text(text: str) -> str:
    """Escape parenthesis and backslashes and sanitize unicode for standard Type 1 fonts."""
    replacements = {
        "—": "-",
        "–": "-",
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
        "₹": "INR ",
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    text = text.encode("ascii", "replace").decode("ascii")
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def generate_quotation_pdf(quotation: QuotationModel, customer_info: Dict[str, Any]) -> bytes:
    """Generate a clean, high-resolution PDF document for a commercial solar quotation."""
    q_num = quotation.quotation_number
    cust_name = customer_info.get("full_name", "Valued Customer")
    cust_address = customer_info.get("property_address", "")
    cust_city = customer_info.get("city", "")
    cust_phone = customer_info.get("phone", "")
    cust_email = customer_info.get("email", "")

    lines: List[str] = [
        "BT",
        "/F1 20 Tf",
        "50 780 Td",
        "(SOLAROS - COMMERCIAL PROPOSAL) Tj",
        "/F2 10 Tf",
        "0 -20 Td",
        f"(Quotation Number: {escape_pdf_text(q_num)}) Tj",
        "0 -15 Td",
        f"(Date: {quotation.created_at.strftime('%d-%b-%Y')}) Tj",
        "0 -15 Td",
        f"(Valid Until: {quotation.valid_until.strftime('%d-%b-%Y')}) Tj",
        "0 -25 Td",
        "/F1 12 Tf",
        "(CLIENT DETAILS:) Tj",
        "/F2 10 Tf",
        "0 -15 Td",
        f"(Customer: {escape_pdf_text(cust_name)}) Tj",
        "0 -15 Td",
        f"(Site Address: {escape_pdf_text(cust_address)}, {escape_pdf_text(cust_city)}) Tj",
        "0 -15 Td",
        f"(Contact: {escape_pdf_text(cust_phone)} | {escape_pdf_text(cust_email or 'N/A')}) Tj",
        "0 -25 Td",
        "/F1 12 Tf",
        f"(SYSTEM SIZING & CAPACITY: {quotation.system_capacity_kw} kW DC) Tj",
        "0 -25 Td",
        "(BILL OF MATERIALS / LINE ITEMS:) Tj",
        "/F2 9 Tf",
        "0 -15 Td",
        "(-----------------------------------------------------------------------------------------------------------------) Tj",
        "0 -15 Td",
        "(Description                                                 Qty         Unit Price (INR)       Total Price (INR)) Tj",
        "0 -15 Td",
        "(-----------------------------------------------------------------------------------------------------------------) Tj",
    ]

    for item in quotation.items:
        desc = item.description[:45].ljust(45)
        qty = str(item.quantity).rjust(8)
        u_price = f"{float(item.unit_price):,.2f}".rjust(18)
        t_price = f"{float(item.total_price):,.2f}".rjust(20)
        row = f"({escape_pdf_text(desc)}  {qty}   {u_price}    {t_price}) Tj"
        lines.append("0 -15 Td")
        lines.append(row)

    lines.extend([
        "0 -15 Td",
        "(-----------------------------------------------------------------------------------------------------------------) Tj",
        "/F1 10 Tf",
        "0 -20 Td",
        f"(Subtotal:                                                                               INR {float(quotation.subtotal):,.2f}) Tj",
        "0 -15 Td",
        f"(Commercial Discount:                                                          (-) INR {float(quotation.discount):,.2f}) Tj",
        "0 -15 Td",
        f"(GST Tax:                                                                               (+) INR {float(quotation.gst_amount):,.2f}) Tj",
        "0 -15 Td",
        f"(EPC Installation & Commissioning Charges:                     (+) INR {float(quotation.installation_charges):,.2f}) Tj",
        "0 -20 Td",
        "/F1 12 Tf",
        f"(NET QUOTATION TOTAL:                                                    INR {float(quotation.total_amount):,.2f}) Tj",
        "/F2 9 Tf",
        "0 -35 Td",
        "(TERMS & CONDITIONS:) Tj",
        "0 -14 Td",
        "(1. Payment Terms: 40% advance with work order, 50% on material delivery, 10% on grid sync.) Tj",
        "0 -14 Td",
        "(2. Standard OEM Manufacturer Warranties apply: 25 years on PV Modules, 5 years on Inverters.) Tj",
        "0 -14 Td",
        "(3. Quotation is subject to DISCOM net-metering approval and structural site survey signoff.) Tj",
        "0 -25 Td",
        "/F1 10 Tf",
        "(Authorized Signatory, SolarOS Engineering Platform) Tj",
        "ET",
    ])

    stream_content = "\n".join(lines).encode("latin-1", "replace")
    stream_len = len(stream_content)

    # Build PDF Objects
    objects = []
    # 1: Catalog
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    # 2: Pages
    objects.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    # 3: Page
    objects.append(
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        b"/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n"
    )
    # 4: Font Bold
    objects.append(b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")
    # 5: Font Regular
    objects.append(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    # 6: Contents Stream
    objects.append(
        f"6 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin-1")
        + stream_content
        + b"\nendstream\nendobj\n"
    )

    pdf = bytearray(b"%PDF-1.4\n")
    xref_offsets = [0]
    for obj in objects:
        xref_offsets.append(len(pdf))
        pdf.extend(obj)

    xref_pos = len(pdf)
    num_objects = len(objects) + 1
    pdf.extend(f"xref\n0 {num_objects}\n0000000000 65535 f \n".encode("latin-1"))
    for offset in xref_offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))

    pdf.extend(
        f"trailer\n<< /Size {num_objects} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode("latin-1")
    )

    return bytes(pdf)
