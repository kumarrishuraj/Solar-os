"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Sun,
  Zap,
  Battery,
  Layers,
  FileText,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "sonner";

interface ComponentCardData {
  category: string;
  name: string;
  brand: string;
  model: string;
  qty: string;
  specs: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [selectedSystem, setSelectedSystem] = useState<"hybrid" | "ongrid">("hybrid");
  const [isApproved, setIsApproved] = useState(false);

  const systemKw = selectedSystem === "hybrid" ? 5.45 : 3.27;
  const panelCount = selectedSystem === "hybrid" ? 10 : 6;
  const annualGen = Math.round(systemKw * 1450);
  const annualSavings = Math.round(annualGen * 7.5);
  const paybackYears = selectedSystem === "hybrid" ? 4.6 : 3.9;

  const components: ComponentCardData[] = [
    {
      category: "Solar Panels",
      name: "Helios Pro 545W Mono PERC",
      brand: "SunPeak Energy",
      model: "SP-HEL-545",
      qty: `${panelCount} modules`,
      specs: "545 Wp · 21.8% efficiency · 25-yr warranty",
      icon: Sun,
    },
    {
      category: "Solar Inverter",
      name: selectedSystem === "hybrid" ? "SolarWave 5 kW Hybrid" : "SolarWave 3.6 kW 1φ On-grid",
      brand: "VoltWave Tech",
      model: selectedSystem === "hybrid" ? "INV-VW-5H" : "INV-VW-36",
      qty: "1 unit",
      specs: "98.2% efficiency · Dual MPPT · IP65",
      icon: Cpu,
    },
    ...(selectedSystem === "hybrid"
      ? [
          {
            category: "Energy Storage",
            name: "TerraVault 5.12 kWh LFP Battery",
            brand: "TerraVault",
            model: "BAT-TV-5K",
            qty: "1 pack",
            specs: "5.12 kWh · 100A BMS · 6000 cycles @ 80% DoD",
            icon: Battery,
          },
        ]
      : []),
    {
      category: "Mounting Structure",
      name: "GI Elevated Roof Mount Kit",
      brand: "RoofTech",
      model: "MT-RT-3K",
      qty: `${Math.ceil(systemKw / 3)} sets`,
      specs: "Hot-dip galvanized steel · 150 km/h wind rated",
      icon: Layers,
    },
    {
      category: "DC & AC Cables",
      name: "Solar Photovoltaic Cables (4 mm²)",
      brand: "SolarCab",
      model: "CB-SC-4DC",
      qty: "100 meters",
      specs: "Tinned copper · UV resistant · Dual insulated",
      icon: Zap,
    },
    {
      category: "Protection & Safety",
      name: "ACDB + DCDB Dual Enclosure Kit",
      brand: "SafeGrid",
      model: "PR-SG-KIT",
      qty: "1 set",
      specs: "Type 2 SPD · MCB / MCCB · IP65 outdoor rated",
      icon: ShieldCheck,
    },
  ];

  const pastRecommendations = [
    {
      id: "REC-89",
      customer: "Rohan Mehta",
      system: "10.9 kWp on-grid",
      modules: "20 × 545 W",
      inverter: "SolarWave 10 kW 3φ",
      gen: "15,900 kWh",
      payback: "4.1 yrs",
      status: "draft",
    },
    {
      id: "REC-88",
      customer: "Priya Verma",
      system: "5.45 kWp hybrid",
      modules: "10 × 545 W",
      inverter: "SolarWave 5 kW Hybrid",
      gen: "7,950 kWh",
      payback: "4.6 yrs",
      status: "draft",
    },
    {
      id: "REC-87",
      customer: "Rahul Sharma",
      system: "3.27 kWp on-grid",
      modules: "6 × 545 W",
      inverter: "SolarWave 5 kW 1φ",
      gen: "4,770 kWh",
      payback: "3.9 yrs",
      status: "approved",
    },
    {
      id: "REC-86",
      customer: "Deepika Reddy",
      system: "8.72 kWp on-grid",
      modules: "16 × 545 W",
      inverter: "SolarWave 10 kW 3φ",
      gen: "12,700 kWh",
      payback: "4.3 yrs",
      status: "approved",
    },
  ];

  const handleApproveDesign = () => {
    setIsApproved(true);
    toast.success("Design approved! Ready to generate formal quotation.");
  };

  const handleContinueToQuotation = () => {
    router.push("/quotations");
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Solar Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Engineering-rule sizing from verified rooftop dimensions, electricity consumption, and product catalog specs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSystem(selectedSystem === "hybrid" ? "ongrid" : "hybrid")}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors"
            >
              <Edit3 className="size-3.5" />
              <span>Switch to {selectedSystem === "hybrid" ? "On-grid" : "Hybrid"}</span>
            </button>
            <button
              onClick={handleApproveDesign}
              className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold shadow-sm transition-colors ${
                isApproved
                  ? "bg-[#E5F0E6] text-[#3F7A48] border border-forest/30"
                  : "bg-forest text-white hover:bg-forest/90"
              }`}
            >
              <CheckCircle2 className="size-4" />
              <span>{isApproved ? "Design Approved" : "Approve Design"}</span>
            </button>
            <button
              onClick={handleContinueToQuotation}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#A8CE45] text-ink text-xs font-semibold hover:brightness-95 transition-all shadow-sm"
            >
              <span>Continue to Quotation</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Top KPI Sizing Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Recommended Sizing
            </span>
            <div className="text-2xl font-bold text-ink mt-1">
              {systemKw} kWp
            </div>
            <div className="text-xs text-muted-foreground capitalize mt-0.5">
              {selectedSystem} rooftop system
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Solar Modules
            </span>
            <div className="text-2xl font-bold text-ink mt-1">
              {panelCount} Panels
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              545 W Mono PERC
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Est. Generation / yr
            </span>
            <div className="text-2xl font-bold text-forest mt-1">
              {annualGen.toLocaleString("en-IN")} kWh
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              ₹{annualSavings.toLocaleString("en-IN")} saved / yr
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Simple Payback
            </span>
            <div className="text-2xl font-bold text-ink mt-1">
              {paybackYears} Years
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              PM Surya Ghar eligible
            </div>
          </div>
        </div>

        {/* Bill of Materials (Component Cards) */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
                <Sun className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink">Bill of Materials (BOM)</h2>
                <p className="text-xs text-muted-foreground">Certified engineering components based on product catalog</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {components.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.name}
                  className="rounded-xl border border-border/80 bg-[#FAFBF8] p-4 flex flex-col justify-between hover:border-forest/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {c.category}
                      </span>
                      <div className="flex size-7 items-center justify-center rounded-lg bg-sage-soft text-forest">
                        <Icon className="size-3.5" />
                      </div>
                    </div>
                    <div className="font-semibold text-sm text-ink">{c.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {c.brand} · {c.model}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-forest">{c.qty}</span>
                    <span className="text-[11px] text-muted-foreground truncate max-w-[170px]" title={c.specs}>
                      {c.specs}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved Recommendations Table */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-base font-semibold text-ink">Recent System Configurations</h3>
              <p className="text-xs text-muted-foreground">Sized recommendations across project lifecycle</p>
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">System</th>
                  <th className="py-2.5 px-3">Modules</th>
                  <th className="py-2.5 px-3">Inverter</th>
                  <th className="py-2.5 px-3">Generation / yr</th>
                  <th className="py-2.5 px-3">Payback</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pastRecommendations.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">{r.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{r.customer}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.system}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.modules}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.inverter}</td>
                    <td className="py-2.5 px-3 font-semibold text-forest font-mono">{r.gen}</td>
                    <td className="py-2.5 px-3 text-ink font-medium">{r.payback}</td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
