"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Plus,
  Home,
  Check,
  CheckCheck,
  Shield,
  User as UserIcon,
  LogOut,
  Settings,
} from "lucide-react";
import { solarStore } from "@/lib/api";
import type { Notification, User, UserRole } from "@/types";

const ROLE_OPTIONS: { role: UserRole; name: string; title: string }[] = [
  { role: "admin", name: "Rajesh Khanna", title: "Director" },
  { role: "sales_rep", name: "Priya Sharma", title: "Sales Executive" },
  { role: "warehouse", name: "Arjun Mehta", title: "Warehouse Operator" },
  { role: "technician", name: "Suresh Kumar", title: "Lead Technician" },
];

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/customers": "Customers",
  "/assessment": "AI Assessment",
  "/surveys": "Site Surveys",
  "/recommendations": "Solar Recommendations",
  "/quotations": "Quotations",
  "/payments": "Payments",
  "/inventory": "Inventory",
  "/equipment": "Equipment",
  "/installations": "Installations",
  "/monitoring": "Monitoring",
  "/service": "Service & Warranty",
  "/assistant": "AI Assistant",
  "/settings": "Settings",
  "/enquiry": "Customer Enquiry",
};

interface AppHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
}

export function AppHeader({ onOpenMobileSidebar, onOpenSearch }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User>(solarStore.getCurrentUser());
  const [notifications, setNotifications] = useState<Notification[]>(solarStore.getNotifications());
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return solarStore.subscribe(() => {
      setCurrentUser(solarStore.getCurrentUser());
      setNotifications(solarStore.getNotifications());
    });
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentTitle = ROUTE_LABELS[pathname] || "SolarOS";

  const handleRoleSelect = (role: UserRole) => {
    solarStore.setCurrentRole(role);
    setProfileOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 px-4 md:px-7 bg-[#F1F2EF]/90 backdrop-blur-md border-b border-border">
      {/* Mobile Menu Button */}
      <button
        onClick={onOpenMobileSidebar}
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-white text-ink shadow-sm md:hidden hover:bg-[#F7F8F5]"
        aria-label="Toggle navigation menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
        <Home className="size-4 shrink-0 text-muted-foreground" />
        <span className="hidden sm:inline text-muted-foreground">SolarOS /</span>
        <b className="font-semibold text-ink">{currentTitle}</b>
      </div>

      {/* Global Search Bar (Trigger) */}
      <div className="relative ml-auto flex-1 max-w-[420px]">
        <button
          onClick={onOpenSearch}
          className="flex w-full items-center justify-between h-9 px-3.5 rounded-xl border border-border bg-white text-xs md:text-sm text-muted-foreground shadow-sm hover:border-forest/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" />
            <span className="truncate">Search customers, leads, quotes...</span>
          </div>
          <kbd className="hidden sm:inline-block rounded-md border border-border bg-[#F7F8F5] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Demo Data Badge */}
      <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-soft text-[11px] font-medium text-forest border border-forest/15">
        <span className="size-1.5 rounded-full bg-[#A8CE45] animate-pulse" />
        Demo data
      </span>

      {/* New Customer Enquiry CTA */}
      <Link
        href="/enquiry"
        className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-white text-xs md:text-sm font-medium text-ink shadow-sm hover:bg-[#F7F8F5] transition-colors"
      >
        <Plus className="size-4 text-forest" />
        <span>New enquiry</span>
      </Link>

      {/* Notifications Popover */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-white text-ink shadow-sm hover:bg-[#F7F8F5] transition-colors"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[9.5px] font-bold text-white border-2 border-[#F1F2EF]">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-white p-3 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 px-1 border-b border-border">
              <span className="text-sm font-semibold text-ink">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => solarStore.markAllNotificationsAsRead()}
                  className="text-xs font-medium text-forest hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto divide-y divide-border/60 py-1">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      solarStore.markNotificationAsRead(n.id);
                      if (n.link) {
                        setNotifOpen(false);
                        router.push(n.link);
                      }
                    }}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${
                      n.read ? "opacity-75 hover:bg-[#F7F8F5]" : "bg-sage-soft/40 hover:bg-sage-soft/70"
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                        n.priority === "urgent"
                          ? "bg-danger-soft text-danger"
                          : "bg-sage-soft text-forest"
                      }`}
                    >
                      <Bell className="size-3.5" />
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar & Demo Role Switcher */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          aria-label="Profile menu"
          className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-xs font-semibold text-forest border border-forest/20 shadow-sm hover:scale-105 transition-transform"
        >
          {getInitials(currentUser.full_name)}
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-border bg-white p-3 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Current Identity */}
            <div className="border-b border-border pb-2.5 px-2">
              <div className="text-sm font-semibold text-ink">
                {currentUser.full_name}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {currentUser.role.replace("_", " ")} · {currentUser.email}
              </div>
            </div>

            {/* Role Switcher (Hackathon Demo feature) */}
            <div className="pt-2">
              <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Switch Role (Demo)
              </div>
              <div className="space-y-0.5">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => handleRoleSelect(opt.role)}
                    className={`flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-xs transition-colors ${
                      currentUser.role === opt.role
                        ? "bg-sage-soft font-medium text-forest"
                        : "text-foreground hover:bg-[#F7F8F5]"
                    }`}
                  >
                    <span>{opt.title} ({opt.name.split(" ")[0]})</span>
                    {currentUser.role === opt.role && (
                      <Check className="size-3.5 text-forest" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile & Sign out links */}
            <div className="mt-2 border-t border-border pt-1.5 space-y-0.5">
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-foreground hover:bg-[#F7F8F5]"
              >
                <Settings className="size-3.5 text-muted-foreground" />
                <span>Profile & Settings</span>
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/login");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-danger hover:bg-danger-soft"
              >
                <LogOut className="size-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
