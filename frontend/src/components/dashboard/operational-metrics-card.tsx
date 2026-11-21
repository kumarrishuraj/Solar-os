"use client";

import React from "react";
import Link from "next/link";
import { Activity, Package, Cpu, ShieldAlert, ArrowRight } from "lucide-react";

export function OperationalMetricsCard() {
  const metrics = [
    {
      title: "Equipment Dispatched",
      stat: "148 / 162 units",
      percent: 91,
      color: "#55764D",
      icon: Package,
      href: "/inventory",
    },
    {
      title: "Inventory Availability",
      stat: "86% of SKUs in stock",
      percent: 86,
      color: "#A8CE45",
      icon: Cpu,
      href: "/inventory",
    },
    {
      title: "Service Tickets",
      stat: "7 open · 2 critical",
      percent: 28,
      color: "#D9A441",
      icon: ShieldAlert,
      href: "/service",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card min-w-0 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 pb-4 border-b border-border/60">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
            <Activity className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Operational Metrics</h2>
            <p className="text-xs text-muted-foreground">Warehouse, dispatch and service</p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-border/60">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                href={m.href}
                className="group flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0 hover:bg-[#F7F8F5] -mx-2 px-2 rounded-xl transition-colors"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-forest group-hover:scale-105 transition-transform">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink group-hover:text-forest transition-colors">
                      {m.title}
                    </span>
                    <span className="font-mono text-muted-foreground">{m.percent}%</span>
                  </div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5 mb-2">
                    {m.stat}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#ECEEE9] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${m.percent}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
