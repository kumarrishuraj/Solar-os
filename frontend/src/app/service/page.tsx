"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  ShieldAlert,
  Search,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  X,
  Check,
} from "lucide-react";
import { solarStore } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import { exportToCsv } from "@/lib/csv";
import { toast } from "sonner";
import type { ServiceTicket } from "@/types";

export default function ServicePage() {
  const [tickets, setTickets] = useState<ServiceTicket[]>(
    solarStore.getTickets()
  );
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [updateStatus, setUpdateStatus] = useState<ServiceTicket["status"]>("open");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    return solarStore.subscribe(() => {
      setTickets(solarStore.getTickets());
    });
  }, []);

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;

  const filtered = tickets.filter((t) =>
    (t.customer_name + " " + t.ticket_number + " " + t.equipment_serial_number + " " + t.issue_description)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSaveTicket = () => {
    if (!selectedTicket) return;
    const updated = solarStore.updateTicketStatus(
      selectedTicket.id,
      updateStatus,
      resolutionNotes
    );
    if (updated) {
      setSelectedTicket(null);
      toast.success(`Ticket ${updated.ticket_number} updated to ${updated.status}!`);
    }
  };

  const handleExportCsv = () => {
    exportToCsv("solaros-service-tickets", [
      { key: "ticket_number", label: "Ticket Number" },
      { key: "customer_name", label: "Customer" },
      { key: "equipment_serial_number", label: "Serial Number" },
      { key: "issue_description", label: "Issue" },
      { key: "priority", label: "Priority" },
      { key: "assigned_technician_name", label: "Technician" },
      { key: "warranty_covered", label: "Warranty Covered" },
      { key: "status", label: "Status" },
    ], tickets);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Service & Warranty
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Customer complaints, inverter diagnostic fault codes, preventive maintenance and warranty claims.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Open Tickets
            </span>
            <div className="text-2xl font-bold text-[#D9A441] mt-1">{openTickets}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Awaiting resolution</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              In Progress
            </span>
            <div className="text-2xl font-bold text-forest mt-1">{inProgressTickets}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Technician dispatched</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Resolved Tickets
            </span>
            <div className="text-2xl font-bold text-[#5B9B64] mt-1">{resolvedTickets}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Closed satisfactorily</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Warranty Claims
            </span>
            <div className="text-2xl font-bold text-ink mt-1">3</div>
            <div className="text-xs text-muted-foreground mt-0.5">Manufacturer RMA active</div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="relative w-full max-w-sm">
              <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket, customer, serial, issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} service tickets recorded
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Equipment Serial</th>
                  <th className="py-2.5 px-3">Reported Issue</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Warranty</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setUpdateStatus(ticket.status);
                      setResolutionNotes(ticket.resolution || "");
                    }}
                    className="group hover:bg-[#F7F8F5] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {ticket.ticket_number}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink group-hover:text-forest transition-colors">
                      {ticket.customer_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      {ticket.equipment_serial_number}
                    </td>
                    <td className="py-2.5 px-3 text-ink max-w-xs truncate" title={ticket.issue_description}>
                      {ticket.issue_description}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={ticket.priority} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {ticket.assigned_technician_name}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-forest">
                      {ticket.warranty_applicable ? "Covered" : "Not covered"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Drawer */}
        {selectedTicket && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedTicket(null)}
          >
            <div
              className="w-full max-w-lg bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <div className="text-xs font-mono font-semibold text-muted-foreground">
                    {selectedTicket.ticket_number}
                  </div>
                  <h3 className="text-lg font-bold text-ink">
                    {selectedTicket.customer_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedTicket.priority} size="sm" />
                    <StatusBadge status={selectedTicket.status} size="sm" />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Details Snapshot */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-[#FAFBF8]">
                  <span className="text-muted-foreground uppercase text-[10.5px]">Equipment Serial</span>
                  <div className="font-mono font-bold text-ink mt-0.5">
                    {selectedTicket.equipment_serial_number}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-[#FAFBF8]">
                  <span className="text-muted-foreground uppercase text-[10.5px]">Warranty Coverage</span>
                  <div className="font-semibold text-forest mt-0.5">
                    {selectedTicket.warranty_applicable ? "Under Active Warranty" : "Not Covered"}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-white text-xs space-y-1">
                <span className="font-semibold text-ink">Reported Issue:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedTicket.issue_description}
                </p>
              </div>

              {/* Update Controls */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-ink block mb-1">
                    Update Ticket Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value as ServiceTicket["status"])}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink block mb-1">
                    Resolution / Technician Field Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe maintenance action taken, part replacement, or customer confirmation..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveTicket}
                  className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
                >
                  <Check className="size-4" />
                  <span>Save Ticket Updates</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
