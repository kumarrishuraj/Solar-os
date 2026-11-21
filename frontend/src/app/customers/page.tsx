"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Users,
  Search,
  Download,
  Zap,
  Wallet,
  TrendingUp,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { exportToCsv } from "@/lib/csv";

interface CustomerRecord {
  id: string;
  name: string;
  city: string;
  phone: string;
  email: string;
  projectsCount: number;
  totalValue: number;
  since: string;
  systemSize: string;
}

export default function CustomersPage() {
  const [customers] = useState<CustomerRecord[]>([
    {
      id: "CUST-101",
      name: "Meena Iyer",
      city: "Chennai",
      phone: "+91 43210 66666",
      email: "meena.iyer@gmail.com",
      projectsCount: 1,
      totalValue: 238900,
      since: "Oct 2026",
      systemSize: "3 kWp on-grid",
    },
    {
      id: "CUST-102",
      name: "Manoj Tiwari",
      city: "Indore",
      phone: "+91 98555 60606",
      email: "manoj.tiwari@gmail.com",
      projectsCount: 1,
      totalValue: 312400,
      since: "Oct 2026",
      systemSize: "4 kWp on-grid",
    },
    {
      id: "CUST-103",
      name: "Ravi Shankar",
      city: "Coimbatore",
      phone: "+91 97444 45454",
      email: "ravi.shankar@gmail.com",
      projectsCount: 1,
      totalValue: 296000,
      since: "Oct 2026",
      systemSize: "4 kWp on-grid",
    },
    {
      id: "CUST-104",
      name: "Aman Singh",
      city: "Noida",
      phone: "+91 76543 33333",
      email: "aman.singh@gmail.com",
      projectsCount: 1,
      totalValue: 168500,
      since: "Sep 2026",
      systemSize: "2 kWp on-grid",
    },
    {
      id: "CUST-105",
      name: "Rahul Sharma",
      city: "Pune",
      phone: "+91 98765 11111",
      email: "rahul.sharma@gmail.com",
      projectsCount: 1,
      totalValue: 245110,
      since: "Nov 2026",
      systemSize: "3.27 kWp on-grid",
    },
    {
      id: "CUST-106",
      name: "Vikas Kapoor",
      city: "Pune",
      phone: "+91 99887 76655",
      email: "vikas.kapoor@gmail.com",
      projectsCount: 2,
      totalValue: 612000,
      since: "Mar 2025",
      systemSize: "6 kWp hybrid",
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const filtered = customers.filter((c) =>
    (c.name + " " + c.city + " " + c.phone + " " + c.email)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleExportCsv = () => {
    exportToCsv("solaros-customers", [
      { key: "id", label: "Customer ID" },
      { key: "name", label: "Customer Name" },
      { key: "city", label: "City" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "projectsCount", label: "Projects" },
      { key: "totalValue", label: "Total Value (INR)" },
      { key: "since", label: "Customer Since" },
    ], customers);
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Customers
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Converted client accounts, installed systems and customer lifetime value.
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

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Total Customers
            </span>
            <div className="text-2xl font-bold text-ink mt-1">{customers.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Accounts on platform</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Active Sites
            </span>
            <div className="text-2xl font-bold text-forest mt-1">12</div>
            <div className="text-xs text-muted-foreground mt-0.5">Rooftops installed</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Lifetime Value
            </span>
            <div className="text-2xl font-bold text-ink mt-1">₹46.85 L</div>
            <div className="text-xs text-muted-foreground mt-0.5">Total contracted revenue</div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground tracking-wider">
              Referrals / Repeat
            </span>
            <div className="text-2xl font-bold text-[#A8CE45] mt-1">4</div>
            <div className="text-xs text-muted-foreground mt-0.5">Word-of-mouth clients</div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="relative w-full max-w-sm">
              <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search customers, city, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filtered.length} customers listed
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Installed System</th>
                  <th className="py-2.5 px-3">Projects</th>
                  <th className="py-2.5 px-3">Total Value</th>
                  <th className="py-2.5 px-3 text-right">Customer Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="group hover:bg-[#F7F8F5] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-ink group-hover:text-forest transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">{c.id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{c.city}</td>
                    <td className="py-2.5 px-3 font-mono text-ink">{c.phone}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{c.systemSize}</td>
                    <td className="py-2.5 px-3 font-mono font-medium">{c.projectsCount}</td>
                    <td className="py-2.5 px-3 font-bold text-ink">
                      ₹{c.totalValue.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{c.since}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Profile Drawer */}
        {selectedCustomer && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
            onClick={() => setSelectedCustomer(null)}
          >
            <div
              className="w-full max-w-lg bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <div className="text-xs font-mono font-semibold text-muted-foreground">
                    {selectedCustomer.id}
                  </div>
                  <h3 className="text-lg font-bold text-ink">
                    {selectedCustomer.name}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Customer since {selectedCustomer.since}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F7F8F5]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-xl border border-border bg-[#FAFBF8] space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-ink">
                  <Phone className="size-3.5 text-forest" />
                  <span className="font-mono">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-ink">
                  <Mail className="size-3.5 text-forest" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-ink">
                  <MapPin className="size-3.5 text-forest" />
                  <span>{selectedCustomer.city}, India</span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-white">
                  <span className="text-muted-foreground uppercase text-[10.5px]">Total Value</span>
                  <div className="text-lg font-bold text-ink mt-0.5">
                    ₹{selectedCustomer.totalValue.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-white">
                  <span className="text-muted-foreground uppercase text-[10.5px]">Installed System</span>
                  <div className="text-sm font-bold text-forest mt-0.5">
                    {selectedCustomer.systemSize}
                  </div>
                </div>
              </div>

              {/* Operational Records */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Linked Operations
                </div>
                <div className="p-3 rounded-xl border border-border bg-[#F7F8F5] text-xs space-y-1">
                  <div className="font-semibold text-ink">Rooftop Solar Installation</div>
                  <div className="text-muted-foreground">Commissioned and running on grid net-metering.</div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-[#F7F8F5] text-xs space-y-1">
                  <div className="font-semibold text-ink">Active Warranty Protection</div>
                  <div className="text-muted-foreground">25-year panel performance, 5-year comprehensive workmanship.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
