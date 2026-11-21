"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Scan,
  Sparkles,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Check,
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface Obstacle {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

export default function AssessmentPage() {
  const [hasImage, setHasImage] = useState(true); // default loaded with sample
  const [analysisState, setAnalysisState] = useState<"idle" | "running" | "done">("done");
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const [layers, setLayers] = useState({
    roof: true,
    obstacles: true,
    shading: true,
    panels: true,
  });

  const obstacles: Obstacle[] = [
    { name: "Water tank", x: 72, y: 52, w: 52, h: 52, confidence: 0.93 },
    { name: "Staircase room", x: 264, y: 36, w: 88, h: 80, confidence: 0.88 },
    { name: "Dish antenna", x: 172, y: 216, w: 36, h: 28, confidence: 0.71 },
  ];

  const runAnalysis = () => {
    setAnalysisState("running");
    setTimeout(() => {
      setAnalysisState("done");
      toast.success("Rooftop analyzed — 3 obstacles and 1 shading region detected.");
    }, 1800);
  };

  const handleApprove = () => {
    setReviewStatus("Approved for site survey by Lead Engineer. Surveyor will verify measurements on site.");
    toast.success("Assessment approved — site survey scheduled.");
  };

  const handleRequestChanges = () => {
    setReviewStatus("Changes requested: Additional photograph of west facade and distribution board needed.");
    toast.warning("Requested additional photos from customer.");
  };

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              AI Rooftop Assessment
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Analyze drone or terrace photos to detect roof regions, obstacles and shading before the site visit.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-soft text-xs font-semibold text-forest w-fit">
            <Sparkles className="size-3.5" />
            <span>Computer Vision Engine</span>
          </span>
        </div>

        {/* Disclaimer Banner */}
        <div className="flex items-start gap-3 rounded-2xl bg-[#F8EFDB] p-4 text-xs text-[#8C6318] border border-[#d9a441]/30">
          <AlertTriangle className="size-4 shrink-0 mt-0.5 text-[#D9A441]" />
          <div>
            <b className="font-semibold text-ink">AI rooftop assessment is preliminary.</b> Final installation suitability requires physical verified measurements, structural load inspection, and electrical utility interconnection review.
          </div>
        </div>

        {/* Main 2-column Analysis Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Annotated Rooftop Viewer Canvas (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-border bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sage-soft text-forest">
                  <Scan className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Terrace Visualizer</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {hasImage ? "Sample terrace · Baner, Pune" : "No image selected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHasImage(!hasImage)}
                  className="text-xs font-medium text-forest hover:underline"
                >
                  {hasImage ? "Clear image" : "Load sample"}
                </button>
              </div>
            </div>

            {/* Canvas Stage */}
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#DDD8CC] border border-border">
              {hasImage ? (
                <>
                  {/* Base Realistic Rooftop SVG */}
                  <svg className="absolute inset-0 size-full object-cover" viewBox="0 0 400 300">
                    <rect width="400" height="300" fill="#B9B3A6" />
                    <rect x="34" y="28" width="332" height="240" fill="#D9D3C7" />
                    <rect x="34" y="28" width="332" height="240" fill="none" stroke="#A39C8E" strokeWidth="8" />
                    {Array.from({ length: 12 }, (_, i) => (
                      <line
                        key={i}
                        x1={40 + i * 28}
                        y1={32}
                        x2={40 + i * 28}
                        y2={264}
                        stroke="#CFC8BB"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Staircase cabin */}
                    <rect x="264" y="36" width="88" height="80" fill="#C2BBAE" stroke="#AFA799" strokeWidth="2" />
                    <rect x="272" y="44" width="72" height="64" fill="#B0A99B" />
                    {/* Water tank */}
                    <circle cx="98" cy="78" r="26" fill="#2F3530" />
                    <circle cx="98" cy="78" r="18" fill="#3B423A" />
                    {/* Dish Antenna */}
                    <circle cx="188" cy="230" r="14" fill="#8C8F8A" />
                    <rect x="194" y="226" width="22" height="4" fill="#6F726D" />
                    {/* Trees shadow west side */}
                    <circle cx="20" cy="150" r="46" fill="#5E8155" />
                    <circle cx="8" cy="120" r="34" fill="#6F9563" />
                    <circle cx="26" cy="196" r="30" fill="#557A4C" />
                    <path d="M34 112 Q 80 150 34 210 Z" fill="#292C29" opacity="0.22" />
                  </svg>

                  {/* Computer Vision Annotation Layer */}
                  {analysisState === "done" && (
                    <svg className="absolute inset-0 size-full pointer-events-none" viewBox="0 0 400 300">
                      <defs>
                        <pattern
                          id="shadeHatch"
                          width="8"
                          height="8"
                          patternUnits="userSpaceOnUse"
                          patternTransform="rotate(45)"
                        >
                          <rect width="8" height="8" fill="rgba(217,164,65,0.2)" />
                          <line x1="0" y1="0" x2="0" y2="8" stroke="#D9A441" strokeWidth="2" opacity="0.6" />
                        </pattern>
                      </defs>

                      {/* 1. Usable Roof Boundary */}
                      {layers.roof && (
                        <g>
                          <polygon
                            points="44,38 356,38 356,260 44,260"
                            fill="rgba(168,206,69,0.12)"
                            stroke="#A8CE45"
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                          />
                          <text
                            x="52"
                            y="56"
                            fill="#FFFFFF"
                            fontSize="10"
                            fontWeight="bold"
                            stroke="#252925"
                            strokeWidth="2"
                            paintOrder="stroke"
                          >
                            Usable Roof Region: 68%
                          </text>
                        </g>
                      )}

                      {/* 2. Shading Area */}
                      {layers.shading && (
                        <g>
                          <polygon
                            points="34,108 88,135 88,200 34,216"
                            fill="url(#shadeHatch)"
                            stroke="#D9A441"
                            strokeWidth="1.5"
                          />
                          <text x="40" y="150" fill="#D9A441" fontSize="9" fontWeight="bold">
                            Shading zone
                          </text>
                        </g>
                      )}

                      {/* 3. Panel Grid Arrangement */}
                      {layers.panels && (
                        <g>
                          {Array.from({ length: 3 }).map((_, row) =>
                            Array.from({ length: 4 }).map((_, col) => {
                              const px = 130 + col * 30;
                              const py = 130 + row * 40;
                              return (
                                <g key={`${row}-${col}`}>
                                  <rect
                                    x={px}
                                    y={py}
                                    width={26}
                                    height={34}
                                    fill="rgba(47,59,71,0.85)"
                                    stroke="#8FA3B6"
                                    strokeWidth="0.8"
                                    rx="1"
                                  />
                                  <line
                                    x1={px + 13}
                                    y1={py}
                                    x2={px + 13}
                                    y2={py + 34}
                                    stroke="#8FA3B6"
                                    strokeWidth="0.5"
                                    opacity="0.6"
                                  />
                                </g>
                              );
                            })
                          )}
                        </g>
                      )}

                      {/* 4. Detected Obstacles with Bounding Boxes */}
                      {layers.obstacles &&
                        obstacles.map((obs) => (
                          <g key={obs.name}>
                            <rect
                              x={obs.x}
                              y={obs.y}
                              width={obs.w}
                              height={obs.h}
                              fill="rgba(201,107,97,0.18)"
                              stroke="#C96B61"
                              strokeWidth="2"
                              rx="3"
                            />
                            <rect
                              x={obs.x}
                              y={obs.y - 16}
                              width={obs.name.length * 6 + 32}
                              height={15}
                              fill="#C96B61"
                              rx="3"
                            />
                            <text
                              x={obs.x + 4}
                              y={obs.y - 5}
                              fill="#FFFFFF"
                              fontSize="9.5"
                              fontWeight="bold"
                            >
                              {obs.name} {Math.round(obs.confidence * 100)}%
                            </text>
                          </g>
                        ))}
                    </svg>
                  )}

                  {/* Processing Spinner Overlay */}
                  {analysisState === "running" && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white">
                      <div className="size-9 rounded-full border-3 border-white/20 border-t-[#A8CE45] animate-spin" />
                      <div className="text-xs font-semibold">Running Computer Vision Model...</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="size-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <Upload className="size-8 mb-2" />
                  <p className="text-xs font-medium">No rooftop image uploaded</p>
                  <button
                    onClick={() => setHasImage(true)}
                    className="mt-2 text-xs font-semibold text-forest hover:underline"
                  >
                    Load sample Baner terrace
                  </button>
                </div>
              )}
            </div>

            {/* Layer Controls & Re-run Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-ink flex items-center gap-1.5 mr-1">
                  <Layers className="size-3.5 text-muted-foreground" />
                  Layers:
                </span>
                {(["roof", "obstacles", "shading", "panels"] as (keyof typeof layers)[]).map((key) => (
                  <label
                    key={key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-[#F7F8F5] text-xs font-medium text-ink cursor-pointer hover:bg-sage-soft transition-colors capitalize"
                  >
                    <input
                      type="checkbox"
                      checked={layers[key]}
                      onChange={(e) => setLayers({ ...layers, [key]: e.target.checked })}
                      className="size-3 rounded accent-forest"
                    />
                    <span>{key}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={runAnalysis}
                disabled={analysisState === "running"}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm disabled:opacity-50"
              >
                <Sparkles className="size-3.5 text-[#A8CE45]" />
                <span>Re-analyze</span>
              </button>
            </div>
          </div>

          {/* Right: Assessment Report & Human Review (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-border bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">AI Detection Report</h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8EFDB] text-[11px] font-semibold text-[#8C6318]">
                Preliminary
              </span>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F7F8F5] border border-border/60">
                <div className="text-[10.5px] font-semibold uppercase text-muted-foreground">
                  Usable Roof Share
                </div>
                <div className="text-xl font-bold text-ink mt-0.5">68%</div>
                <div className="text-[11px] text-muted-foreground">approx. 62 m² clear</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F8F5] border border-border/60">
                <div className="text-[10.5px] font-semibold uppercase text-muted-foreground">
                  Est. Shading Loss
                </div>
                <div className="text-xl font-bold text-[#D9A441] mt-0.5">8%</div>
                <div className="text-[11px] text-muted-foreground">west tree canopy</div>
              </div>
            </div>

            {/* Detections List */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Detected Obstacles
              </div>
              <div className="space-y-2">
                {obstacles.map((obs) => (
                  <div
                    key={obs.name}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FAFBF8] border border-border/60"
                  >
                    <span className="font-medium text-ink">{obs.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[#ECEEE9] overflow-hidden">
                        <div
                          className="h-full bg-forest rounded-full"
                          style={{ width: `${obs.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-muted-foreground">
                        {Math.round(obs.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Panel Arrangement */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Potential Layout
              </div>
              <p className="text-xs text-ink leading-relaxed">
                Approx. <b className="font-bold">12 modules</b> (≈ 6.54 kWp with 545 W Mono PERC panels) can be installed in a south-facing 3×4 array without conflict from terrace structures.
              </p>
            </div>

            {/* Missing Information Checklist */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Missing Information for Verification
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Exact laser tape measurements of terrace boundary</li>
                <li>Roof tilt angle and compass orientation verification</li>
                <li>Slab load-bearing age and structural condition</li>
                <li>Clear photograph of the electricity meter / distribution box</li>
              </ul>
            </div>

            {/* Human Review Section */}
            <div className="pt-3 border-t border-border space-y-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Engineer Review & Approval
              </div>

              {reviewStatus ? (
                <div className="p-3 rounded-xl bg-[#E5F0E6] text-xs text-[#3F7A48] border border-forest/20 flex items-start gap-2">
                  <ShieldCheck className="size-4 shrink-0 mt-0.5 text-forest" />
                  <div>{reviewStatus}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Reviewer notes (optional)..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    className="w-full h-8 px-3 rounded-xl border border-border text-xs focus:outline-none focus:border-forest"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition-colors shadow-sm"
                    >
                      <Check className="size-4" />
                      <span>Approve for Site Survey</span>
                    </button>
                    <button
                      onClick={handleRequestChanges}
                      className="px-3 h-9 rounded-xl border border-border bg-white text-xs font-medium text-ink hover:bg-[#F7F8F5]"
                    >
                      Request changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
