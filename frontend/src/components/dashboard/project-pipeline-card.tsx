"use client";

import React from "react";
import Link from "next/link";
import { Sun } from "lucide-react";

interface PipelineStage {
  label: string;
  count: number;
  color: string;
  href: string;
}

export function ProjectPipelineCard() {
  const stages: PipelineStage[] = [
    { label: "New leads", count: 24, color: "#A8CE45", href: "/leads" },
    { label: "Qualified", count: 18, color: "#93BC55", href: "/leads" },
    { label: "Survey", count: 12, color: "#7EA75C", href: "/surveys" },
    { label: "Design approval", count: 8, color: "#6B925E", href: "/recommendations" },
    { label: "Quotation", count: 10, color: "#5E8456", href: "/quotations" },
    { label: "Installation", count: 8, color: "#55764D", href: "/installations" },
    { label: "Completed", count: 6, color: "#3B423A", href: "/installations" },
  ];

  const maxVal = Math.max(...stages.map((s) => s.count));

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card min-w-0">
      <div className="flex items-center gap-3 pb-4 border-b border-border/60">
        <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
          <Sun className="size-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">Project Pipeline</h2>
          <p className="text-xs text-muted-foreground">86 projects across 7 lifecycle stages</p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {stages.map((stg) => (
          <Link
            key={stg.label}
            href={stg.href}
            className="group grid grid-cols-[110px_1fr_30px] items-center gap-3 text-xs -mx-2 px-2 py-1.5 rounded-xl hover:bg-[#F7F8F5] transition-colors"
          >
            <span className="font-medium text-ink truncate group-hover:text-forest transition-colors">
              {stg.label}
            </span>
            <div className="h-2 w-full rounded-full bg-[#ECEEE9] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(stg.count / maxVal) * 100}%`,
                  backgroundColor: stg.color,
                }}
              />
            </div>
            <span className="text-right font-semibold font-mono text-ink">
              {stg.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
