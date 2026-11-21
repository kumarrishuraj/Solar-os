"use client";

import React from "react";
import { TrendingUp, IndianRupee } from "lucide-react";

interface MetricItem {
  label: string;
  value: string;
  delta: string;
  deltaType: "up" | "down";
  context: string;
  sparkline: number[];
}

export function BusinessOverviewCard() {
  const metrics: MetricItem[] = [
    {
      label: "TOTAL REVENUE",
      value: "₹12.45 L",
      delta: "+12.4%",
      deltaType: "up",
      context: "vs last month",
      sparkline: [60, 72, 66, 80, 74, 100],
    },
    {
      label: "MONTHLY REVENUE",
      value: "₹3.20 L",
      delta: "+64.1%",
      deltaType: "up",
      context: "vs October",
      sparkline: [50, 59, 53, 66, 61, 100],
    },
    {
      label: "OUTSTANDING PAYMENTS",
      value: "₹2.10 L",
      delta: "+8.5%",
      deltaType: "down",
      context: "3 invoices overdue",
      sparkline: [20, 30, 35, 40, 62, 100],
    },
    {
      label: "TOTAL PROJECTS",
      value: "86",
      delta: "+9",
      deltaType: "up",
      context: "new this month",
      sparkline: [60, 66, 70, 74, 80, 100],
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card min-w-0">
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
            <TrendingUp className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Business Overview</h2>
            <p className="text-xs text-muted-foreground">Financial year to date · Nov 2026</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-soft text-[11px] font-medium text-forest border border-forest/15">
          <span className="size-1.5 rounded-full bg-[#A8CE45]" />
          Demo data
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col justify-between rounded-xl bg-[#F7F8F5] p-3.5 border border-border/40 hover:border-forest/20 transition-colors"
          >
            <div>
              <span className="text-[10.5px] font-semibold tracking-wider uppercase text-muted-foreground">
                {m.label}
              </span>
              <div className="mt-1.5 text-2xl font-bold tracking-tight text-ink">
                {m.value}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md font-medium text-[11px] ${
                    m.deltaType === "up"
                      ? "bg-[#E5F0E6] text-[#3F7A48]"
                      : "bg-[#F6E5E2] text-[#A4483F]"
                  }`}
                >
                  {m.delta}
                </span>
                <span className="text-muted-foreground text-[11px]">{m.context}</span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="mt-3 h-7 w-full">
              <svg
                viewBox="0 0 100 26"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <polyline
                  points={m.sparkline
                    .map((y, i) => `${i * 20},${24 - y * 0.2}`)
                    .join(" ")}
                  fill="none"
                  stroke={m.deltaType === "down" ? "#C96B61" : "#55764D"}
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
