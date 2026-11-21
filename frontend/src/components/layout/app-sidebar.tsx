"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Scan,
  ClipboardList,
  Sun,
  FileText,
  Wallet,
  Package,
  Cpu,
  Wrench,
  Activity,
  ShieldAlert,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import { SolarLogo } from "./solar-logo";
import { solarStore } from "@/lib/api";
import type { User } from "@/types";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "CUSTOMER MANAGEMENT",
    items: [
      { id: "leads", label: "Leads", href: "/leads", icon: UserPlus },
      { id: "customers", label: "Customers", href: "/customers", icon: Users },
    ],
  },
  {
    title: "SOLAR ASSESSMENT",
    items: [
      { id: "assessment", label: "AI Assessment", href: "/assessment", icon: Scan },
      { id: "surveys", label: "Site Surveys", href: "/surveys", icon: ClipboardList },
      { id: "recommendations", label: "Solar Recommendations", href: "/recommendations", icon: Sun },
    ],
  },
  {
    title: "SALES",
    items: [
      { id: "quotations", label: "Quotations", href: "/quotations", icon: FileText },
      { id: "payments", label: "Payments", href: "/payments", icon: Wallet },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { id: "inventory", label: "Inventory", href: "/inventory", icon: Package },
      { id: "equipment", label: "Equipment", href: "/equipment", icon: Cpu },
      { id: "installations", label: "Installations", href: "/installations", icon: Wrench },
    ],
  },
  {
    title: "AFTER SALES",
    items: [
      { id: "monitoring", label: "Monitoring", href: "/monitoring", icon: Activity },
      { id: "service", label: "Service & Warranty", href: "/service", icon: ShieldAlert },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { id: "assistant", label: "AI Assistant", href: "/assistant", icon: Sparkles },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User>(solarStore.getCurrentUser());

  useEffect(() => {
    return solarStore.subscribe(() => {
      setCurrentUser(solarStore.getCurrentUser());
    });
  }, []);

  const handleLogout = () => {
    router.push("/login");
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
    <>
      {/* Mobile Backdrop Scrim */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#292C29] text-[#B9BFB7] transition-all duration-200 ease-in-out border-r border-white/5 ${
          collapsed ? "w-[84px]" : "w-[244px]"
        } ${
          mobileOpen
            ? "translate-x-0 w-[244px] shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Branding */}
        <div className="flex h-[68px] items-center gap-3 px-5 shrink-0 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <SolarLogo size={38} />
            {(!collapsed || mobileOpen) && (
              <span className="text-[17px] font-semibold text-white tracking-tight">
                Solar<b className="text-[#A8CE45] font-semibold">OS</b>
              </span>
            )}
          </Link>
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="ml-auto rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-none space-y-4">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={group.title}>
              {(!collapsed || mobileOpen) && (
                <div className="px-3 pb-1.5 text-[10.5px] font-semibold tracking-wider text-white/40 uppercase">
                  {group.title}
                </div>
              )}
              {collapsed && !mobileOpen && gIdx > 0 && (
                <div className="my-2 mx-2 h-px bg-white/10" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        if (mobileOpen) onMobileClose();
                      }}
                      title={collapsed && !mobileOpen ? item.label : undefined}
                      className={`relative flex items-center gap-3 h-10 px-3.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                        isActive
                          ? "bg-[#3B423A] text-white"
                          : "text-[#B9BFB7] hover:bg-[#3B423A]/60 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#A8CE45]" />
                      )}
                      <Icon className={`size-[18px] shrink-0 ${isActive ? "text-[#A8CE45]" : "text-current"}`} />
                      {(!collapsed || mobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="p-3 border-t border-white/5 space-y-1 shrink-0 bg-[#242724]">
          {/* Settings */}
          <Link
            href="/settings"
            onClick={() => {
              if (mobileOpen) onMobileClose();
            }}
            title={collapsed && !mobileOpen ? "Settings" : undefined}
            className={`flex items-center gap-3 h-9 px-3.5 rounded-xl text-[13px] font-medium transition-colors ${
              pathname === "/settings"
                ? "bg-[#3B423A] text-white"
                : "text-[#B9BFB7] hover:bg-[#3B423A]/60 hover:text-white"
            }`}
          >
            <Settings className="size-4 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Settings</span>}
          </Link>

          {/* Desktop Toggle Collapse */}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex w-full items-center gap-3 h-9 px-3.5 rounded-xl text-[13px] font-medium text-[#B9BFB7] hover:bg-[#3B423A]/60 hover:text-white transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="size-4 shrink-0" />
            ) : (
              <ChevronLeft className="size-4 shrink-0" />
            )}
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* User Profile Tile */}
          <div
            title={`${currentUser.full_name} · ${currentUser.role}`}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 mt-2"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#3B423A] text-xs font-semibold text-[#A8CE45]">
              {getInitials(currentUser.full_name)}
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-white">
                  {currentUser.full_name}
                </div>
                <div className="truncate text-[11px] text-white/50 capitalize">
                  {currentUser.role.replace("_", " ")}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed && !mobileOpen ? "Sign out" : undefined}
            className="flex w-full items-center gap-3 h-8 px-3.5 rounded-xl text-xs font-medium text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="size-3.5 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
