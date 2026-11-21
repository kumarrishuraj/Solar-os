"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  FileText,
  Package,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import { solarStore } from "@/lib/api";
import type { Notification } from "@/types";

export function NotificationsCard() {
  const [notifications, setNotifications] = useState<Notification[]>(
    solarStore.getNotifications()
  );

  useEffect(() => {
    return solarStore.subscribe(() => {
      setNotifications(solarStore.getNotifications());
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes("survey")) return ClipboardList;
    if (title.toLowerCase().includes("quotation")) return FileText;
    if (title.toLowerCase().includes("stock")) return Package;
    if (title.toLowerCase().includes("install")) return Wrench;
    return ShieldAlert;
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card min-w-0">
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
            <Bell className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount} requiring operational attention
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 divide-y divide-border/60">
        {notifications.slice(0, 5).map((n) => {
          const Icon = getIcon(n.title);
          const isUrgent = n.priority === "urgent";

          return (
            <Link
              key={n.id}
              href={n.link || "/dashboard"}
              onClick={() => solarStore.markNotificationAsRead(n.id)}
              className="flex items-start gap-3 py-3 first:pt-1 last:pb-1 -mx-2 px-2 rounded-xl hover:bg-[#F7F8F5] transition-colors"
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                  isUrgent
                    ? "bg-[#F6E5E2] text-[#A4483F]"
                    : "bg-sage-soft text-forest"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink truncate">
                    {n.title}
                  </span>
                  {!n.read && (
                    <span className="size-2 rounded-full bg-[#A8CE45] shrink-0" />
                  )}
                </div>
                <p className="text-[11.5px] text-muted-foreground line-clamp-2 mt-0.5">
                  {n.description}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isUrgent
                        ? "bg-[#F6E5E2] text-[#A4483F]"
                        : "bg-sage-soft text-forest"
                    }`}
                  >
                    {isUrgent ? "High priority" : "Operational"}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">
                    Recently
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
