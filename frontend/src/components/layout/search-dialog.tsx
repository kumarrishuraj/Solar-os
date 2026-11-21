"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  UserPlus,
  Users,
  FileText,
  Wrench,
  Package,
  ArrowRight,
  X,
} from "lucide-react";
import { solarStore } from "@/lib/api";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const leads = solarStore.getLeads().filter((l) =>
    (l.full_name + " " + l.city + " " + l.phone).toLowerCase().includes(q)
  ).slice(0, 4);

  const quotes = solarStore.getQuotations().filter((qo) =>
    (qo.quotation_number + " " + qo.lead_name).toLowerCase().includes(q)
  ).slice(0, 3);

  const installations = solarStore.getInstallations().filter((i) =>
    (i.customer_name + " " + i.city).toLowerCase().includes(q)
  ).slice(0, 3);

  const inventory = solarStore.getInventory().filter((item) =>
    (item.sku + " " + item.model_name + " " + item.manufacturer).toLowerCase().includes(q)
  ).slice(0, 3);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border bg-white shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search customers, projects, leads, quotations, inventory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-subtle hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!q && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Type to search across leads, quotes, installations, and warehouse inventory...
            </div>
          )}

          {q && (
            <>
              {leads.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Leads & Customers
                  </div>
                  {leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleSelect(`/leads?id=${lead.id}`)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-[#F7F8F5] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-sage-soft text-forest">
                          <UserPlus className="size-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {lead.full_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lead.city} · {lead.estimated_system_kw} kW · {lead.status}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {quotes.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Quotations
                  </div>
                  {quotes.map((qItem) => (
                    <button
                      key={qItem.id}
                      onClick={() => handleSelect(`/quotations?id=${qItem.id}`)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-[#F7F8F5] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-sage-soft text-forest">
                          <FileText className="size-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {qItem.quotation_number} — {qItem.lead_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ₹{qItem.total_cost.toLocaleString("en-IN")} · {qItem.status}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {installations.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Installations
                  </div>
                  {installations.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => handleSelect(`/installations?id=${inst.id}`)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-[#F7F8F5] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-sage-soft text-forest">
                          <Wrench className="size-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {inst.customer_name} ({inst.system_capacity_kw} kW)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inst.city} · {inst.progress_percent}% · {inst.status}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {inventory.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Warehouse Inventory
                  </div>
                  {inventory.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => handleSelect(`/inventory?sku=${inv.sku}`)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-[#F7F8F5] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-sage-soft text-forest">
                          <Package className="size-3.5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {inv.manufacturer} {inv.model_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inv.sku} · {inv.available_quantity} available · {inv.warehouse}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {leads.length === 0 && quotes.length === 0 && installations.length === 0 && inventory.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No records found matching &ldquo;{query}&rdquo;
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-[#F7F8F5] px-4 py-2 text-xs text-muted-foreground">
          <span>Navigate with click or arrow keys</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
