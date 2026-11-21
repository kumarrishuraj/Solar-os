"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, ArrowRight } from "lucide-react";
import { solarStore } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Installation } from "@/types";

export function InstallationProgressCard() {
  const [installations, setInstallations] = useState<Installation[]>(
    solarStore.getInstallations()
  );

  useEffect(() => {
    return solarStore.subscribe(() => {
      setInstallations(solarStore.getInstallations());
    });
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card min-w-0">
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
            <Wrench className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Installation Progress</h2>
            <p className="text-xs text-muted-foreground">Active and recently completed sites</p>
          </div>
        </div>
        <Link
          href="/installations"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors"
        >
          <span>Open</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {installations.slice(0, 5).map((inst) => (
          <Link
            key={inst.id}
            href={`/installations?id=${inst.id}`}
            className="group block space-y-1.5 -mx-2 p-2 rounded-xl hover:bg-[#F7F8F5] transition-colors"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-ink group-hover:text-forest transition-colors">
                  {inst.customer_name}
                </span>
                <span className="text-muted-foreground">
                  — {inst.system_capacity_kw} kW · {inst.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-ink">
                  {inst.progress_percent}%
                </span>
                <StatusBadge status={inst.status} size="sm" />
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-[#ECEEE9] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${inst.progress_percent}%`,
                  backgroundColor:
                    inst.progress_percent === 100
                      ? "#5B9B64"
                      : inst.status === "delayed"
                      ? "#C96B61"
                      : "#55764D",
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
