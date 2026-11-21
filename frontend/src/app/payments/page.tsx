"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Wallet,
  Search,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  CreditCard,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { exportToCsv } from "@/lib/csv";
import { toast } from "sonner";

interface PaymentRow {
  id: string;
  customer: string;
  quotation: string;
  amount: number;
  method: string;
  date: string;
  status: "completed" | "pending" | "overdue";
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([
    {
      id: "TXN-8841",
      customer: "Rahul Sharma",
      quotation: "Q-2026-041",
      amount: 125000,
      method: "Bank transfer (NEFT)",
      date: "16 Nov 2026",
      status: "completed",
    },
    {
      id: "TXN-8857",
      customer: "Rahul Sharma",
      quotation: "Q-2026-041",
      amount: 120110,
      method: "UPI",
      date: "28 Nov 2026",
      status: "pending",
    },
    {
      id: "TXN-7723",
      customer: "Meena Iyer",
      quotation: "Q-2026-038",
      amount: 185000,
      method: "Bank transfer",
      date: "15 Nov 2026",
      status: "completed",
    },
    {
      id: "TXN-7790",
      customer: "Meena Iyer",
      quotation: "Q-2026-038",
      amount: 53900,
      method: "Cheque",
      date: "30 Nov 2026",
      status: "pending",
    },
    {
      id: "TXN-7512",
      customer: "Manoj Tiwari",
      quotation: "Q-2026-031",
      amount: 146000,
      method: "Bank transfer",
      date: "02 Nov 2026",
      status: "overdue",
    },
    {
      id: "TXN-7408",
      customer: "Ravi Shankar",
      quotation: "Q-2026-029",
      amount: 296000,
      method: "UPI",
      date: "24 Oct 2026",
      status: "completed",
    },
  ]);

  const [search, setSearch] = useState("");
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [newPay, setNewPay] = useState({
    customer: "",
    quotation: "Q-2026-042",
    amount: "",
    method: "Bank transfer",
  });

  const totalCollected = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = payments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = payments.filter((p) =>
    (p.customer + " " + p.id + " " + p.quotation)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPay.customer || !newPay.amount) return;

    const row: PaymentRow = {
      id: `TXN-${Math.floor(8900 + Math.random() * 1000)}`,
      customer: newPay.customer,
      quotation: newPay.quotation,
      amount: Number(newPay.amount),
      method: newPay.method,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: "completed",
    };

    setPayments([row, ...payments]);
    setShowRecordModal(false);
    toast.success(`Payment of ₹${Number(newPay.amount).toLocaleString("en-IN")} recorded!`);
  };

  const handleExportCsv = () => {
    exportToCsv("solaros-payments", [
      { key: "id", label: "Transaction ID" },
      { key: "customer", label: "Customer" },
      { key: "quotation", label: "Quotation Ref" },
      { key: "amount", label: "Amount (INR)" },
      { key: "method", label: "Payment Method" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status" },
    ], payments);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Payments & Invoicing
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Project advances, material dispatch milestones and net balance collections.
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
              onClick={() => setShowRecordModal(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
            >
              <Plus className="size-4" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total Collected
            </span>
            <div className="text-2xl font-bold text-forest mt-1">
              ₹{(totalCollected / 100000).toFixed(2)} L
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Cleared in bank</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Pending Milestones
            </span>
            <div className="text-2xl font-bold text-ink mt-1">
              ₹{(pendingAmount / 100000).toFixed(2)} L
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Due on commissioning</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Advance Received
            </span>
            <div className="text-2xl font-bold text-[#A8CE45] mt-1">₹3.10 L</div>
            <div className="text-xs text-muted-foreground mt-0.5">Project kick-off advances</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Overdue Amount
            </span>
            <div className="text-2xl font-bold text-danger mt-1">
              ₹{(overdueAmount / 100000).toFixed(2)} L
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Follow-up required</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="relative w-full max-w-sm">
              <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search transaction, customer, quote..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} transactions listed
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Quotation Ref</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {pay.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink">
                      {pay.customer}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      {pay.quotation}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-ink font-mono">
                      ₹{pay.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {pay.method}
                    </td>
                    <td className="py-2.5 px-3 text-ink">{pay.date}</td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={pay.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Payment Modal */}
        {showRecordModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
            onClick={() => setShowRecordModal(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl border border-border p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-ink">Record Customer Payment</h3>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-ink block mb-1">Customer Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Deepika Reddy"
                    value={newPay.customer}
                    onChange={(e) => setNewPay({ ...newPay, customer: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="font-medium text-ink block mb-1">Quotation Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Q-2026-042"
                    value={newPay.quotation}
                    onChange={(e) => setNewPay({ ...newPay, quotation: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="font-medium text-ink block mb-1">Amount Received (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 150000"
                    value={newPay.amount}
                    onChange={(e) => setNewPay({ ...newPay, amount: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="font-medium text-ink block mb-1">Payment Method</label>
                  <select
                    value={newPay.method}
                    onChange={(e) => setNewPay({ ...newPay, method: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-forest"
                  >
                    <option>Bank transfer (NEFT/RTGS)</option>
                    <option>UPI</option>
                    <option>Cheque</option>
                    <option>Credit / Debit Card</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRecordModal(false)}
                    className="px-4 h-9 rounded-xl border border-border text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-9 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 shadow-sm"
                  >
                    Save Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
