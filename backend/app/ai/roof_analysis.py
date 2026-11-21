"""Rooftop Analysis & Obstacle Segmentation Module.

Uses YOLO and OpenCV to detect rooftop boundaries, identify obstructions
(chimneys, vents, HVAC units, skylights), and calculate net usable surface area.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Bounding box coordinates for detected rooftop features."""

    x_min: float = Field(..., description="Top-left X coordinate")
    y_min: float = Field(..., description="Top-left Y coordinate")
    x_max: float = Field(..., description="Bottom-right X coordinate")
    y_max: float = Field(..., description="Bottom-right Y coordinate")


class DetectedObstacle(BaseModel):
    """Detected rooftop obstruction details."""

    obstacle_type: str = Field(..., description="Obstacle class: chimney, hvac, vent, skylight, tree_shade")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score")
    bounding_box: BoundingBox
    estimated_area_sqm: float = Field(..., ge=0.0, description="Estimated obstacle footprint area in square meters")


class RoofAnalysisResult(BaseModel):
    """Output summary of rooftop vision analysis."""

    total_roof_area_sqm: float = Field(..., description="Total computed roof area")
    usable_roof_area_sqm: float = Field(..., description="Net usable area excluding obstacles and safety setbacks")
    detected_obstacles: List[DetectedObstacle] = Field(default_factory=list, description="List of identified obstacles")
    shading_index: float = Field(0.05, ge=0.0, le=1.0, description="Estimated shading loss coefficient (0.0 to 1.0)")
    suggested_tilt_degrees: Optional[float] = Field(None, description="Inferred roof slope in degrees")
    suggested_azimuth_degrees: Optional[float] = Field(None, description="Inferred roof orientation (180 = South)")


class RooftopAnalyzer:
    """Analyzer service for satellite and aerial imagery processing."""

    def __init__(self, model_weights_path: Optional[str] = None, confidence_threshold: float = 0.45):
        """Initialize analyzer with YOLO model path and inference confidence threshold."""
        self.model_weights_path = model_weights_path
        self.confidence_threshold = confidence_threshold
        self._model = None  # Lazily loaded when actual weights are provided

    def analyze_image(self, image_bytes: bytes, ground_sampling_distance_cm: float = 5.0) -> RoofAnalysisResult:
        """Process input aerial imagery and perform obstacle segmentation.

        Args:
            image_bytes: Raw bytes of uploaded aerial / satellite image.
            ground_sampling_distance_cm: Ground resolution scale (cm per pixel) for area scaling.

        Returns:
            RoofAnalysisResult containing usable surface area and obstacle list.
        """
        # Placeholder: In the next iteration, load YOLO model (e.g. YOLOv8x-seg)
        # and OpenCV contours to extract polygons, compute mask areas, and calculate net usable area.
        raise NotImplementedError(
            "RooftopAnalyzer.analyze_image requires trained YOLO weights and OpenCV segmentation pipeline."
        )
