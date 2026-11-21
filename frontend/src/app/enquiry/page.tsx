"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  Bot,
  FileText,
  Send,
  Upload,
  CheckCircle2,
  ArrowLeft,
  X,
  Sparkles,
  Home,
  Check,
} from "lucide-react";
import { SolarLogo } from "@/components/layout/solar-logo";
import { IsometricSolarLandscape } from "@/components/illustrations/isometric-solar-landscape";
import { solarStore } from "@/lib/api";

type Mode = "select" | "ai" | "form" | "summary" | "confirmed";

interface SlotData {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  bill?: number;
  roofType?: string;
  dimensions?: string;
  systemType?: string;
  photosCount?: number;
}

interface ChatMessage {
  who: "bot" | "user";
  text?: string;
  chips?: string[];
  isSummary?: boolean;
}

let enquiryCounter = 4180;

export default function EnquiryPage() {
  const [mode, setMode] = useState<Mode>("select");
  const [slots, setSlots] = useState<SlotData>({
    roofType: "RCC flat terrace",
    systemType: "On-grid",
  });
  const [inputVal, setInputVal] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [confirmationId, setConfirmationId] = useState("");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      who: "bot",
      text: "Hello! I'm the SolarOS AI Advisor. I will help determine the right solar system capacity, subsidy savings, and rooftop setup for your property. May I have your full name?",
    },
  ]);

  // Sizing estimation logic
  const calculateEstimate = () => {
    const bill = slots.bill || 4500;
    const tariff = 7.5;
    const monthlyKwh = bill / tariff;
    const systemKw = Math.max(
      1,
      Math.round(((monthlyKwh * 12) / (365 * 5.1 * 0.82)) * 2) / 2
    );
    const panelCount = Math.ceil((systemKw * 1000) / 545);
    const annualGenKwh = Math.round(panelCount * 0.545 * 5.1 * 365 * 0.82);
    const annualSavings = Math.round(Math.min(annualGenKwh, monthlyKwh * 12) * tariff);
    const subsidy = systemKw >= 3 ? 78000 : systemKw >= 2 ? 60000 : 30000;

    return {
      systemKw,
      panelCount,
      annualGenKwh,
      annualSavings,
      subsidy,
    };
  };

  const estimate = calculateEstimate();

  // AI Chat Progression
  const handleUserResponse = (text: string) => {
    if (!text.trim()) return;

    const newMsgs: ChatMessage[] = [...chatMessages, { who: "user", text }];
    const currentSlots = { ...slots };

    // Slot filling heuristics
    if (!currentSlots.name) {
      currentSlots.name = text.trim();
      setSlots(currentSlots);
      newMsgs.push({
        who: "bot",
        text: `Glad to meet you, ${currentSlots.name}! What 10-digit mobile number should our solar team contact you at?`,
      });
    } else if (!currentSlots.phone) {
      currentSlots.phone = text.replace(/\D/g, "").slice(-10);
      setSlots(currentSlots);
      newMsgs.push({
        who: "bot",
        text: "Which city is your property located in?",
        chips: ["Pune", "Mumbai", "New Delhi", "Bengaluru", "Hyderabad", "Jaipur"],
      });
    } else if (!currentSlots.city) {
      currentSlots.city = text.trim();
      setSlots(currentSlots);
      newMsgs.push({
        who: "bot",
        text: "Roughly how much is your average monthly electricity bill in Rupees?",
        chips: ["₹2,500", "₹4,500", "₹7,500", "₹12,000", "₹20,000+"],
      });
    } else if (!currentSlots.bill) {
      const num = parseInt(text.replace(/[^\d]/g, ""), 10) || 4500;
      currentSlots.bill = num;
      setSlots(currentSlots);
      newMsgs.push({
        who: "bot",
        text: "What type of rooftop does your building have?",
        chips: ["RCC flat terrace", "Sloped metal sheet", "Tiled roof", "Not sure"],
      });
    } else if (!currentSlots.roofType || currentSlots.roofType === "RCC flat terrace") {
      currentSlots.roofType = text;
      setSlots(currentSlots);
      newMsgs.push({
        who: "bot",
        text: "Do you know your approximate rooftop dimensions or usable area?",
        chips: [
          "About 30 × 40 ft (1,200 sq.ft)",
          "About 500 sq.ft",
          "I don't know my rooftop dimensions",
        ],
      });
    } else if (!currentSlots.dimensions) {
      currentSlots.dimensions = text;
      setSlots(currentSlots);
      newMsgs.push({
        who: "bot",
        text: "Any preference on system type? (On-grid for net-metering bill reduction, or Hybrid with battery backup)?",
        chips: ["On-grid (Recommended)", "Hybrid (with battery)", "Off-grid", "Recommend for me"],
      });
    } else if (!currentSlots.systemType || currentSlots.systemType === "On-grid") {
      currentSlots.systemType = text;
      setSlots(currentSlots);
      newMsgs.push({
        who: "bot",
        isSummary: true,
      });
    }

    setChatMessages(newMsgs);
    setInputVal("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUrls = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedPhotos((prev) => [...prev, ...newUrls]);
      setSlots((prev) => ({
        ...prev,
        photosCount: (prev.photosCount || 0) + files.length,
      }));
    }
  };

  const handleSubmitEnquiry = () => {
    solarStore.addLead({
      full_name: slots.name || "Customer",
      phone: slots.phone || "+91 98765 00000",
      email: slots.email || "customer@example.com",
      city: slots.city || "Pune",
      monthly_bill_avg: slots.bill || 4500,
      estimated_system_kw: estimate.systemKw,
      source: mode === "form" ? "Website form" : "Website — AI assessment",
      status: "new",
    });

    const conf = `ENQ-2026-${++enquiryCounter}`;
    setConfirmationId(conf);
    setMode("confirmed");
  };

  return (
    <div className="min-h-screen bg-[#F1F2EF] text-ink font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-[68px] border-b border-border bg-[#F1F2EF]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <SolarLogo size={36} />
          <span className="text-lg font-semibold tracking-tight text-ink">
            Solar<b className="text-forest">OS</b>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-soft text-xs font-medium text-forest border border-forest/15">
            <span className="size-1.5 rounded-full bg-[#A8CE45]" />
            Customer Portal
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5] transition-colors"
          >
            Staff Portal
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* State 1: Choose Mode (Select) */}
        {mode === "select" && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[24px] bg-[#C5D1C5] p-6 sm:p-10 border border-[#b4c3b4] shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 text-xs font-medium text-[#3b423a]">
                    <Sun className="size-3.5 text-forest" />
                    <span>Free Solar Sizing & Assessment</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-ink leading-tight">
                    Let&apos;s find the right solar solution for your property.
                  </h1>
                  <p className="text-sm sm:text-base text-[#4A5449] max-w-lg">
                    Tell us about your home or business. SolarOS will help assess your rooftop and recommend a suitable solar system with estimated savings and government subsidy.
                  </p>

                  {/* Two Options */}
                  <div className="grid grid-cols-1 gap-3.5 pt-2 max-w-md">
                    <button
                      onClick={() => setMode("ai")}
                      className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-left border border-border shadow-sm hover:border-forest/40 hover:shadow-md transition-all"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5DA] text-[#5A7613] group-hover:scale-105 transition-transform">
                        <Bot className="size-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink group-hover:text-forest transition-colors">
                          Start with AI Assistant
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Friendly guided conversation asking only what is needed — takes under 2 minutes.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setMode("form")}
                      className="group flex items-center gap-4 rounded-2xl bg-white p-4 text-left border border-border shadow-sm hover:border-forest/40 hover:shadow-md transition-all"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-forest group-hover:scale-105 transition-transform">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink group-hover:text-forest transition-colors">
                          Complete Solar Assessment Form
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Prefer standard forms? Fill in all technical and property details at your own pace.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <IsometricSolarLandscape className="w-full max-h-[260px] object-contain drop-shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 2: AI Conversational Experience */}
        {mode === "ai" && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-white shadow-card overflow-hidden flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-[#F7F8F5]">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#EEF5DA] text-[#5A7613]">
                  <Bot className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">SolarOS AI Advisor</h3>
                  <p className="text-[11px] text-muted-foreground">Smart requirement collection</p>
                </div>
              </div>
              <button
                onClick={() => setMode("form")}
                className="text-xs font-medium text-forest hover:underline"
              >
                Switch to manual form
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
              {chatMessages.map((msg, i) => (
                <div key={i} className="space-y-2">
                  {msg.isSummary ? (
                    <div className="rounded-2xl border border-border bg-[#F7F8F5] p-4 space-y-4 animate-in fade-in-0">
                      <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                        <Sparkles className="size-4" />
                        <span>Preliminary Assessment Summary</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-border">
                          <span className="text-muted-foreground text-[10.5px] uppercase">Name</span>
                          <div className="font-semibold text-ink">{slots.name || "Customer"}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-border">
                          <span className="text-muted-foreground text-[10.5px] uppercase">Contact</span>
                          <div className="font-semibold text-ink">{slots.phone || "—"}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-border">
                          <span className="text-muted-foreground text-[10.5px] uppercase">City</span>
                          <div className="font-semibold text-ink">{slots.city || "—"}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-border">
                          <span className="text-muted-foreground text-[10.5px] uppercase">Monthly Bill</span>
                          <div className="font-semibold text-ink">₹{(slots.bill || 4500).toLocaleString("en-IN")}</div>
                        </div>
                      </div>

                      {/* Calculations */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        <div className="p-2 rounded-xl bg-sage-soft text-center">
                          <div className="text-[10px] uppercase font-semibold text-forest">Suggested Size</div>
                          <div className="text-base font-bold text-ink">{estimate.systemKw} kW</div>
                        </div>
                        <div className="p-2 rounded-xl bg-sage-soft text-center">
                          <div className="text-[10px] uppercase font-semibold text-forest">Panels (545W)</div>
                          <div className="text-base font-bold text-ink">{estimate.panelCount}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-sage-soft text-center">
                          <div className="text-[10px] uppercase font-semibold text-forest">Generation / yr</div>
                          <div className="text-base font-bold text-ink">{estimate.annualGenKwh.toLocaleString("en-IN")} kWh</div>
                        </div>
                        <div className="p-2 rounded-xl bg-sage-soft text-center">
                          <div className="text-[10px] uppercase font-semibold text-forest">Est. Subsidy</div>
                          <div className="text-base font-bold text-ink">₹{estimate.subsidy.toLocaleString("en-IN")}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSubmitEnquiry}
                          className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="size-4" />
                          <span>Submit Solar Enquiry</span>
                        </button>
                        <button
                          onClick={() => setMode("form")}
                          className="px-4 h-10 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                        >
                          Edit details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex ${
                        msg.who === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.who === "user"
                            ? "bg-forest text-white rounded-tr-sm"
                            : "bg-sage-soft text-ink rounded-tl-sm border border-border/40"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.chips && (
                    <div className="flex flex-wrap gap-2 pt-1 pl-1">
                      {msg.chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleUserResponse(chip)}
                          className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-forest hover:bg-sage-soft transition-colors shadow-xs"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserResponse(inputVal);
              }}
              className="flex items-center gap-2 p-3 border-t border-border bg-white"
            >
              <input
                type="text"
                placeholder="Type your response..."
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
        )}

        {/* State 3: Manual Assessment Form */}
        {mode === "form" && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-white p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-ink">Complete Solar Assessment Form</h2>
                <p className="text-xs text-muted-foreground">All answers are saved and analyzed</p>
              </div>
              <button
                onClick={() => setMode("ai")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
              >
                <Bot className="size-3.5" />
                <span>Use AI Assistant</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitEnquiry();
              }}
              className="space-y-4"
            >
              {/* Customer Information */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  1. Customer Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={slots.name || ""}
                      onChange={(e) => setSlots({ ...slots, name: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="10-digit mobile"
                      value={slots.phone || ""}
                      onChange={(e) => setSlots({ ...slots, phone: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Property */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  2. Location & Rooftop
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">City *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Pune"
                      value={slots.city || ""}
                      onChange={(e) => setSlots({ ...slots, city: e.target.value })}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">Monthly Electric Bill (₹) *</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 4500"
                      value={slots.bill || ""}
                      onChange={(e) => setSlots({ ...slots, bill: Number(e.target.value) })}
                      className="w-full h-9 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">Roof Type</label>
                    <select
                      value={slots.roofType || "RCC flat terrace"}
                      onChange={(e) => setSlots({ ...slots, roofType: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
                    >
                      <option>RCC flat terrace</option>
                      <option>Sloped metal sheet</option>
                      <option>Tiled roof</option>
                      <option>Not sure</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink block mb-1">System Preference</label>
                    <select
                      value={slots.systemType || "On-grid"}
                      onChange={(e) => setSlots({ ...slots, systemType: e.target.value })}
                      className="w-full h-9 px-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-forest"
                    >
                      <option>On-grid</option>
                      <option>Hybrid (with battery)</option>
                      <option>Off-grid</option>
                      <option>Not sure — recommend one</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Photo Upload (Drag & Drop) */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  3. Rooftop Photos (Optional)
                </div>
                <label className="border-2 border-dashed border-border hover:border-forest/50 bg-[#FAFBF8] rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                  <Upload className="size-6 text-muted-foreground mb-1.5" />
                  <span className="text-xs font-semibold text-ink">
                    Upload photos of rooftop, terrace obstacles, or meter board
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    JPG/PNG files up to 10 MB each
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedPhotos.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {uploadedPhotos.map((url, i) => (
                      <div key={i} className="relative size-14 rounded-lg overflow-hidden border border-border">
                        <img src={url} alt="Rooftop" className="size-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode("select")}
                  className="px-4 h-9 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 h-10 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 shadow-sm"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Submit Assessment Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* State 4: Confirmation Success */}
        {mode === "confirmed" && (
          <div className="max-w-md mx-auto rounded-3xl border border-border bg-white p-8 text-center shadow-card space-y-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#E5F0E6] text-[#3F7A48] mx-auto">
              <CheckCircle2 className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-ink">Thank you, {slots.name}!</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your solar assessment request has been recorded with reference{" "}
              <b className="font-mono text-ink">{confirmationId}</b>. A certified SolarOS engineer will review your preliminary report and arrange a free site survey.
            </p>

            <div className="rounded-2xl bg-[#F7F8F5] p-3.5 text-left text-xs space-y-2 border border-border/60">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Size:</span>
                <span className="font-semibold text-ink">{estimate.systemKw} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Annual Savings:</span>
                <span className="font-semibold text-forest">₹{estimate.annualSavings.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. PM Surya Ghar Subsidy:</span>
                <span className="font-semibold text-ink">₹{estimate.subsidy.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 shadow-sm"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setSlots({});
                  setMode("select");
                }}
                className="h-9 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5]"
              >
                Submit another property
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
