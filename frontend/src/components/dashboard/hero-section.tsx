"use client";

import React from "react";
import { LayoutDashboard, Zap, CheckCircle2 } from "lucide-react";
import { IsometricSolarLandscape } from "@/components/illustrations/isometric-solar-landscape";

interface HeroSectionProps {
  activeProjectsCount?: number;
  completedInstallationsCount?: number;
}

export function HeroSection({
  activeProjectsCount = 12,
  completedInstallationsCount = 68,
}: HeroSectionProps) {
  const completionPercentage = 79;
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * completionPercentage) / 100;

  const pipelineStages = [
    { label: "Scheduled", count: 4, max: 5, color: "#829B83" },
    { label: "In progress", count: 5, max: 5, color: "#55764D" },
    { label: "Inspection", count: 2, max: 5, color: "#829B83" },
    { label: "Handover", count: 1, max: 5, color: "#A8CE45" },
  ];

  return (
    <section className="relative overflow-hidden rounded-[22px] bg-[#C5D1C5] p-5 sm:p-7 md:p-8 mb-5 shadow-sm border border-[#b4c3b4]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Heading & Performance Widgets */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/45 text-xs font-medium text-[#3b423a]">
              <LayoutDashboard className="size-3.5" />
              <span>Dashboard</span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl md:text-[32px] font-semibold text-[#252925] tracking-tight uppercase leading-tight">
              Solar Operations Management
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-[#4A5449] max-w-lg">
              Monitor projects, customers, installations and business performance across India.
            </p>
          </div>

          {/* Two Performance Widgets */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl">
            {/* Widget 1: Project Completion Gauge */}
            <div className="rounded-2xl bg-white/80 p-4 border border-white/70 shadow-sm backdrop-blur-sm">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                Project Completion
              </span>
              <div className="mt-2.5 flex items-center gap-3.5">
                <div className="relative size-16 shrink-0 flex items-center justify-center">
                  <svg className="size-16 -rotate-90" viewBox="0 0 76 76">
                    <circle
                      cx="38"
                      cy="38"
                      r={radius}
                      fill="none"
                      stroke="#E3E8E0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="38"
                      cy="38"
                      r={radius}
                      fill="none"
                      stroke="#55764D"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-ink">
                    {completionPercentage}%
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">
                    68 of 86
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug">
                    projects past design approval
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Installation Pipeline */}
            <div className="rounded-2xl bg-white/80 p-4 border border-white/70 shadow-sm backdrop-blur-sm">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                Installation Pipeline
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-ink">
                  {activeProjectsCount}
                </span>
                <span className="text-xs text-muted-foreground">active projects</span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {pipelineStages.map((stg) => (
                  <div
                    key={stg.label}
                    className="grid grid-cols-[75px_1fr_16px] items-center gap-2 text-[11px] text-[#5A6259]"
                  >
                    <span className="truncate">{stg.label}</span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E9E2]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(stg.count / stg.max) * 100}%`,
                          backgroundColor: stg.color,
                        }}
                      />
                    </div>
                    <span className="text-right font-medium">{stg.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Isometric 3D Illustration & KPI Floating Badges */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[280px]">
          <IsometricSolarLandscape className="w-full h-auto max-h-[320px] object-contain drop-shadow-sm" />

          {/* KPI Indicators below illustration */}
          <div className="flex flex-wrap gap-3 mt-2 sm:mt-0 sm:absolute sm:bottom-0 sm:right-0">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-lg border border-border/80">
              <div className="flex size-9 items-center justify-center rounded-xl bg-sage-soft text-forest">
                <Zap className="size-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">
                  Active Projects
                </div>
                <div className="text-lg font-bold text-ink leading-tight">
                  {activeProjectsCount}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-lg border border-border/80">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#EEF5DA] text-[#5A7613]">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">
                  Completed Installations
                </div>
                <div className="text-lg font-bold text-ink leading-tight">
                  {completedInstallationsCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
