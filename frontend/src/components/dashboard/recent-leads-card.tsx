"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";
import { solarStore } from "@/lib/api";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Lead } from "@/types";

export function RecentLeadsCard() {
  const [leads, setLeads] = useState<Lead[]>(solarStore.getLeads());

  useEffect(() => {
    return solarStore.subscribe(() => {
      setLeads(solarStore.getLeads());
    });
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card min-w-0">
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
            <UserPlus className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Recent Leads</h2>
            <p className="text-xs text-muted-foreground">Latest enquiries across all channels</p>
          </div>
        </div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">City</th>
              <th className="py-2.5 px-3">Est. Capacity</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {leads.slice(0, 6).map((lead) => (
              <tr
                key={lead.id}
                className="group hover:bg-[#F7F8F5] transition-colors cursor-pointer"
              >
                <td className="py-2.5 px-3">
                  <Link
                    href={`/leads?id=${lead.id}`}
                    className="flex items-center gap-2.5"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sage-soft text-[11px] font-bold text-forest">
                      {getInitials(lead.full_name)}
                    </div>
                    <div>
                      <div className="font-semibold text-ink group-hover:text-forest transition-colors">
                        {lead.full_name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {lead.source || "Website enquiry"}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="py-2.5 px-3 text-muted-foreground">{lead.city}</td>
                <td className="py-2.5 px-3 font-semibold font-mono text-ink">
                  {lead.estimated_system_kw} kW
                </td>
                <td className="py-2.5 px-3">
                  <StatusBadge status={lead.status} size="sm" />
                </td>
                <td className="py-2.5 px-3 text-right text-muted-foreground whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
