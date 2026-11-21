"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Wrench,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Check,
  UserCheck,
} from "lucide-react";
import { solarStore } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import { exportToCsv } from "@/lib/csv";
import { toast } from "sonner";
import type { Installation } from "@/types";

const CHECKLIST_STEPS = [
  { name: "Site preparation & safety audit", weight: 5 },
  { name: "Mounting structure installed & torqued", weight: 10 },
  { name: "Panels mounted, aligned & secured", weight: 15 },
  { name: "DC string wiring & MC4 crimping", weight: 15 },
  { name: "Inverter installed & wall mounted", weight: 10 },
  { name: "AC wiring & ACDB connection", weight: 10 },
  { name: "Earthing pits & lightning arrester", weight: 15 },
  { name: "System electrical testing (Voc, Isc, IR)", weight: 10 },
  { name: "DISCOM net-meter synchronization", weight: 5 },
  { name: "Customer handover & warranty sign-off", weight: 5 },
];

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>(
    solarStore.getInstallations()
  );
  const [search, setSearch] = useState("");
  const [selectedInst, setSelectedInst] = useState<Installation | null>(null);

  useEffect(() => {
    return solarStore.subscribe(() => {
      const insts = solarStore.getInstallations();
      setInstallations(insts);
      if (selectedInst) {
        const found = insts.find((i) => i.id === selectedInst.id);
        if (found) setSelectedInst(found);
      }
    });
  }, [selectedInst]);

  const scheduledCount = installations.filter((i) => i.status === "scheduled").length;
  const inProgressCount = installations.filter((i) => i.status === "in_progress").length;
  const completedCount = 68; // aggregate from dashboard
  const delayedCount = installations.filter((i) => i.status === "delayed").length;

  const filtered = installations.filter((inst) =>
    (inst.customer_name + " " + inst.city + " " + inst.lead_technician_name + " " + inst.id)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleToggleChecklist = (stepIdx: number) => {
    if (!selectedInst) return;
    const currentCompleted = selectedInst.checklist
      .map((c, i) => (c.completed ? i : -1))
      .filter((i) => i !== -1);

    let nextCompleted: number[];
    if (currentCompleted.includes(stepIdx)) {
      nextCompleted = currentCompleted.filter((i) => i !== stepIdx);
    } else {
      nextCompleted = [...currentCompleted, stepIdx];
    }

    solarStore.updateInstallationProgress(selectedInst.id, nextCompleted);
  };

  const handleCompleteHandover = () => {
    if (!selectedInst) return;
    const all = CHECKLIST_STEPS.map((_, i) => i);
    solarStore.updateInstallationProgress(selectedInst.id, all);
    toast.success(`Handover complete — warranty certificate issued for ${selectedInst.customer_name}!`);
  };

  const handleExportCsv = () => {
    exportToCsv("solaros-installations", [
      { key: "id", label: "Project ID" },
      { key: "customer_name", label: "Customer" },
      { key: "city", label: "City" },
      { key: "system_capacity_kw", label: "Capacity (kW)" },
      { key: "lead_technician_name", label: "Lead Technician" },
      { key: "scheduled_date", label: "Scheduled Date" },
      { key: "progress_percent", label: "Progress %" },
      { key: "status", label: "Status" },
    ], installations);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Installation Management
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Field crew dispatch, 10-point commissioning checklist, electrical safety testing and customer handover.
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
              Scheduled
            </span>
            <div className="text-2xl font-bold text-ink mt-1">4</div>
            <div className="text-xs text-muted-foreground mt-0.5">Crew assigned this week</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              In Progress
            </span>
            <div className="text-2xl font-bold text-forest mt-1">5</div>
            <div className="text-xs text-muted-foreground mt-0.5">Rooftop work underway</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Completed
            </span>
            <div className="text-2xl font-bold text-[#5B9B64] mt-1">{completedCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Grid commissioned</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Delayed Sites
            </span>
            <div className="text-2xl font-bold text-danger mt-1">1</div>
            <div className="text-xs text-muted-foreground mt-0.5">DISCOM net-meter lag</div>
          </div>
        </div>

        {/* Installations Table */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="relative w-full max-w-sm">
              <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search project, customer, technician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} active sites
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Project ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">System Size</th>
                  <th className="py-2.5 px-3">Lead Technician</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((inst) => (
                  <tr
                    key={inst.id}
                    onClick={() => setSelectedInst(inst)}
                    className="group hover:bg-[#F7F8F5] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {inst.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink group-hover:text-forest transition-colors">
                      {inst.customer_name}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{inst.city}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-ink">
                      {inst.system_capacity_kw} kW
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {inst.lead_technician_name}
                    </td>
                    <td className="py-2.5 px-3 text-ink">
                      {inst.scheduled_date
                        ? new Date(inst.scheduled_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-[#ECEEE9] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${inst.progress_percent}%`,
                              backgroundColor:
                                inst.progress_percent === 100
                                  ? "#5B9B64"
                                  : inst.status === "delayed"
                                  ? "#C96B61"
                                  : "#55764D",
                            }}
                          />
                        </div>
                        <span className="font-mono font-medium">{inst.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={inst.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Installation Drawer with Checklist */}
        {selectedInst && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedInst(null)}
          >
            <div
              className="w-full max-w-lg bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <div className="text-xs font-mono font-semibold text-muted-foreground">
                    {selectedInst.id}
                  </div>
                  <h3 className="text-lg font-bold text-ink">
                    {selectedInst.customer_name} — {selectedInst.system_capacity_kw} kW
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {selectedInst.city} · Crew Lead: {selectedInst.lead_technician_name}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInst(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Progress Summary Header */}
              <div className="p-4 rounded-xl bg-[#FAFBF8] border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">Completion Progress</span>
                  <span className="text-lg font-bold font-mono text-forest">
                    {selectedInst.progress_percent}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#ECEEE9] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${selectedInst.progress_percent}%`,
                      backgroundColor:
                        selectedInst.progress_percent === 100
                          ? "#5B9B64"
                          : selectedInst.status === "delayed"
                          ? "#C96B61"
                          : "#55764D",
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                  <span>Status:</span>
                  <StatusBadge status={selectedInst.status} size="sm" />
                </div>
              </div>

              {/* 10-Step Commissioning Checklist */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  10-Step Commissioning Checklist
                </div>
                <div className="space-y-1.5">
                  {CHECKLIST_STEPS.map((step, idx) => {
                    const isDone = selectedInst.checklist[idx]?.completed;
                    return (
                      <button
                        key={step.name}
                        onClick={() => handleToggleChecklist(idx)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors ${
                          isDone
                            ? "bg-[#E5F0E6] border-forest/30 text-ink"
                            : "bg-white border-border text-muted-foreground hover:bg-[#F7F8F5]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                              isDone
                                ? "bg-forest border-forest text-white"
                                : "border-border bg-white"
                            }`}
                          >
                            {isDone && <Check className="size-3" />}
                          </div>
                          <span className={`truncate ${isDone ? "font-medium" : ""}`}>
                            {step.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground ml-2 shrink-0">
                          +{step.weight}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Handover Signoff Action */}
              <div className="pt-3 border-t border-border space-y-2">
                <button
                  onClick={handleCompleteHandover}
                  disabled={selectedInst.progress_percent < 90}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Complete Customer Handover & Register Warranty</span>
                </button>
                {selectedInst.progress_percent < 90 && (
                  <p className="text-[11px] text-center text-muted-foreground">
                    Complete at least 90% of technical verification steps to enable handover.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
