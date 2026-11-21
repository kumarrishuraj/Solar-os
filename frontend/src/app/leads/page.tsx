"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  UserPlus,
  Sparkles,
  Search,
  Plus,
  Download,
  X,
  Calendar,
  Check,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { solarStore } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import { exportToCsv } from "@/lib/csv";
import { toast } from "sonner";
import type { Lead } from "@/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(solarStore.getLeads());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 8;

  // New lead form state
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    city: "",
    bill: "",
    source: "Website form",
  });

  useEffect(() => {
    return solarStore.subscribe(() => {
      setLeads(solarStore.getLeads());
    });
  }, []);

  const totalLeads = leads.length;
  const newLeadsCount = leads.filter((l) => l.status === "new").length;
  const qualifiedCount = leads.filter((l) => l.status === "qualified").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  const filtered = leads.filter((l) => {
    const matchesQuery =
      (l.full_name + " " + l.city + " " + l.phone + " " + l.id)
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || l.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedLeads = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleUpdateStatus = (status: Lead["status"]) => {
    if (!selectedLead) return;
    const updated = solarStore.updateLeadStatus(selectedLead.id, status);
    if (updated) {
      setSelectedLead(updated);
      toast.success(`Lead status updated to ${status.replace("_", " ")}`);
    }
  };

  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      toast.error("Please fill in required fields.");
      return;
    }

    const billNum = parseInt(newLead.bill, 10) || 4500;
    const kwEst = Math.max(1, Math.round(((billNum / 7.5 * 12) / (365 * 5.1 * 0.82)) * 2) / 2);

    solarStore.addLead({
      full_name: newLead.name.trim(),
      phone: newLead.phone,
      city: newLead.city || "Pune",
      monthly_bill_avg: billNum,
      estimated_system_kw: kwEst,
      source: newLead.source,
      status: "new",
    });

    setShowAddModal(false);
    setNewLead({ name: "", phone: "", city: "", bill: "", source: "Website form" });
    toast.success("New lead registered successfully!");
  };

  const handleExportCsv = () => {
    exportToCsv("solaros-leads", [
      { key: "id", label: "Lead ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "city", label: "City" },
      { key: "phone", label: "Phone" },
      { key: "monthly_electric_bill", label: "Monthly Bill (INR)" },
      { key: "estimated_system_capacity_kw", label: "Est Capacity (kW)" },
      { key: "status", label: "Status" },
      { key: "lead_source", label: "Source" },
    ], leads);
  };

  const projectStages = [
    "Enquiry",
    "AI requirement collection",
    "Rooftop analysis",
    "Recommendation",
    "Site verification",
    "Quotation",
    "Payment",
    "Installation",
  ];

  const getStageIndex = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return 1;
      case "contacted":
        return 2;
      case "qualified":
        return 3;
      case "survey_scheduled":
        return 4;
      case "quotation_sent":
        return 6;
      case "converted":
        return 8;
      default:
        return 1;
    }
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Leads & CRM
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Every customer enquiry from website AI assessment, referrals, direct walk-ins and channel partners.
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
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
            >
              <Plus className="size-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total Leads
            </span>
            <div className="text-2xl font-bold text-ink mt-1">{totalLeads}</div>
            <div className="text-xs text-muted-foreground mt-0.5">All prospective customers</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              New Leads
            </span>
            <div className="text-2xl font-bold text-[#A8CE45] mt-1">{newLeadsCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Need immediate response</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Qualified
            </span>
            <div className="text-2xl font-bold text-forest mt-1">{qualifiedCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Roof & bill verified</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Converted
            </span>
            <div className="text-2xl font-bold text-[#5B9B64] mt-1">{convertedCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Contract signed</div>
          </div>
        </div>

        {/* Leads Table & Filter Toolbar */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, phone, city, ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="h-9 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="survey_scheduled">Survey Scheduled</option>
                <option value="quotation_sent">Quotation Sent</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing {filtered.length} leads
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Lead ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Monthly Bill</th>
                  <th className="py-2.5 px-3">Est. Capacity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Assigned Rep</th>
                  <th className="py-2.5 px-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="group hover:bg-[#F7F8F5] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {lead.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink group-hover:text-forest transition-colors">
                      {lead.full_name}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{lead.city}</td>
                    <td className="py-2.5 px-3 font-mono text-ink">{lead.phone}</td>
                    <td className="py-2.5 px-3 font-medium text-ink">
                      ₹{(lead.monthly_bill_avg || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-forest font-mono">
                      {lead.estimated_system_kw || 0} kW
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={lead.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {lead.assigned_to_name || "Priya Sharma"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Toolbar */}
          <div className="flex items-center justify-between border-t border-border pt-4 mt-2 text-xs text-muted-foreground">
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-3 h-8 rounded-lg border border-border bg-white font-medium text-ink hover:bg-[#F7F8F5] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-3 h-8 rounded-lg border border-border bg-white font-medium text-ink hover:bg-[#F7F8F5] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Lead Details Drawer */}
        {selectedLead && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedLead(null)}
          >
            <div
              className="w-full max-w-lg bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <div className="text-xs font-mono font-semibold text-muted-foreground">
                    {selectedLead.id}
                  </div>
                  <h3 className="text-lg font-bold text-ink">
                    {selectedLead.full_name}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {selectedLead.city} · {selectedLead.source || "Website enquiry"}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F5]">
                <div className="text-xs font-medium text-ink">Status:</div>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as Lead["status"])}
                  className="h-8 px-2.5 rounded-lg border border-border bg-white text-xs font-semibold focus:outline-none"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="survey_scheduled">Survey Scheduled</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Key Lead Information */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-[#FAFBF8]">
                  <span className="text-muted-foreground block text-[10.5px] uppercase">Phone</span>
                  <span className="font-semibold text-ink font-mono">{selectedLead.phone}</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-[#FAFBF8]">
                  <span className="text-muted-foreground block text-[10.5px] uppercase">City</span>
                  <span className="font-semibold text-ink">{selectedLead.city}</span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-[#FAFBF8]">
                  <span className="text-muted-foreground block text-[10.5px] uppercase">Monthly Bill</span>
                  <span className="font-semibold text-ink">
                    ₹{(selectedLead.monthly_bill_avg || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border bg-[#FAFBF8]">
                  <span className="text-muted-foreground block text-[10.5px] uppercase">Est. System Size</span>
                  <span className="font-bold text-forest">
                    {selectedLead.estimated_system_kw || 0} kW
                  </span>
                </div>
              </div>

              {/* Project Lifecycle Progress Checklist */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Project Lifecycle Stage
                </div>
                <div className="space-y-1.5">
                  {projectStages.map((stage, idx) => {
                    const currentLvl = getStageIndex(selectedLead.status);
                    const isDone = idx < currentLvl;

                    return (
                      <div
                        key={stage}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                          isDone
                            ? "bg-[#E5F0E6] text-[#3F7A48] font-medium"
                            : "bg-[#F7F8F5] text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`flex size-4 items-center justify-center rounded-md ${
                            isDone ? "bg-forest text-white" : "border border-border bg-white"
                          }`}
                        >
                          {isDone && <Check className="size-3" />}
                        </div>
                        <span>{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border space-y-2">
                <button
                  onClick={() => handleUpdateStatus("survey_scheduled")}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-border bg-white text-xs font-semibold text-ink hover:bg-[#F7F8F5]"
                >
                  <Calendar className="size-4 text-forest" />
                  <span>Schedule Site Survey</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus("converted")}
                  className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90"
                >
                  <TrendingUp className="size-4" />
                  <span>Convert Lead to Confirmed Project</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus("lost")}
                  className="w-full h-8 rounded-xl bg-danger-soft text-danger text-xs font-medium hover:bg-danger-soft/80"
                >
                  Mark as Lost Lead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Lead Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl border border-border p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-ink">Add New Lead</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleAddLeadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-ink block mb-1">Customer Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-ink block mb-1">Mobile Phone *</label>
                    <input
                      required
                      type="tel"
                      placeholder="10-digit number"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-ink block mb-1">City *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Pune"
                      value={newLead.city}
                      onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-ink block mb-1">Monthly Bill (₹) *</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 5000"
                      value={newLead.bill}
                      onChange={(e) => setNewLead({ ...newLead, bill: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-ink block mb-1">Lead Source</label>
                    <select
                      value={newLead.source}
                      onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-xl border border-border bg-white focus:outline-none focus:border-forest"
                    >
                      <option>Website form</option>
                      <option>Website — AI assessment</option>
                      <option>Referral</option>
                      <option>Google Ads</option>
                      <option>Walk-in</option>
                      <option>Channel partner</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 h-9 rounded-xl border border-border text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-9 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 shadow-sm"
                  >
                    Save Lead
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
