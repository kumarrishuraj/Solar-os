"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  X,
  Check,
  Download,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/csv";

interface SurveyRow {
  id: string;
  customer: string;
  city: string;
  surveyor: string;
  date: string;
  roof: string;
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected";
  pitch: string;
  azimuth: string;
  cableDist: string;
  electrical: string;
  structural: string;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<SurveyRow[]>([
    {
      id: "S-301",
      customer: "Priya Verma",
      city: "New Delhi",
      surveyor: "Vikram Patel",
      date: "15 Nov 2026",
      roof: "RCC flat · 85 m²",
      status: "submitted",
      pitch: "15° tilt",
      azimuth: "180° South",
      cableDist: "12 meters",
      electrical: "Three-phase 10 kW connection, DISCOM meter load verified",
      structural: "Strong RCC roof slab, age ~6 years, parapet wall 3.5 ft",
    },
    {
      id: "S-302",
      customer: "Rahul Sharma",
      city: "Pune",
      surveyor: "Vikram Patel",
      date: "10 Nov 2026",
      roof: "RCC flat · 55 m²",
      status: "approved",
      pitch: "10° tilt",
      azimuth: "195° South-West",
      cableDist: "8 meters",
      electrical: "Single phase, requires DISCOM sanction increase to 3 kW",
      structural: "Reinforced concrete, well maintained terrace",
    },
    {
      id: "S-304",
      customer: "Arjun Kapoor",
      city: "Gurugram",
      surveyor: "Vikram Patel",
      date: "21 Nov 2026",
      roof: "RCC flat · 120 m²",
      status: "in_progress",
      pitch: "Flat (elevated mount)",
      azimuth: "180° South",
      cableDist: "15 meters",
      electrical: "Three-phase commercial connection",
      structural: "Commercial slab, suitable for elevated mounting structure",
    },
    {
      id: "S-303",
      customer: "Karthik Nair",
      city: "Bengaluru",
      surveyor: "Vikram Patel",
      date: "25 Nov 2026",
      roof: "Metal sheet · 70 m²",
      status: "pending",
      pitch: "8° slope",
      azimuth: "175° South",
      cableDist: "14 meters",
      electrical: "Single phase 5 kW connection",
      structural: "Purlin spacing 1.2 m, suitable for mini-rail mounts",
    },
    {
      id: "S-305",
      customer: "Harpreet Gill",
      city: "Chandigarh",
      surveyor: "Vikram Patel",
      date: "26 Nov 2026",
      roof: "RCC flat · 96 m²",
      status: "pending",
      pitch: "Flat",
      azimuth: "180° South",
      cableDist: "11 meters",
      electrical: "Single phase, sanctioned load 6 kW",
      structural: "Standard residential terrace",
    },
    {
      id: "S-299",
      customer: "Sunil Joshi",
      city: "Pune",
      surveyor: "Vikram Patel",
      date: "28 Oct 2026",
      roof: "Sloped tile · 40 m²",
      status: "rejected",
      pitch: "30° steep",
      azimuth: "90° East",
      cableDist: "22 meters",
      electrical: "Old wiring, low sanctioned load",
      structural: "Fragile Mangalore tiles, weak wooden rafters incapable of load",
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyRow | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    customer: "",
    city: "",
    roof: "RCC flat · 60 m²",
    date: "28 Nov 2026",
  });

  const filteredSurveys = surveys.filter(
    (s) =>
      (s.customer + " " + s.city + " " + s.id + " " + s.surveyor)
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleUpdateStatus = (id: string, newStatus: SurveyRow["status"]) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    if (selectedSurvey && selectedSurvey.id === id) {
      setSelectedSurvey({ ...selectedSurvey, status: newStatus });
    }
    toast.success(`Survey ${id} updated to ${newStatus}`);
  };

  const handleExportCsv = () => {
    exportToCsv("solaros-surveys", [
      { key: "id", label: "Survey ID" },
      { key: "customer", label: "Customer" },
      { key: "city", label: "City" },
      { key: "surveyor", label: "Surveyor" },
      { key: "date", label: "Date" },
      { key: "roof", label: "Roof Specs" },
      { key: "status", label: "Status" },
    ], surveys);
  };

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurvey.customer.trim()) return;

    const id = `S-${306 + surveys.length}`;
    const row: SurveyRow = {
      id,
      customer: newSurvey.customer,
      city: newSurvey.city || "Pune",
      surveyor: "Vikram Patel",
      date: newSurvey.date,
      roof: newSurvey.roof,
      status: "pending",
      pitch: "10° tilt",
      azimuth: "180° South",
      cableDist: "10 meters",
      electrical: "Verification on site scheduled",
      structural: "Standard inspection required",
    };

    setSurveys([row, ...surveys]);
    setShowScheduleModal(false);
    toast.success(`Site survey scheduled for ${newSurvey.customer}`);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Site Surveys
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Physical verification of rooftop measurements, structural integrity, and electrical panel readiness.
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
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
            >
              <Plus className="size-4" />
              <span>Schedule Survey</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Scheduled
            </span>
            <div className="text-2xl font-bold text-ink mt-1">
              {surveys.filter((s) => s.status === "pending").length}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Awaiting site visit</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Completed
            </span>
            <div className="text-2xl font-bold text-forest mt-1">21</div>
            <div className="text-xs text-muted-foreground mt-0.5">Physical surveys verified</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Pending Approval
            </span>
            <div className="text-2xl font-bold text-[#D9A441] mt-1">
              {surveys.filter((s) => s.status === "submitted").length}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Engineer review needed</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Rejected
            </span>
            <div className="text-2xl font-bold text-danger mt-1">
              {surveys.filter((s) => s.status === "rejected").length}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Unfit roof / structural issue</div>
          </div>
        </div>

        {/* Survey List Table */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="relative w-full max-w-sm">
              <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search survey ID, customer, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filteredSurveys.length} surveys recorded
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Survey ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Surveyor</th>
                  <th className="py-2.5 px-3">Scheduled Date</th>
                  <th className="py-2.5 px-3">Rooftop Specs</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSurveys.map((survey) => (
                  <tr
                    key={survey.id}
                    onClick={() => setSelectedSurvey(survey)}
                    className="group hover:bg-[#F7F8F5] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">
                      {survey.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink group-hover:text-forest transition-colors">
                      {survey.customer}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{survey.city}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{survey.surveyor}</td>
                    <td className="py-2.5 px-3 text-ink">{survey.date}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{survey.roof}</td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={survey.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Survey Details Drawer */}
        {selectedSurvey && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedSurvey(null)}
          >
            <div
              className="w-full max-w-lg bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <div className="text-xs font-mono font-semibold text-muted-foreground">
                    {selectedSurvey.id}
                  </div>
                  <h3 className="text-lg font-bold text-ink">
                    {selectedSurvey.customer}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {selectedSurvey.city} · Surveyor {selectedSurvey.surveyor}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSurvey(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Status Badge & Actions */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8F5]">
                <div className="text-xs font-medium text-ink">
                  Current Status:
                </div>
                <StatusBadge status={selectedSurvey.status} />
              </div>

              {/* Verification Checklist */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Physical Verification Checklist
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl border border-border bg-[#FAFBF8] space-y-1">
                    <span className="font-semibold text-ink">Roof Dimensions & Area</span>
                    <p className="text-muted-foreground">{selectedSurvey.roof}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl border border-border bg-[#FAFBF8]">
                      <span className="font-semibold text-ink block">Pitch / Tilt</span>
                      <span className="text-muted-foreground">{selectedSurvey.pitch}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border bg-[#FAFBF8]">
                      <span className="font-semibold text-ink block">Compass Orientation</span>
                      <span className="text-muted-foreground">{selectedSurvey.azimuth}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-[#FAFBF8] space-y-1">
                    <span className="font-semibold text-ink">Cable Distance to Inverter</span>
                    <p className="text-muted-foreground">{selectedSurvey.cableDist}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-[#FAFBF8] space-y-1">
                    <span className="font-semibold text-ink">Electrical Assessment</span>
                    <p className="text-muted-foreground">{selectedSurvey.electrical}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-[#FAFBF8] space-y-1">
                    <span className="font-semibold text-ink">Structural Observation</span>
                    <p className="text-muted-foreground">{selectedSurvey.structural}</p>
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-3 border-t border-border space-y-2">
                <div className="text-xs font-semibold text-ink">Update Survey Stage:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedSurvey.id, "approved")}
                    className="inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90"
                  >
                    <Check className="size-4" />
                    <span>Approve Survey</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSurvey.id, "in_progress")}
                    className="inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                  >
                    <span>Mark In Progress</span>
                  </button>
                </div>
                <button
                  onClick={() => handleUpdateStatus(selectedSurvey.id, "rejected")}
                  className="w-full h-8 rounded-xl bg-danger-soft text-danger text-xs font-medium hover:bg-danger-soft/80"
                >
                  Reject (Structural or Electrical Incompatibility)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Survey Modal */}
        {showScheduleModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
            onClick={() => setShowScheduleModal(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl border border-border p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-ink">Schedule Site Survey</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSurvey} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-ink block mb-1">Customer Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ramesh Deshmukh"
                    value={newSurvey.customer}
                    onChange={(e) => setNewSurvey({ ...newSurvey, customer: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="font-medium text-ink block mb-1">City *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Pune"
                    value={newSurvey.city}
                    onChange={(e) => setNewSurvey({ ...newSurvey, city: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="font-medium text-ink block mb-1">Roof Type & Approx Area</label>
                  <input
                    type="text"
                    placeholder="e.g. RCC flat · 80 m²"
                    value={newSurvey.roof}
                    onChange={(e) => setNewSurvey({ ...newSurvey, roof: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="font-medium text-ink block mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 28 Nov 2026"
                    value={newSurvey.date}
                    onChange={(e) => setNewSurvey({ ...newSurvey, date: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 h-9 rounded-xl border border-border text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 h-9 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 shadow-sm"
                  >
                    Schedule Survey
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
