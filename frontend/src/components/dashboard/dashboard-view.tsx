"use client";

import React from "react";
import { HeroSection } from "./hero-section";
import { BusinessOverviewCard } from "./business-overview-card";
import { OperationalMetricsCard } from "./operational-metrics-card";
import { RevenueAnalyticsCard } from "./revenue-analytics-card";
import { NotificationsCard } from "./notifications-card";
import { ProjectPipelineCard } from "./project-pipeline-card";
import { RecentLeadsCard } from "./recent-leads-card";
import { InstallationProgressCard } from "./installation-progress-card";
import { BusinessActivityCard } from "./business-activity-card";

export function DashboardView() {
  return (
    <div className="space-y-5 pb-8">
      {/* 1. Sage-Green Hero Section */}
      <HeroSection activeProjectsCount={12} completedInstallationsCount={68} />

      {/* 2. Main Dashboard Cards Grid (12-column responsive layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Row 1: Business Overview (8) + Operational Metrics (4) */}
        <div className="lg:col-span-8">
          <BusinessOverviewCard />
        </div>
        <div className="lg:col-span-4">
          <OperationalMetricsCard />
        </div>

        {/* Row 2: Revenue Analytics (8) + Notifications (4) */}
        <div className="lg:col-span-8">
          <RevenueAnalyticsCard />
        </div>
        <div className="lg:col-span-4">
          <NotificationsCard />
        </div>

        {/* Row 3: Project Pipeline (4) + Recent Leads (8) */}
        <div className="lg:col-span-4">
          <ProjectPipelineCard />
        </div>
        <div className="lg:col-span-8">
          <RecentLeadsCard />
        </div>

        {/* Row 4: Installation Progress (6) + Business Activity (6) */}
        <div className="lg:col-span-6">
          <InstallationProgressCard />
        </div>
        <div className="lg:col-span-6">
          <BusinessActivityCard />
        </div>
      </div>
    </div>
  );
}
