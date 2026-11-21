"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  UserPlus,
  Sun,
  ClipboardList,
  Wallet,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { solarStore } from "@/lib/api";
import type { ActivityEvent } from "@/types";

function formatTimestamp(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Recent";
  }
}

export function BusinessActivityCard() {
  const [activities, setActivities] = useState<ActivityEvent[]>(
    solarStore.getActivities()
  );

  useEffect(() => {
    return solarStore.subscribe(() => {
      setActivities(solarStore.getActivities());
    });
  }, []);

  const getIcon = (type: string) => {
    if (type.includes("lead")) return UserPlus;
    if (type.includes("survey")) return ClipboardList;
    if (type.includes("recommendation")) return Sun;
    if (type.includes("quotation")) return FileText;
    if (type.includes("payment")) return Wallet;
    return CheckCircle2;
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card min-w-0">
      <div className="flex items-center gap-3 pb-4 border-b border-border/60">
        <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
          <Activity className="size-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">Business Activity</h2>
          <p className="text-xs text-muted-foreground">What happened across SolarOS</p>
        </div>
      </div>

      <div className="relative mt-4 space-y-4">
        {activities.slice(0, 6).map((act, idx) => {
          const Icon = getIcon(act.icon_type);
          const isLast = idx === Math.min(activities.length, 6) - 1;

          return (
            <div key={act.id} className="relative flex items-start gap-3">
              {/* Vertical connector line */}
              {!isLast && (
                <span
                  className="absolute left-4 top-8 bottom-0 w-px bg-border"
                  aria-hidden="true"
                />
              )}

              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-sage-soft text-forest">
                <Icon className="size-3.5" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-xs font-semibold text-ink">
                  {act.event}
                </div>
                <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">
                  {act.description}
                </p>
                <div className="text-[10.5px] text-muted-foreground/80 mt-1">
                  {formatTimestamp(act.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
