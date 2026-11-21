"use client";

import React, { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { SearchDialog } from "./search-dialog";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("solaros_sidebar_collapsed") === "true";
      } catch {}
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleToggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("solaros_sidebar_collapsed", next ? "true" : "false");
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F1F2EF] text-[#252925] flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${
          collapsed ? "md:ml-[84px]" : "md:ml-[244px]"
        }`}
      >
        <AppHeader
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main className="flex-1 px-4 md:px-7 py-5 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Search Dialog Modal */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
