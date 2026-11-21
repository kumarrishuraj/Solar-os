"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  FileText,
  Printer,
  CheckCircle2,
  Search,
  Plus,
  Download,
  X,
  Check,
  Send,
  Building,
} from "lucide-react";
import { solarStore } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import { SolarLogo } from "@/components/layout/solar-logo";
import { exportToCsv } from "@/lib/csv";
import { toast } from "sonner";
import type { Quotation } from "@/types";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(
    solarStore.getQuotations()
  );
  const [search, setSearch] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New quote form state
  const [newQuote, setNewQuote] = useState({
    customer: "",
    capacity: 5,
    city: "Pune",
  });

  useEffect(() => {
    return solarStore.subscribe(() => {
      setQuotations(solarStore.getQuotations());
    });
  }, []);

  const totalQuotes = quotations.length;
  const draftCount = quotations.filter((q) => q.status === "draft").length;
  const sentCount = quotations.filter((q) => q.status === "sent").length;
  const approvedCount = quotations.filter((q) => q.status === "approved").length;

  const filtered = quotations.filter((q) =>
    (q.quotation_number + " " + q.lead_name)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleApprove = (id: string) => {
    const updated = solarStore.approveQuotation(id);
    if (updated) {
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(updated);
      }
      toast.success(`Quotation ${updated.quotation_number} marked as approved! Stock reserved.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportToCsv("solaros-quotations", [
      { key: "quotation_number", label: "Quotation No" },
      { key: "lead_name", label: "Customer" },
      { key: "system_capacity_kw", label: "Capacity (kW)" },
      { key: "total_cost", label: "Amount (INR)" },
      { key: "status", label: "Status" },
      { key: "valid_until", label: "Valid Until" },
    ], quotations);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Quotations & Proposals
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              GST-compliant turnkey proposals with itemized bill of materials and PM Surya Ghar subsidy deductions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
            >
              <Plus className="size-4" />
              <span>Create Quotation</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total Quotations
            </span>
            <div className="text-2xl font-bold text-ink mt-1">{totalQuotes}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Generated to date</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Draft
            </span>
            <div className="text-2xl font-bold text-[#829B83] mt-1">{draftCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Under design review</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Sent to Client
            </span>
            <div className="text-2xl font-bold text-[#D9A441] mt-1">{sentCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Awaiting customer decision</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Approved
            </span>
            <div className="text-2xl font-bold text-[#5B9B64] mt-1">{approvedCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Ready for advance invoice</div>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="relative w-full max-w-sm">
              <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search quote number, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} quotations listed
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Quotation No</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">System Size</th>
                  <th className="py-2.5 px-3">Est. Annual Gen</th>
                  <th className="py-2.5 px-3">Total Cost</th>
                  <th className="py-2.5 px-3">Valid Until</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((quote) => (
                  <tr
                    key={quote.id}
                    onClick={() => {
                      setSelectedQuote(quote);
                      setShowPreviewModal(true);
                    }}
                    className="group hover:bg-[#F7F8F5] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {quote.quotation_number}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink group-hover:text-forest transition-colors">
                      {quote.lead_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      {quote.system_capacity_kw} kWp
                    </td>
                    <td className="py-2.5 px-3 text-forest font-mono">
                      {quote.estimated_annual_kwh.toLocaleString("en-IN")} kWh
                    </td>
                    <td className="py-2.5 px-3 font-bold text-ink">
                      ₹{quote.total_cost.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {quote.valid_until
                        ? new Date(quote.valid_until).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={quote.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Formal Quotation Preview Modal */}
        {showPreviewModal && selectedQuote && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs overflow-y-auto"
            onClick={() => setShowPreviewModal(false)}
          >
            <div
              className="relative w-full max-w-3xl bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-2xl my-8 space-y-6 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-border print:hidden">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {selectedQuote.quotation_number}
                  </span>
                  <StatusBadge status={selectedQuote.status} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                  >
                    <Printer className="size-3.5" />
                    <span>Print / PDF</span>
                  </button>
                  {selectedQuote.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(selectedQuote.id)}
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-forest text-white text-xs font-semibold hover:bg-forest/90"
                    >
                      <Check className="size-3.5" />
                      <span>Mark Approved</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-[#F7F8F5]"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Formal Document Body (Printable) */}
              <div className="space-y-6 text-xs text-ink" id="printableQuotation">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <SolarLogo size={42} />
                    <div>
                      <div className="text-base font-bold text-ink">
                        SolarOS Demo Installer Pvt. Ltd.
                      </div>
                      <div className="text-muted-foreground text-[11px] leading-tight mt-0.5">
                        Baner Road, Pune, Maharashtra 411045
                        <br />
                        GSTIN: <span className="font-mono">27AABCS1234D1Z5</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Formal Quotation
                    </div>
                    <div className="text-sm font-bold font-mono text-ink mt-0.5">
                      {selectedQuote.quotation_number}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Valid Till:{" "}
                      {selectedQuote.valid_until
                        ? new Date(selectedQuote.valid_until).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                </div>

                {/* Bill To & System Spec */}
                <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#FAFBF8] border border-border">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Bill To (Client)
                    </span>
                    <div className="font-bold text-sm text-ink">
                      {selectedQuote.lead_name}
                    </div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      Property Owner · India
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                      System Configuration
                    </span>
                    <div className="font-bold text-sm text-forest">
                      {selectedQuote.system_capacity_kw} kWp Rooftop Solar
                    </div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                      Est. {selectedQuote.estimated_annual_kwh.toLocaleString("en-IN")} kWh / year
                    </div>
                  </div>
                </div>

                {/* Itemized Bill of Materials (BOM) Table */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F7F8F5] border-b border-border text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3">HSN</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Rate</th>
                        <th className="py-2 px-3 text-right">GST</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedQuote.line_items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-ink">{item.product_name}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {item.brand}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">8541 43 00</td>
                          <td className="py-2 px-3 text-right font-mono">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono">
                            ₹{item.unit_price.toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">{item.gst_percent}%</td>
                          <td className="py-2 px-3 text-right font-bold font-mono">
                            ₹{item.total.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-2 px-3 font-semibold text-ink">
                          Turnkey Installation & Grid Commissioning
                        </td>
                        <td className="py-2 px-3 font-mono text-muted-foreground">9954</td>
                        <td className="py-2 px-3 text-right font-mono">1</td>
                        <td className="py-2 px-3 text-right font-mono">
                          ₹{selectedQuote.installation_charges.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">18%</td>
                        <td className="py-2 px-3 text-right font-bold font-mono">
                          ₹{selectedQuote.installation_charges.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals & Subsidy Split */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal (Taxable Value):</span>
                      <span className="font-mono text-ink">
                        ₹{(selectedQuote.subtotal + selectedQuote.installation_charges).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST + SGST (Applicable):</span>
                      <span className="font-mono text-ink">
                        ₹{selectedQuote.gst_amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-ink">
                      <span>Grand Total:</span>
                      <span className="font-mono text-forest">
                        ₹{selectedQuote.total_cost.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#E5F0E6] text-[11px] text-[#3F7A48] flex justify-between">
                      <span>PM Surya Ghar Subsidy (Est.):</span>
                      <span className="font-bold">
                        ₹{selectedQuote.system_capacity_kw >= 3 ? "78,000" : "60,000"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="pt-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
                  <b className="font-semibold text-ink">Commercial Terms:</b> 40% advance on design approval, 50% on warehouse equipment dispatch, 10% on DISCOM net-meter commissioning. 25-year module linear output warranty; 5-year comprehensive system workmanship warranty.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
