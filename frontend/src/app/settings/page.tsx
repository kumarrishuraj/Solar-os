"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Settings as SettingsIcon,
  Building,
  Server,
  Shield,
  Check,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import { api, solarStore, API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import type { User, UserRole } from "@/types";

const MODULES = [
  "Dashboard",
  "Leads",
  "Customers",
  "Assessment",
  "Surveys",
  "Recommendations",
  "Quotations",
  "Payments",
  "Inventory",
  "Equipment",
  "Installations",
  "Monitoring",
  "Service",
  "Assistant",
];

const ROLES: { role: UserRole; title: string; access: string[] }[] = [
  {
    role: "admin",
    title: "Director (Admin)",
    access: MODULES,
  },
  {
    role: "sales_rep",
    title: "Sales Executive",
    access: ["Dashboard", "Leads", "Customers", "Assessment", "Surveys", "Recommendations", "Quotations", "Assistant"],
  },
  {
    role: "warehouse",
    title: "Warehouse Operator",
    access: ["Dashboard", "Inventory", "Equipment", "Installations", "Assistant"],
  },
  {
    role: "technician",
    title: "Lead Technician",
    access: ["Dashboard", "Surveys", "Installations", "Service", "Assistant"],
  },
];

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<User>(solarStore.getCurrentUser());
  const [companyName, setCompanyName] = useState("SolarOS Demo Installer Pvt. Ltd.");
  const [gstin, setGstin] = useState("27AABCS1234D1Z5");
  const [tariff, setTariff] = useState("7.50");
  const [isPinging, setIsPinging] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{
    tested: boolean;
    online: boolean;
    message: string;
  }>({
    tested: false,
    online: false,
    message: "Click below to test connection to FastAPI backend.",
  });

  useEffect(() => {
    return solarStore.subscribe(() => {
      setCurrentUser(solarStore.getCurrentUser());
    });
  }, []);

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organization profile and commercial terms saved!");
  };

  const handleTestBackend = async () => {
    setIsPinging(true);
    setBackendStatus({
      tested: true,
      online: false,
      message: `Pinging ${API_BASE_URL}/health ...`,
    });

    const res = await api.checkBackendHealth();
    setIsPinging(false);

    if (res.online && res.data) {
      setBackendStatus({
        tested: true,
        online: true,
        message: `Backend online (${res.data.name || "SolarOS API"} ${res.data.version || "0.1.0"}) · Status: "${res.data.status}" · Database: "${res.data.database || "connected"}"`,
      });
      toast.success("FastAPI backend is online and responding!");
    } else {
      setBackendStatus({
        tested: true,
        online: false,
        message: `Backend offline at ${API_BASE_URL} (${res.error}). SolarOS automatically operates seamlessly in self-contained demonstration mode.`,
      });
      toast.info("Backend offline — running on demonstration data store.");
    }
  };

  const handleSwitchRole = (role: UserRole) => {
    solarStore.setCurrentRole(role);
    toast.success(`Active role switched to ${role.replace("_", " ")}`);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Settings & System Integration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Organization details, FastAPI backend service integration, and role-based permissions matrix.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Organization Settings (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-border bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
                <Building className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink">Organization Profile</h2>
                <p className="text-xs text-muted-foreground">Appears on formal quotations and invoices</p>
              </div>
            </div>

            <form onSubmit={handleSaveOrg} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-ink block mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-ink block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-medium text-ink block mb-1">Default Tariff (₹/kWh)</label>
                  <input
                    type="text"
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border focus:outline-none focus:border-forest font-mono"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
                >
                  <Check className="size-4" />
                  <span>Save Organization</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Backend API Integration (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-border bg-white p-5 shadow-card space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
                  <Server className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ink">Backend API Integration</h2>
                  <p className="text-xs text-muted-foreground">FastAPI REST microservice connection</p>
                </div>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAFBF8] border border-border">
                  <span className="text-muted-foreground">Configured API Base URL:</span>
                  <span className="font-mono font-semibold text-ink">{API_BASE_URL}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAFBF8] border border-border">
                  <span className="text-muted-foreground">Current Operational State:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage-soft text-[11px] font-semibold text-forest">
                    <span className="size-1.5 rounded-full bg-[#A8CE45]" />
                    Graceful Hybrid Mode
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl text-xs border ${
                    backendStatus.online
                      ? "bg-[#E5F0E6] text-[#3F7A48] border-forest/30"
                      : backendStatus.tested
                      ? "bg-[#F8EFDB] text-[#8C6318] border-[#D9A441]/30"
                      : "bg-[#F7F8F5] text-muted-foreground border-border"
                  }`}
                >
                  {backendStatus.message}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleTestBackend}
                disabled={isPinging}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border bg-white text-xs font-semibold text-ink hover:bg-[#F7F8F5] transition-colors shadow-xs disabled:opacity-50"
              >
                <Activity className="size-3.5 text-forest" />
                <span>{isPinging ? "Testing Connection..." : "Test Backend Connection (GET /health)"}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Role-Based Access Control Matrix (12 cols) */}
          <div className="lg:col-span-12 rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
                  <Shield className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ink">Role-Based Access Control (RBAC) Matrix</h2>
                  <p className="text-xs text-muted-foreground">
                    Navigation and AI Assistant query access per business function. Click a role to simulate.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Role</th>
                    {MODULES.map((m) => (
                      <th key={m} className="py-2.5 px-2 text-center">
                        {m}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right">Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {ROLES.map((r) => {
                    const isCurrent = currentUser.role === r.role;
                    return (
                      <tr
                        key={r.role}
                        className={`transition-colors ${
                          isCurrent ? "bg-[#F4F7F1]" : "hover:bg-[#FAFBF8]"
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-ink">
                          {r.title}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A8CE45] text-ink">
                              Active
                            </span>
                          )}
                        </td>
                        {MODULES.map((m) => {
                          const hasAccess = r.access.includes(m);
                          return (
                            <td key={m} className="py-2.5 px-2 text-center">
                              {hasAccess ? (
                                <Check className="size-4 text-forest mx-auto" />
                              ) : (
                                <span className="text-muted-foreground/40 font-mono">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-right">
                          {!isCurrent ? (
                            <button
                              onClick={() => handleSwitchRole(r.role)}
                              className="text-xs font-semibold text-forest hover:underline"
                            >
                              Switch
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">Current</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
