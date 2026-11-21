m"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SolarLogo } from "@/components/layout/solar-logo";
import { IsometricSolarLandscape } from "@/components/illustrations/isometric-solar-landscape";
import { solarStore } from "@/lib/api";
import { toast } from "sonner";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("rajesh@solaros.in");
  const [password, setPassword] = useState("demo1234");

  const demoAccounts: { role: UserRole; name: string; title: string; email: string }[] = [
    { role: "admin", name: "Rajesh Khanna", title: "Director", email: "rajesh@solaros.in" },
    { role: "sales_rep", name: "Priya Sharma", title: "Sales Executive", email: "priya@solaros.in" },
    { role: "warehouse", name: "Arjun Mehta", title: "Warehouse Operator", email: "arjun@solaros.in" },
    { role: "technician", name: "Suresh Kumar", title: "Lead Technician", email: "suresh@solaros.in" },
  ];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    solarStore.setCurrentRole("admin");
    toast.success("Signed in as Rajesh Khanna (Director)");
    router.push("/dashboard");
  };

  const handleQuickSignIn = (account: typeof demoAccounts[0]) => {
    solarStore.setCurrentRole(account.role);
    toast.success(`Signed in as ${account.name} (${account.title})`);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 font-sans bg-[#F1F2EF]">
      {/* Left Column: Brand Hero Banner with Isometric Illustration */}
      <div className="lg:col-span-7 bg-[#C5D1C5] p-8 sm:p-12 md:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#b4c3b4]">
        <div className="flex items-center gap-3">
          <SolarLogo size={40} />
          <span className="text-xl font-bold tracking-tight text-ink">
            Solar<b className="text-forest">OS</b>
          </span>
        </div>

        <div className="my-8 max-w-xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-ink tracking-tight leading-tight uppercase">
            Run your entire solar business — from rooftop to revenue.
          </h1>
          <p className="text-base text-[#4A5449] max-w-md">
            The complete connected platform for site surveyors, solar engineers, sales executives, warehouse operators and installation technicians.
          </p>

          <div className="pt-4 flex justify-center lg:justify-start">
            <IsometricSolarLandscape className="w-full max-h-[300px] object-contain drop-shadow-sm" />
          </div>
        </div>

        <div className="text-xs text-[#4A5449] font-medium">
          AI rooftop computer vision · engineering sizing · GST bill of materials · IoT monitoring
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-ink tracking-tight">Sign in</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Welcome back to SolarOS Operations Management.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-ink block mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="font-semibold text-ink block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm mt-1"
            >
              Sign In to Platform
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="pt-4 border-t border-border space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Quick Sign In (Demo Roles)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickSignIn(acc)}
                  className="flex flex-col text-left p-2 rounded-xl border border-border bg-[#F7F8F5] hover:bg-sage-soft/60 hover:border-forest/30 transition-all"
                >
                  <span className="font-semibold text-xs text-ink">{acc.name}</span>
                  <span className="text-[10px] text-muted-foreground">{acc.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
