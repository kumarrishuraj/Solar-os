"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Cpu,
  Search,
  Download,
  ScanLine,
  Send,
  CheckCircle2,
  AlertTriangle,
  X,
  Camera,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { exportToCsv } from "@/lib/csv";
import { toast } from "sonner";

interface EquipmentRow {
  serial: string;
  product: string;
  supplier: string;
  purchased: string;
  warrantyUntil: string;
  project: string;
  status: "in_warehouse" | "reserved" | "dispatched" | "installed";
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentRow[]>([
    {
      serial: "SP-HEL-2026-00142",
      product: "Helios Pro 545 W Mono PERC",
      supplier: "SunPeak Energy",
      purchased: "15 Jun 2026",
      warrantyUntil: "Jun 2051",
      project: "Rahul Sharma — 3 kW",
      status: "installed",
    },
    {
      serial: "INV-VW-2026-00058",
      product: "SolarWave 5 kW 1φ On-grid",
      supplier: "VoltWave Tech",
      purchased: "01 Jul 2026",
      warrantyUntil: "Jul 2036",
      project: "Rahul Sharma — 3 kW",
      status: "dispatched",
    },
    {
      serial: "BAT-TV-2026-00023",
      product: "TerraVault 5.12 kWh LFP",
      supplier: "TerraVault",
      purchased: "10 Aug 2026",
      warrantyUntil: "Aug 2036",
      project: "Unassigned",
      status: "in_warehouse",
    },
    {
      serial: "SP-HEL-2026-00178",
      product: "Helios Pro 545 W Mono PERC",
      supplier: "SunPeak Energy",
      purchased: "01 Sep 2026",
      warrantyUntil: "Sep 2051",
      project: "Priya Verma — 5 kW",
      status: "reserved",
    },
    {
      serial: "INV-VW-2026-00041",
      product: "SolarWave 5 kW 1φ On-grid",
      supplier: "VoltWave Tech",
      purchased: "12 Mar 2026",
      warrantyUntil: "Mar 2036",
      project: "Meena Iyer — 3 kW",
      status: "installed",
    },
    {
      serial: "SP-HEL-2026-00089",
      product: "Helios Pro 545 W Mono PERC",
      supplier: "SunPeak Energy",
      purchased: "10 Feb 2026",
      warrantyUntil: "Feb 2051",
      project: "Aman Singh — 2 kW",
      status: "installed",
    },
  ]);

  const [search, setSearch] = useState("");
  const [showScanModal, setShowScanModal] = useState(false);
  const [manualSerial, setManualSerial] = useState("");
  const [scanResult, setScanResult] = useState<EquipmentRow | null>(null);

  const filtered = equipment.filter((eq) =>
    (eq.serial + " " + eq.product + " " + eq.project)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSimulateScan = () => {
    const randomItem = equipment[Math.floor(Math.random() * equipment.length)];
    setScanResult(randomItem);
    toast.success(`Barcode scanned: ${randomItem.serial}`);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = equipment.find(
      (e) => e.serial.toLowerCase() === manualSerial.trim().toLowerCase()
    );
    if (found) {
      setScanResult(found);
      toast.success(`Found unit: ${found.serial}`);
    } else {
      toast.error(`Serial ${manualSerial} not found in database.`);
    }
  };

  const handleExportCsv = () => {
    exportToCsv("solaros-equipment", [
      { key: "serial", label: "Serial Number" },
      { key: "product", label: "Product" },
      { key: "supplier", label: "Supplier" },
      { key: "purchased", label: "Purchased Date" },
      { key: "warrantyUntil", label: "Warranty Until" },
      { key: "project", label: "Project Assignment" },
      { key: "status", label: "Status" },
    ], equipment);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Equipment & Serial Tracking
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Serial-number tracking from supplier warehouse to rooftop commissioning, with linked warranty records.
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
              onClick={() => {
                setScanResult(null);
                setManualSerial("");
                setShowScanModal(true);
              }}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
            >
              <ScanLine className="size-4" />
              <span>Scan QR / Barcode</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Tracked Units
            </span>
            <div className="text-2xl font-bold text-ink mt-1">162</div>
            <div className="text-xs text-muted-foreground mt-0.5">Serialized in database</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Dispatched to Field
            </span>
            <div className="text-2xl font-bold text-forest mt-1">148</div>
            <div className="text-xs text-muted-foreground mt-0.5">En route or on site</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Commissioned
            </span>
            <div className="text-2xl font-bold text-[#5B9B64] mt-1">131</div>
            <div className="text-xs text-muted-foreground mt-0.5">Generating solar power</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Warranty Expiring
            </span>
            <div className="text-2xl font-bold text-[#D9A441] mt-1">3</div>
            <div className="text-xs text-muted-foreground mt-0.5">Within 90 days</div>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="relative w-full max-w-sm">
              <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search serial number, product, project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} equipment units listed
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Serial Number</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Purchased</th>
                  <th className="py-2.5 px-3">Warranty Until</th>
                  <th className="py-2.5 px-3">Project Assignment</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((item) => (
                  <tr key={item.serial} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-ink">{item.serial}</td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{item.product}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{item.supplier}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{item.purchased}</td>
                    <td className="py-2.5 px-3 font-mono text-forest">{item.warrantyUntil}</td>
                    <td className="py-2.5 px-3 text-ink font-medium">{item.project}</td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR / Barcode Scanner Modal with Camera Simulation + Manual Fallback */}
        {showScanModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
            onClick={() => setShowScanModal(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl border border-border p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <ScanLine className="size-4 text-forest" />
                  <h3 className="text-base font-semibold text-ink">QR / Barcode Scanner</h3>
                </div>
                <button
                  onClick={() => setShowScanModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Viewfinder Camera Simulation */}
              <div className="relative aspect-[4/3] rounded-xl bg-[#292C29] flex flex-col items-center justify-center p-4 text-center overflow-hidden border border-border">
                <div className="absolute inset-8 border-2 border-dashed border-[#A8CE45] rounded-xl flex items-center justify-center">
                  <div className="w-full h-0.5 bg-[#A8CE45] animate-[flow_2s_linear_infinite]" />
                </div>
                <Camera className="size-8 text-white/40 mb-2 relative z-10" />
                <p className="text-xs text-white/80 relative z-10 font-medium">
                  Align hardware QR code or barcode inside frame
                </p>
                <button
                  onClick={handleSimulateScan}
                  className="mt-3 relative z-10 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/20 text-white text-xs font-semibold hover:bg-white/30 backdrop-blur-sm"
                >
                  <ScanLine className="size-3.5" />
                  <span>Simulate Camera Scan</span>
                </button>
              </div>

              {/* Manual Entry Fallback */}
              <form onSubmit={handleManualSearch} className="space-y-2 pt-1">
                <label className="text-xs font-medium text-ink block">
                  Manual Serial Entry (Fallback)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SP-HEL-2026-00142"
                    value={manualSerial}
                    onChange={(e) => setManualSerial(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest font-mono uppercase"
                  />
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90"
                  >
                    Lookup
                  </button>
                </div>
              </form>

              {/* Scan Results Card */}
              {scanResult && (
                <div className="rounded-xl border border-forest/30 bg-[#E5F0E6] p-3.5 text-xs space-y-2 animate-in fade-in-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-ink">{scanResult.serial}</span>
                    <StatusBadge status={scanResult.status} size="sm" />
                  </div>
                  <div className="font-medium text-ink">{scanResult.product}</div>
                  <div className="text-muted-foreground">
                    Assigned: <b className="text-ink">{scanResult.project}</b>
                  </div>
                  <div className="text-muted-foreground">
                    Warranty Valid: <b className="text-forest">{scanResult.warrantyUntil}</b>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
