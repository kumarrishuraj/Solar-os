// =============================================================================
// SolarOS — Rooftop analysis (initial stub; being expanded)
// =============================================================================

import type { RoofAnalysisInput, RoofAnalysisResult, RoofImageInput } from "./types";

export const ROOF_ANALYSIS_DISCLAIMER =
  "AI rooftop assessment is preliminary. Final installation suitability requires verified measurements, structural inspection and electrical assessment.";

export function analyzeRoofDemo(input: RoofAnalysisInput): RoofAnalysisResult {
  return {
    analysis_id: `demo-${input.images.map((image) => image.id).join("-") || "empty"}`,
    source: "demo",
    model_name: "SolarOS Roof Vision (demonstration)",
    calibrated: false,
    roof_regions: [],
    obstacles: [],
    shading_regions: [],
    panel_layout: [],
    missing_information: [],
    recommendations: [],
    disclaimer: ROOF_ANALYSIS_DISCLAIMER,
  };
}

export function adaptBackendRoofAnalysis(raw: unknown, images: RoofImageInput[]): RoofAnalysisResult {
  void raw;
  return { ...analyzeRoofDemo({ images }), source: "model", model_name: "SolarOS Roof Vision" };
}
