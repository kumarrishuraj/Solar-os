"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Activity,
  PlugZap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

export default function MonitoringPage() {
  const [showConnectModal, setShowConnectModal] = useState(false);

  const commissionedSites = [
    {
      id: "INS-198",
      customer: "Aman Singh",
      city: "Noida",
      system: "2 kWp on-grid",
      date: "14 Nov 2026",
      inverter: "SolarWave 3.6 kW",
      telemetry: "not_connected",
    },
    {
      id: "INS-184",
      customer: "Meena Iyer",
      city: "Chennai",
      system: "3 kWp on-grid",
      date: "02 Oct 2026",
      inverter: "SolarWave 5 kW 1φ",
      telemetry: "not_connected",
    },
    {
      id: "INS-171",
      customer: "Ravi Shankar",
      city: "Coimbatore",
      system: "4 kWp on-grid",
      date: "21 Sep 2026",
      inverter: "SolarWave 5 kW 1φ",
      telemetry: "not_connected",
    },
    {
      id: "INS-160",
      customer: "Vikas Kapoor",
      city: "Pune",
      system: "6 kWp hybrid",
      date: "12 Mar 2025",
      inverter: "SolarWave 10 kW 3φ",
      telemetry: "not_connected",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Monitoring & IoT Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live generation, power output, inverter health and anomaly detection appear here once telemetry is connected.
            </p>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
          >
            <PlugZap className="size-4" />
            <span>Connect Telemetry</span>
          </button>
        </div>

        {/* Honest Architecture Card: No fake live graphs */}
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-card space-y-4 max-w-3xl mx-auto">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-sage-soft text-forest mx-auto">
            <PlugZap className="size-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-ink">
              Inverter Telemetry Not Connected
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              SolarOS adheres to strict data integrity: live generation curves, power factor, DC string voltages and fault codes are displayed only from authentic IoT logger or cloud API streams. No simulated live data is shown.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors shadow-xs"
            >
              <HelpCircle className="size-4 text-forest" />
              <span>How to connect inverter hardware</span>
            </button>
          </div>
        </div>

        {/* Commissioned Sites Ready for Monitoring */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
                <Activity className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">Commissioned Systems</h3>
                <p className="text-xs text-muted-foreground">Sites awaiting hardware data logger pairing</p>
              </div>
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Project ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Installed System</th>
                  <th className="py-2.5 px-3">Inverter Model</th>
                  <th className="py-2.5 px-3">Commissioned Date</th>
                  <th className="py-2.5 px-3 text-right">Telemetry Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {commissionedSites.map((site) => (
                  <tr key={site.id} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-ink">{site.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{site.customer}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{site.city}</td>
                    <td className="py-2.5 px-3 text-ink font-medium">{site.system}</td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono">{site.inverter}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{site.date}</td>
                    <td className="py-2.5 px-3 text-right">
                      <StatusBadge status={site.telemetry} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integration Instructions Modal */}
        {showConnectModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
            onClick={() => setShowConnectModal(false)}
          >
            <div
              className="w-full max-w-lg bg-white rounded-2xl border border-border p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-base font-semibold text-ink">Connect Inverter Telemetry</h3>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-ink leading-relaxed">
                <p className="text-muted-foreground">
                  SolarOS ingests high-frequency inverter telemetry via MQTT, REST webhooks or Modbus RS485 data loggers:
                </p>
                <ol className="space-y-2 list-decimal list-inside p-3.5 rounded-xl bg-[#FAFBF8] border border-border">
                  <li>
                    <b>Activate Hardware Logger:</b> Plug the Wi-Fi/4G dongle into the inverter&apos;s communication port during commissioning.
                  </li>
                  <li>
                    <b>Register Inverter API:</b> Configure manufacturer credentials in backend environment settings (SolarWave, Sungrow, Growatt, Enphase).
                  </li>
                  <li>
                    <b>5-Minute Sync:</b> The backend polls voltage, string current, temperature, and grid frequency every 5 minutes.
                  </li>
                  <li>
                    <b>AI Anomaly Detection:</b> Scikit-learn Isolation Forest algorithm automatically flags shading degradation, inverter clipping, or ground faults.
                  </li>
                </ol>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-5 h-9 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
