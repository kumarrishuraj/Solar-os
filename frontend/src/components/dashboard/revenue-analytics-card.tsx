"use client";

import React, { useState } from "react";
import { Wallet } from "lucide-react";

type Timeframe = "weekly" | "monthly" | "yearly";

interface RevenueDataset {
  labels: string[];
  rev: number[];
  out: number[];
}

const REVENUE_DATA: Record<Timeframe, RevenueDataset> = {
  weekly: {
    labels: ["W40", "W41", "W42", "W43", "W44", "W45", "W46", "W47"],
    rev: [62000, 48000, 71000, 55000, 80000, 74000, 68000, 98000],
    out: [6000, 4000, 9000, 5000, 12000, 8000, 10000, 21000],
  },
  monthly: {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    rev: [160000, 190000, 170000, 210000, 195000, 320000],
    out: [10000, 15000, 20000, 25000, 40000, 100000],
  },
  yearly: {
    labels: ["FY 2022", "FY 2023", "FY 2024", "FY 2025", "FY 2026"],
    rev: [640000, 910000, 1380000, 1820000, 1245000],
    out: [20000, 45000, 80000, 120000, 210000],
  },
};

export function RevenueAnalyticsCard() {
  const [timeframe, setTimeframe] = useState<Timeframe>("monthly");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dataset = REVENUE_DATA[timeframe];
  const paid = dataset.rev.map((v, i) => v - dataset.out[i]);

  // Chart Dimensions & Scaling
  const W = 620;
  const H = 240;
  const pl = 54;
  const pr = 16;
  const pt = 20;
  const pb = 32;
  const n = dataset.labels.length;

  const maxVal = Math.max(...dataset.rev) * 1.15;
  const step =
    maxVal > 1e6 ? 5e5 : maxVal > 3e5 ? 1e5 : maxVal > 1e5 ? 5e4 : 2e4;
  const topVal = Math.ceil(maxVal / step) * step;

  const getX = (i: number) => pl + (n === 1 ? 0 : (i * (W - pl - pr)) / (n - 1));
  const getY = (v: number) => pt + (H - pt - pb) * (1 - v / topVal);

  const linePath = (arr: number[]) =>
    arr
      .map((v, i) => `${i === 0 ? "M" : "L"}${getX(i).toFixed(1)},${getY(v).toFixed(1)}`)
      .join(" ");

  const barWidth = Math.min(24, ((W - pl - pr) / n) * 0.35);

  const formatINR = (v: number) => "₹" + Math.round(v).toLocaleString("en-IN");
  const formatYAxis = (v: number) =>
    v >= 1e5
      ? `₹${(v / 1e5).toFixed(1)}L`
      : v > 0
      ? `₹${v / 1000}k`
      : "₹0";

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
            <Wallet className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Revenue Analytics</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-[#55764D]" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-[#A8CE45]" /> Received
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-[#D9A441]" /> Outstanding
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe segmentation buttons */}
        <div className="inline-flex rounded-xl bg-[#ECEEE9] p-1 text-xs">
          {(["weekly", "monthly", "yearly"] as Timeframe[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setTimeframe(tab);
                setHoverIndex(null);
              }}
              className={`rounded-lg px-3 py-1 font-medium capitalize transition-all ${
                timeframe === tab
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative mt-4 w-full h-[250px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#55764D" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#55764D" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis */}
          {Array.from({ length: Math.floor(topVal / step) + 1 }).map((_, i) => {
            const v = i * step;
            const y = getY(v);
            return (
              <g key={`grid-${v}`}>
                <line
                  x1={pl}
                  x2={W - pr}
                  y1={y}
                  y2={y}
                  stroke="#ECEEE9"
                  strokeWidth="1"
                />
                <text
                  x={pl - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#858B84"
                  className="font-mono"
                >
                  {formatYAxis(v)}
                </text>
              </g>
            );
          })}

          {/* Outstanding bars */}
          {dataset.out.map((v, i) => (
            <rect
              key={`bar-${i}`}
              x={getX(i) - barWidth / 2}
              y={getY(v)}
              width={barWidth}
              height={getY(0) - getY(v)}
              rx="4"
              fill="#D9A441"
              opacity="0.7"
            />
          ))}

          {/* Revenue Filled Area */}
          <path
            d={`${linePath(dataset.rev)} L${getX(n - 1)},${getY(0)} L${getX(0)},${getY(0)} Z`}
            fill="url(#revenueGradient)"
          />

          {/* Revenue Total Line */}
          <path
            d={linePath(dataset.rev)}
            fill="none"
            stroke="#55764D"
            strokeWidth="2.4"
          />

          {/* Payments Received Line */}
          <path
            d={linePath(paid)}
            fill="none"
            stroke="#A8CE45"
            strokeWidth="2.4"
          />

          {/* X Axis Labels */}
          {dataset.labels.map((lbl, i) => (
            <text
              key={`lbl-${i}`}
              x={getX(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="11"
              fill="#858B84"
              className="font-medium"
            >
              {lbl}
            </text>
          ))}

          {/* Interactive Hover Guides & Dots */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                x2={getX(hoverIndex)}
                y1={pt}
                y2={getY(0)}
                stroke="#829B83"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(dataset.rev[hoverIndex])}
                r="4.5"
                fill="#FFFFFF"
                stroke="#55764D"
                strokeWidth="2.5"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(paid[hoverIndex])}
                r="4.5"
                fill="#FFFFFF"
                stroke="#A8CE45"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Hit area overlays */}
          {dataset.labels.map((_, i) => (
            <rect
              key={`hit-${i}`}
              x={i === 0 ? pl : getX(i) - (getX(1) - getX(0)) / 2}
              y={0}
              width={
                i === 0 || i === n - 1
                  ? (getX(1) - getX(0)) / 2
                  : getX(1) - getX(0)
              }
              height={H}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}
        </svg>

        {/* Hover Tooltip Card */}
        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 rounded-xl border border-border bg-white px-3 py-2 text-xs shadow-xl animate-in fade-in-0 duration-100 min-w-[170px]"
            style={{
              left: Math.min(
                (getX(hoverIndex) / W) * 100,
                78
              ) + "%",
            }}
          >
            <div className="font-semibold text-ink mb-1">
              {dataset.labels[hoverIndex]}
            </div>
            <div className="flex justify-between gap-4 text-muted-foreground">
              <span>Total Revenue:</span>
              <span className="font-medium text-ink">
                {formatINR(dataset.rev[hoverIndex])}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-muted-foreground">
              <span>Payments Recv:</span>
              <span className="font-medium text-forest">
                {formatINR(paid[hoverIndex])}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-muted-foreground">
              <span>Outstanding:</span>
              <span className="font-medium text-[#D9A441]">
                {formatINR(dataset.out[hoverIndex])}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
