"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Sparkles,
  Send,
  Bot,
  ShieldAlert,
  Zap,
  Plus,
} from "lucide-react";
import { solarStore } from "@/lib/api";
import type { User } from "@/types";

interface StructuredAnswer {
  title: string;
  funcName: string;
  source: string;
  refused?: boolean;
  message?: string;
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
  metrics?: { label: string; value: string; context: string }[];
}

interface Message {
  id: string;
  who: "user" | "bot";
  text?: string;
  structured?: StructuredAnswer;
  isTyping?: boolean;
}

const SUGGESTIONS = [
  "Which projects are delayed?",
  "What stock needs replenishment?",
  "Which quotations are pending?",
  "What is our monthly revenue?",
  "Which service tickets need attention?",
  "Which installations are scheduled this week?",
];

let msgCounter = 100;

export default function AssistantPage() {
  const [currentUser, setCurrentUser] = useState<User>(solarStore.getCurrentUser());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      who: "bot",
      text: "Hello! I am SolarOS Intelligence. I query authorized operations, inventory, installation pipelines, and revenue data across our platform. How can I assist you today?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return solarStore.subscribe(() => {
      setCurrentUser(solarStore.getCurrentUser());
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    const userMsg: Message = {
      id: `u-${++msgCounter}`,
      who: "user",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const answer = generateAnswer(q, currentUser.role);
      const botMsg: Message = {
        id: `b-${++msgCounter}`,
        who: "bot",
        structured: answer,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  const generateAnswer = (q: string, role: string): StructuredAnswer => {
    const lower = q.toLowerCase();

    // 1. Delayed Projects
    if (lower.includes("delay") || lower.includes("late") || lower.includes("behind")) {
      return {
        title: "1 installation is currently behind schedule and 1 requires inspection coordination.",
        funcName: "get_delayed_projects",
        source: "Installations DB, DISCOM Status",
        table: {
          headers: ["Project", "Customer", "Scheduled Date", "Status", "Operational Reason"],
          rows: [
            ["INS-196", "Manoj Tiwari (4 kW)", "12 Nov 2026", "Delayed", "Net-meter sync pending with DISCOM"],
            ["INS-199", "Meena Iyer (3 kW)", "16 Nov 2026", "In Inspection", "Awaiting DISCOM inspection slot"],
          ],
        },
      };
    }

    // 2. Stock replenishment
    if (lower.includes("stock") || lower.includes("replenish") || lower.includes("inventory") || lower.includes("reorder")) {
      return {
        title: "3 products are currently at or below their reorder threshold in Pune warehouse.",
        funcName: "get_stock_to_replenish",
        source: "Warehouse Inventory Catalog",
        table: {
          headers: ["SKU", "Product", "Available", "Reorder Level", "Recommended Batch"],
          rows: [
            ["SP-HEL-545", "Helios Pro 545 W Mono PERC", "1 unit", "20 units", "40 units"],
            ["INV-VW-5H", "SolarWave 5 kW Hybrid Inverter", "2 units", "5 units", "8 units"],
            ["INV-VW-36", "SolarWave 3.6 kW 1φ On-grid", "0 units", "5 units", "10 units"],
          ],
        },
      };
    }

    // 3. Pending Quotations
    if (lower.includes("quotation") || lower.includes("quote") || lower.includes("proposal")) {
      return {
        title: "3 quotations worth ₹20.84 lakh are currently awaiting customer decisions.",
        funcName: "get_pending_quotations",
        source: "Quotations Registry",
        table: {
          headers: ["Quotation ID", "Customer", "Contract Value", "Status", "Follow-up"],
          rows: [
            ["Q-2026-042", "Deepika Reddy (8.72 kW)", "₹5,91,580", "Sent to Client", "5 days since sent"],
            ["Q-2026-040", "Pooja Bansal (12 kW)", "₹8,74,200", "Sent to Client", "Follow-up scheduled"],
            ["Q-2026-039", "Vikas Patel (15.26 kW)", "₹10,96,500", "Sent to Client", "Channel partner deal"],
          ],
        },
      };
    }

    // 4. Monthly Revenue (Role-guarded)
    if (lower.includes("revenue") || lower.includes("monthly") || lower.includes("financial") || lower.includes("collection")) {
      if (role === "warehouse" || role === "technician") {
        return {
          title: "Access Restricted",
          funcName: "get_monthly_revenue",
          source: "Financial Ledger",
          refused: true,
          message: `Your active role (${role.replace("_", " ")}) does not have permission to view company financial and revenue data. Please contact a Director.`,
        };
      }

      return {
        title: "November revenue stands at ₹3.20 lakh, up 64.1% over October.",
        funcName: "get_monthly_revenue",
        source: "Financial Ledger, Payment Gateways",
        metrics: [
          { label: "November Revenue", value: "₹3.20 L", context: "+64.1% vs Oct" },
          { label: "Payments Received", value: "₹2.20 L", context: "this month" },
          { label: "Outstanding Invoices", value: "₹2.10 L", context: "3 invoices pending" },
          { label: "FY 2026 to Date", value: "₹12.45 L", context: "Jun – Nov 2026" },
        ],
      };
    }

    // 5. Service tickets
    if (lower.includes("ticket") || lower.includes("service") || lower.includes("warranty") || lower.includes("attention")) {
      return {
        title: "3 service tickets need attention, including 1 high-priority DC overvoltage fault.",
        funcName: "get_service_attention",
        source: "Service & Maintenance System",
        table: {
          headers: ["Ticket ID", "Customer", "Inverter / Serial", "Fault Description", "Priority"],
          rows: [
            ["SVC-2026-089", "Meena Iyer", "INV-VW-2026-00041", "Error E-023: DC overvoltage at peak hours", "High Priority"],
            ["SVC-2026-088", "Aman Singh", "SP-HEL-2026-00211", "6-month preventive maintenance; slight drop", "Medium"],
            ["SVC-2026-087", "Ravi Shankar", "BAT-TV-2026-00019", "Battery backup duration less than expected", "Medium"],
          ],
        },
      };
    }

    // 6. Installations this week
    if (lower.includes("install") || lower.includes("week") || lower.includes("scheduled")) {
      return {
        title: "2 turnkey solar installations are scheduled for field execution this week.",
        funcName: "get_installations_this_week",
        source: "Operations Dispatch",
        table: {
          headers: ["Project ID", "Customer", "System Size", "Date", "Assigned Lead"],
          rows: [
            ["INS-201", "Rahul Sharma", "3 kW on-grid", "22 Nov 2026", "Suresh Kumar (Technician)"],
            ["INS-204", "Kavita Deshmukh", "4 kW on-grid", "23 Nov 2026", "Ramesh Yadav (Technician)"],
          ],
        },
      };
    }

    // Default fallback
    return {
      title: "I can query operational and business intelligence across SolarOS.",
      funcName: "assistant_help",
      source: "Platform Directory",
      message: "Try asking about delayed installations, low stock items, pending customer quotations, monthly revenue figures, or active warranty tickets.",
    };
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>SolarOS Intelligence</span>
              <span className="flex size-6 items-center justify-center rounded-lg bg-[#EEF5DA] text-[#5A7613]">
                <Sparkles className="size-3.5" />
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Natural language operational intelligence querying authorized backend functions with role-based data governance.
            </p>
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  id: "intro",
                  who: "bot",
                  text: "Chat cleared. What operational report would you like to inspect?",
                },
              ])
            }
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors"
          >
            <Plus className="size-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat Window */}
        <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden flex flex-col min-h-[580px]">
          {/* Scrollable Message List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.who === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.who === "bot" && (
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-forest mt-0.5">
                    <Bot className="size-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.who === "user"
                      ? "bg-forest text-white px-4 py-2.5 rounded-tr-sm"
                      : "bg-[#FAFBF8] border border-border p-4 rounded-tl-sm space-y-3"
                  }`}
                >
                  {msg.text && <p>{msg.text}</p>}

                  {/* Structured Answer Card */}
                  {msg.structured && (
                    <div className="space-y-3">
                      {/* Function Badge & Attributed Source */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10.5px] font-mono font-semibold ${
                            msg.structured.refused
                              ? "bg-danger-soft text-danger"
                              : "bg-sage-soft text-forest"
                          }`}
                        >
                          {msg.structured.refused ? (
                            <ShieldAlert className="size-3" />
                          ) : (
                            <Zap className="size-3" />
                          )}
                          <span>
                            {msg.structured.funcName}() ·{" "}
                            {msg.structured.refused ? "Access Refused" : "Read-only"}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Source: {msg.structured.source}
                        </span>
                      </div>

                      <div className="font-semibold text-ink text-xs sm:text-sm">
                        {msg.structured.title}
                      </div>

                      {msg.structured.message && (
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {msg.structured.message}
                        </p>
                      )}

                      {/* Structured Table */}
                      {msg.structured.table && (
                        <div className="border border-border rounded-xl overflow-hidden mt-2 bg-white">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-[#F7F8F5] border-b border-border text-[10.5px] font-semibold text-muted-foreground uppercase">
                                {msg.structured.table.headers.map((h) => (
                                  <th key={h} className="py-2 px-3">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              {msg.structured.table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-[#FAFBF8]">
                                  {row.map((val, cIdx) => (
                                    <td key={cIdx} className="py-2 px-3">
                                      {val}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Metric Stat Tiles */}
                      {msg.structured.metrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                          {msg.structured.metrics.map((m) => (
                            <div
                              key={m.label}
                              className="p-3 rounded-xl bg-white border border-border"
                            >
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                                {m.label}
                              </span>
                              <div className="text-lg font-bold text-ink mt-0.5">
                                {m.value}
                              </div>
                              <span className="text-[10.5px] text-forest font-medium">
                                {m.context}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-xs text-muted-foreground">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-forest">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-sage-soft">
                  <span className="size-1.5 rounded-full bg-forest animate-bounce" />
                  <span className="size-1.5 rounded-full bg-forest animate-bounce delay-100" />
                  <span className="size-1.5 rounded-full bg-forest animate-bounce delay-200" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="px-5 py-2.5 border-t border-border bg-[#FAFBF8] flex flex-wrap gap-2">
            {SUGGESTIONS.map((sugg) => (
              <button
                key={sugg}
                onClick={() => handleSend(sugg)}
                className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-forest hover:bg-sage-soft transition-colors shadow-2xs"
              >
                {sugg}
              </button>
            ))}
          </div>

          {/* Query Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            className="flex items-center gap-2 p-3 border-t border-border bg-white"
          >
            <input
              type="text"
              placeholder={`Ask SolarOS Intelligence as ${currentUser.full_name}...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-[#F7F8F5] text-xs sm:text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:border-forest/50"
            />
            <button
              type="submit"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-forest text-white hover:bg-forest/90 transition-colors shadow-sm"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
